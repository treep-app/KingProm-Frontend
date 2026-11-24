/**
 * Public voucher pass API (guest QR / share links — no dashboard login).
 */

export async function validateVoucherPass({ v, token } = {}) {
  const param = v || token;
  if (!param) {
    return {
      ok: false,
      status: 400,
      data: { status: 'INVALID', message: 'Missing voucher token.' },
    };
  }

  const qs = v ? `v=${encodeURIComponent(v)}` : `token=${encodeURIComponent(token)}`;
  try {
    const res = await fetch(`/api/voucher/validate?${qs}`, {
      method: 'GET',
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch {
    return {
      ok: false,
      status: 0,
      data: {
        status: 'ERROR',
        message: 'Unable to reach the voucher service.',
      },
    };
  }
}