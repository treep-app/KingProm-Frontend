/**
 * Normalize admin API failures into safe, operator-facing copy.
 * Never surface stack traces, SQL, or internal paths to the UI.
 */

/** @typedef {'ok'|'unauthorized'|'forbidden'|'not_found'|'validation'|'network'|'unavailable'|'server'|'unknown'} ApiErrorKind */

const UNSAFE_MESSAGE_RE =
  /at\s+\S+\s+\(|^\s*Error:\s|stack trace|node_modules|\/Users\/|\/home\/|\\Users\\|ECONNREFUSED|ENOTFOUND|postgres|neon\.tech|DATABASE_URL|passwordHash|Bearer\s+[A-Za-z0-9._-]+/i;

/**
 * True when a backend message looks like an internal/debug dump.
 */
export function isUnsafeErrorMessage(message) {
  if (message == null) return true;
  const text = String(message).trim();
  if (!text) return true;
  if (text.length > 280) return true;
  if (text.includes('\n') && text.split('\n').length > 3) return true;
  return UNSAFE_MESSAGE_RE.test(text);
}

/**
 * Prefer a safe backend message; otherwise use the fallback.
 */
export function safeApiMessage(raw, fallback = 'Something went wrong. Please try again.') {
  if (raw == null) return fallback;
  const text = String(raw).trim();
  if (!text || isUnsafeErrorMessage(text)) return fallback;
  return text;
}

/**
 * Classify an API result for UI decisions (banner vs toast, login link, etc.).
 * @param {{ ok?: boolean, status?: number, networkError?: boolean, data?: { status?: string, message?: string } } | null} result
 * @returns {ApiErrorKind}
 */
export function classifyApiResult(result) {
  if (!result) return 'unknown';
  if (result.ok) return 'ok';
  if (result.networkError || result.status === 0) return 'network';
  if (result.status === 401) return 'unauthorized';
  if (result.status === 403) return 'forbidden';
  if (result.status === 404 || result.data?.status === 'NOT_FOUND') return 'not_found';
  if (
    result.status === 400 ||
    result.status === 422 ||
    result.data?.status === 'INVALID'
  ) {
    return 'validation';
  }
  if (result.status === 503) return 'unavailable';
  if (result.status >= 500) return 'server';
  return 'unknown';
}

/**
 * Default user-facing copy by HTTP / error kind.
 */
function defaultMessageForKind(kind, fallback) {
  switch (kind) {
    case 'unauthorized':
      return 'Your session expired. Please sign in again.';
    case 'forbidden':
      return 'You do not have permission for this action.';
    case 'not_found':
      return fallback || 'The requested item was not found.';
    case 'validation':
      return fallback || 'Please check the form and try again.';
    case 'network':
      return 'Network error. Check your connection and try again.';
    case 'unavailable':
      return 'Service temporarily unavailable. Please try again shortly.';
    case 'server':
      return fallback || 'Something went wrong. Please try again.';
    default:
      return fallback || 'Something went wrong. Please try again.';
  }
}

/**
 * Normalize admin API failures into operator-facing copy.
 *
 * @param {{ ok?: boolean, status?: number, networkError?: boolean, data?: { message?: string, status?: string, errors?: Record<string, string> } } | null} result
 * @param {string} fallback
 * @param {{ resource?: 'campaign'|'promo'|'ticket'|'customer'|'generic' }} [options]
 */
export function messageFromApiResult(
  result,
  fallback = 'Something went wrong. Please try again.',
  options = {},
) {
  if (!result) return fallback;

  const kind = classifyApiResult(result);
  const resource = options.resource || 'generic';

  if (kind === 'not_found') {
    const resourceFallback =
      resource === 'campaign'
        ? 'Campaign not found.'
        : resource === 'promo' || resource === 'ticket'
          ? 'Promo code not found.'
          : resource === 'customer'
            ? 'Customer not found.'
            : fallback;
    return safeApiMessage(result.data?.message, resourceFallback);
  }

  if (kind === 'unauthorized' || kind === 'forbidden' || kind === 'network' || kind === 'unavailable') {
    return safeApiMessage(result.data?.message, defaultMessageForKind(kind, fallback));
  }

  if (kind === 'validation') {
    return safeApiMessage(result.data?.message, defaultMessageForKind(kind, fallback));
  }

  if (kind === 'server' || kind === 'unknown') {
    return safeApiMessage(result.data?.message, defaultMessageForKind(kind, fallback));
  }

  return safeApiMessage(result.data?.message, fallback);
}

/**
 * Normalize thrown/network exceptions — never show raw TypeError / stack text.
 * @param {unknown} error
 * @param {string} [fallback]
 */
export function messageFromCaughtError(
  error,
  fallback = 'Network error. Check your connection and try again.',
) {
  if (!error) return fallback;

  if (typeof error === 'object' && error !== null) {
    // Already-normalized API-shaped object
    if ('ok' in error || 'status' in error) {
      return messageFromApiResult(error, fallback);
    }
    const name = 'name' in error ? String(error.name || '') : '';
    const code = 'code' in error ? String(error.code || '') : '';
    if (
      name === 'TypeError' ||
      name === 'NetworkError' ||
      code === 'NETWORK_ERROR' ||
      /failed to fetch|networkerror|load failed|network request failed/i.test(
        String(error.message || ''),
      )
    ) {
      return fallback;
    }
    return safeApiMessage(error.message, fallback);
  }

  return safeApiMessage(error, fallback);
}

/**
 * Pull field-level errors from an API payload when present.
 * Also maps a few known campaign validation messages onto fields.
 *
 * @param {{ data?: { errors?: Record<string, string>, message?: string, status?: string } } | null} result
 * @returns {Record<string, string>}
 */
export function fieldErrorsFromApiResult(result) {
  const errors = result?.data?.errors;
  if (errors && typeof errors === 'object' && !Array.isArray(errors)) {
    const out = {};
    for (const [key, value] of Object.entries(errors)) {
      const safe = safeApiMessage(value, '');
      if (safe) out[key] = safe;
    }
    if (Object.keys(out).length) return out;
  }

  const message = String(result?.data?.message || '').trim();
  if (!message || isUnsafeErrorMessage(message)) return {};

  const lower = message.toLowerCase();
  /** @type {Record<string, string>} */
  const mapped = {};

  if (lower.includes('name is required') || lower.includes('campaign name')) {
    mapped.name = safeApiMessage(message, 'Campaign name is required.');
  } else if (lower.includes('discount')) {
    mapped.discountValue = safeApiMessage(message, 'Invalid discount value.');
  } else if (lower.includes('starts') || lower.includes('ends') || lower.includes('validit')) {
    const text = safeApiMessage(message, 'Invalid validity dates.');
    mapped.endsAt = text;
    mapped.endDate = text;
    mapped.startsAt = text;
    mapped.startDate = text;
  } else if (lower.includes('usage') || lower.includes('max uses') || lower.includes('maxuses')) {
    mapped.maxUses = safeApiMessage(message, 'Invalid usage configuration.');
  } else if (lower.includes('quantity') || lower.includes('prefix')) {
    const text = safeApiMessage(message, 'Invalid promo code quantity.');
    mapped.quantity = text;
    if (lower.includes('prefix')) mapped.codePrefix = text;
  } else if (lower.includes('expir')) {
    mapped.expiresAt = safeApiMessage(message, 'Invalid expiry configuration.');
  }

  return mapped;
}

/**
 * Safe message for nested generationError on create/update responses.
 */
export function messageFromGenerationError(
  generationError,
  fallback = 'Unable to generate promo codes. Please try again.',
) {
  if (!generationError) return fallback;
  return safeApiMessage(generationError.message, fallback);
}

/**
 * @param {{ ok?: boolean, status?: number, networkError?: boolean } | null} result
 */
export function isAuthFailure(result) {
  const kind = classifyApiResult(result);
  return kind === 'unauthorized' || kind === 'forbidden';
}

/**
 * @param {{ ok?: boolean, status?: number, networkError?: boolean } | null} result
 */
export function isNotFound(result) {
  return classifyApiResult(result) === 'not_found';
}

/**
 * Convenience: build props for AlertBanner from an API result.
 */
export function alertPropsFromApiResult(result, fallback) {
  const kind = classifyApiResult(result);
  const message = messageFromApiResult(result, fallback);
  return {
    kind,
    message,
    showSignIn: kind === 'unauthorized',
    href: kind === 'unauthorized' ? '/dashboard/login' : null,
    linkLabel: kind === 'unauthorized' ? 'Sign in' : null,
  };
}
