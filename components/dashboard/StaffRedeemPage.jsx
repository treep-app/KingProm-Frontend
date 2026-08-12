'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  CheckCircle2,
  Keyboard,
  QrCode,
  ScanLine,
} from 'lucide-react';
import { PERMISSIONS } from '../../lib/permissions';
import * as redemptionService from '../../lib/api/redemptionService';
import { messageFromApiResult } from '../../lib/api/errors';
import { formatDate, formatDateTime } from '../../lib/format';
import { DASH_INPUT_CLASS, DASH_SELECT_CLASS } from '../../lib/dashboard/styles';
import AuthGate from './AuthGate';
import ConfirmDialog from './ConfirmDialog';
import { ApiErrorBanner } from './AlertBanner';
import { useToast } from './ToastProvider';
import { useRedemptionPermissions } from './WorkspaceProvider';
import {
  Button,
  LoadingState,
  PageContainer,
  PageHeader,
  StatusBadge,
} from './ui';

const TABS = [
  { id: 'scan', label: 'Scan QR', icon: QrCode },
  { id: 'manual', label: 'Enter Promo Code', icon: Keyboard },
];

function normalizePromoInput(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

function extractTokenFromQuery(searchParams) {
  return (
    searchParams.get('v') ||
    searchParams.get('token') ||
    ''
  ).trim();
}

function VoucherCard({ voucher }) {
  const customerName = voucher?.customer?.name || 'Guest';
  const usageText =
    voucher?.usageLimit == null
      ? `${voucher?.timesRedeemed ?? 0} redeemed · unlimited`
      : `${voucher?.timesRedeemed ?? 0} / ${voucher.usageLimit} uses`;

  return (
    <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
            Valid voucher
          </p>
          <p className="mt-1 text-lg font-semibold text-[var(--dash-ink)]">
            {voucher?.campaignName || 'Campaign'}
          </p>
          {voucher?.offer ? (
            <p className="mt-0.5 text-sm text-[var(--dash-ink-soft)]">{voucher.offer}</p>
          ) : null}
        </div>
        <StatusBadge status="VALID" />
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-[var(--dash-muted)]">Promo code</dt>
          <dd className="mt-0.5 font-mono text-lg font-bold tracking-wider text-[var(--dash-ink)]">
            {voucher?.promoCode}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--dash-muted)]">Customer</dt>
          <dd className="mt-0.5 text-sm text-[var(--dash-ink)]">{customerName}</dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--dash-muted)]">Expires</dt>
          <dd className="mt-0.5 text-sm text-[var(--dash-ink)]">
            {formatDate(voucher?.expiresAt) || '—'}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--dash-muted)]">Usage</dt>
          <dd className="mt-0.5 text-sm text-[var(--dash-ink)]">{usageText}</dd>
        </div>
      </dl>
    </div>
  );
}

function ResultState({ status, message, onReset }) {
  const configs = {
    EXPIRED: {
      title: 'Voucher expired',
      icon: AlertCircle,
      tone: 'text-amber-900 bg-amber-50 border-amber-200',
    },
    REDEEMED: {
      title: 'Already redeemed',
      icon: AlertCircle,
      tone: 'text-slate-800 bg-slate-50 border-slate-200',
    },
    INVALID: {
      title: 'Invalid voucher',
      icon: AlertCircle,
      tone: 'text-rose-900 bg-rose-50 border-rose-200',
    },
  };
  const config = configs[status] || configs.INVALID;
  const Icon = config.icon;

  return (
    <div className={`rounded-2xl border p-6 text-center ${config.tone}`}>
      <Icon className="mx-auto size-10" aria-hidden />
      <h2 className="mt-3 text-lg font-semibold">{config.title}</h2>
      <p className="mt-2 text-sm opacity-90">{message}</p>
      <Button type="button" className="mt-5 min-h-12 w-full sm:w-auto" onClick={onReset}>
        Try another voucher
      </Button>
    </div>
  );
}

function QrScanner({ active, onDetect, onError }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const lastScanRef = useRef('');
  const detectorRef = useRef(null);

  const stopCamera = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (!active) {
      stopCamera();
      return undefined;
    }

    let cancelled = false;

    async function start() {
      if (typeof window === 'undefined' || !window.BarcodeDetector) {
        onError?.('unsupported');
        return;
      }

      try {
        detectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] });
      } catch {
        onError?.('unsupported');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        async function tick() {
          if (cancelled || !videoRef.current || !detectorRef.current) return;
          try {
            const codes = await detectorRef.current.detect(videoRef.current);
            const raw = codes?.[0]?.rawValue;
            if (raw && raw !== lastScanRef.current) {
              lastScanRef.current = raw;
              onDetect(raw);
            }
          } catch {
            // ignore frame errors
          }
          rafRef.current = requestAnimationFrame(tick);
        }
        rafRef.current = requestAnimationFrame(tick);
      } catch (err) {
        if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
          onError?.('denied');
        } else {
          onError?.('camera');
        }
      }
    }

    start();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [active, onDetect, onError, stopCamera]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--dash-border)] bg-black">
      <video
        ref={videoRef}
        className="aspect-[4/3] w-full object-cover"
        playsInline
        muted
        aria-label="Camera preview for QR scanning"
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="size-48 rounded-xl border-2 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
      </div>
    </div>
  );
}

function StaffRedeemInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const perm = useRedemptionPermissions();

  const [tab, setTab] = useState('scan');
  const [manualCode, setManualCode] = useState('');
  const [phase, setPhase] = useState('idle');
  const [validationStatus, setValidationStatus] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const [voucher, setVoucher] = useState(null);
  const [validationInput, setValidationInput] = useState({ token: '', code: '' });
  const [locations, setLocations] = useState([]);
  const [locationKey, setLocationKey] = useState('');
  const [notes, setNotes] = useState('');
  const [scannerError, setScannerError] = useState('');
  const [apiError, setApiError] = useState('');
  const [apiErrorResult, setApiErrorResult] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [redeemBusy, setRedeemBusy] = useState(false);
  const [successRedemption, setSuccessRedemption] = useState(null);
  const [scannerSupported, setScannerSupported] = useState(false);
  const autoValidatedRef = useRef(false);

  useEffect(() => {
    setScannerSupported(typeof window !== 'undefined' && 'BarcodeDetector' in window);
  }, []);

  const loadLocations = useCallback(async () => {
    const result = await redemptionService.listRedemptionLocations();
    if (result.ok) {
      setLocations(result.data.locations || []);
    }
  }, []);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  const resetFlow = useCallback(() => {
    setPhase('idle');
    setValidationStatus('');
    setValidationMessage('');
    setVoucher(null);
    setValidationInput({ token: '', code: '' });
    setLocationKey('');
    setNotes('');
    setApiError('');
    setApiErrorResult(null);
    setSuccessRedemption(null);
    setScannerError('');
    autoValidatedRef.current = false;
  }, []);

  const runValidate = useCallback(
    async ({ token = '', code = '' } = {}) => {
      if (!perm.validate) {
        toast.error('You do not have permission to validate vouchers.');
        return;
      }

      setPhase('validating');
      setApiError('');
      setApiErrorResult(null);
      setValidationStatus('');
      setValidationMessage('');
      setVoucher(null);
      setSuccessRedemption(null);

      const payload = token ? { token } : { code: normalizePromoInput(code) };
      setValidationInput(payload);

      const result = await redemptionService.validateRedemption(payload);
      const classified = String(
        result.data?.result || result.data?.status || '',
      ).toUpperCase();

      if (!result.ok && !classified) {
        setPhase('idle');
        setApiErrorResult(result);
        setApiError(
          messageFromApiResult(result, 'Unable to check this voucher. Please try again.', {
            resource: 'voucher',
          }),
        );
        return;
      }

      setValidationStatus(classified);
      setValidationMessage(result.data?.message || '');
      setVoucher(result.data?.voucher || null);

      if (classified === 'VALID') {
        setPhase('valid');
      } else {
        setPhase('result');
      }
    },
    [perm.validate, toast],
  );

  useEffect(() => {
    const token = extractTokenFromQuery(searchParams);
    if (!token || autoValidatedRef.current) return;
    autoValidatedRef.current = true;
    setTab('scan');
    runValidate({ token });
  }, [searchParams, runValidate]);

  function handleScannerDetect(raw) {
    runValidate({ token: raw });
  }

  function handleScannerError(kind) {
    if (kind === 'unsupported') {
      setScannerError(
        'QR scanning is not supported in this browser. Switch to manual promo code entry below.',
      );
      setTab('manual');
    } else if (kind === 'denied') {
      setScannerError(
        'Camera access was denied. Allow camera permission or use manual promo code entry.',
      );
    } else {
      setScannerError('Unable to start the camera. Use manual promo code entry instead.');
    }
  }

  async function handleRedeemConfirm() {
    if (!perm.redeem) {
      toast.error('You do not have permission to redeem vouchers.');
      return;
    }

    const selected = locations.find((loc) => loc.key === locationKey);
    setRedeemBusy(true);
    setApiError('');
    setApiErrorResult(null);

    const result = await redemptionService.redeemVoucher({
      ...validationInput,
      locationKey: selected?.key || locationKey || undefined,
      locationLabel: selected?.label || undefined,
      notes: notes.trim() || undefined,
      confirm: true,
    });

    setRedeemBusy(false);
    setConfirmOpen(false);

    const classified = String(result.data?.status || '').toUpperCase();
    if (classified === 'REDEEMED' && result.data?.redemption) {
      setSuccessRedemption(result.data.redemption);
      setPhase('success');
      toast.success('Voucher redeemed');
      return;
    }

    setValidationStatus(classified || 'INVALID');
    setValidationMessage(
      result.data?.message || 'This voucher could not be redeemed. Please try again.',
    );
    setVoucher(result.data?.voucher || voucher);
    setPhase('result');
    if (!result.ok) {
      setApiErrorResult(result);
    }
  }

  const selectedLocation = locations.find((loc) => loc.key === locationKey);

  return (
    <PageContainer className="max-w-xl">
      <PageHeader
        title="Redeem Voucher"
        description="Scan a guest QR code or enter a promo code to validate and redeem at your location."
        actions={
          perm.view ? (
            <Button href="/dashboard/redemptions" variant="secondary" size="sm">
              History
            </Button>
          ) : null
        }
      />

      {apiError ? <ApiErrorBanner result={apiErrorResult} message={apiError} /> : null}

      {phase === 'success' && successRedemption ? (
        <div className="space-y-5">
          <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-6 text-center">
            <CheckCircle2 className="mx-auto size-12 text-emerald-600" aria-hidden />
            <h2 className="mt-3 text-xl font-semibold text-[var(--dash-ink)]">Redeemed</h2>
            <p className="mt-2 font-mono text-lg font-bold tracking-wider">
              {successRedemption.promoCode}
            </p>
            <dl className="mt-4 space-y-2 text-left text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--dash-muted)]">When</dt>
                <dd>{formatDateTime(successRedemption.redeemedAt)}</dd>
              </div>
              {successRedemption.locationLabel ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--dash-muted)]">Location</dt>
                  <dd>{successRedemption.locationLabel}</dd>
                </div>
              ) : null}
              {successRedemption.campaignName ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--dash-muted)]">Campaign</dt>
                  <dd>{successRedemption.campaignName}</dd>
                </div>
              ) : null}
            </dl>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              type="button"
              className="min-h-12 w-full text-base"
              onClick={() => {
                resetFlow();
                router.replace('/dashboard/redeem');
              }}
            >
              Redeem another
            </Button>
            {perm.view ? (
              <Button
                href={`/dashboard/redemptions/${encodeURIComponent(successRedemption.id)}`}
                variant="secondary"
                className="min-h-12 w-full text-base"
              >
                View redemption details
              </Button>
            ) : null}
          </div>
        </div>
      ) : phase === 'validating' ? (
        <LoadingState rows={3} label="Checking voucher…" />
      ) : phase === 'valid' && voucher ? (
        <div className="space-y-5">
          <VoucherCard voucher={voucher} />

          {locations.length > 0 ? (
            <div>
              <label htmlFor="redeem-location" className="text-sm font-medium text-[var(--dash-ink)]">
                Redemption location
              </label>
              <select
                id="redeem-location"
                value={locationKey}
                onChange={(event) => setLocationKey(event.target.value)}
                className={`${DASH_SELECT_CLASS} mt-2 min-h-12 text-base`}
              >
                <option value="">Select location…</option>
                {locations.map((loc) => (
                  <option key={loc.key} value={loc.key}>
                    {loc.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div>
            <label htmlFor="redeem-notes" className="text-sm font-medium text-[var(--dash-ink)]">
              Notes <span className="text-[var(--dash-muted)]">(optional)</span>
            </label>
            <textarea
              id="redeem-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={2}
              className={`${DASH_INPUT_CLASS} mt-2 min-h-[4rem] py-2 text-base`}
              placeholder="Table number, staff note…"
            />
          </div>

          <div className="flex flex-col gap-3">
            {perm.redeem ? (
              <Button
                type="button"
                className="min-h-14 w-full text-base font-semibold"
                disabled={redeemBusy || (locations.length > 0 && !locationKey)}
                onClick={() => setConfirmOpen(true)}
              >
                {redeemBusy ? 'Redeeming…' : 'Redeem voucher'}
              </Button>
            ) : null}
            <Button type="button" variant="secondary" className="min-h-12 w-full" onClick={resetFlow}>
              Cancel
            </Button>
          </div>

          <ConfirmDialog
            open={confirmOpen}
            title="Confirm redemption"
            description={
              <>
                Redeem <strong className="font-mono">{voucher.promoCode}</strong>
                {selectedLocation ? ` at ${selectedLocation.label}` : ''}? This cannot be undone.
              </>
            }
            confirmLabel="Redeem now"
            variant="primary"
            busy={redeemBusy}
            onCancel={() => {
              if (!redeemBusy) setConfirmOpen(false);
            }}
            onConfirm={handleRedeemConfirm}
          />
        </div>
      ) : phase === 'result' ? (
        <ResultState
          status={validationStatus}
          message={validationMessage}
          onReset={() => {
            resetFlow();
            router.replace('/dashboard/redeem');
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-[var(--dash-surface-2)] p-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex min-h-12 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${
                  tab === id
                    ? 'bg-white text-[var(--dash-ink)] shadow-sm'
                    : 'text-[var(--dash-muted)] hover:text-[var(--dash-ink)]'
                }`}
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </button>
            ))}
          </div>

          {tab === 'scan' ? (
            <div className="mt-5 space-y-4">
              {!scannerSupported ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                  QR scanning is not available in this browser. Use{' '}
                  <button
                    type="button"
                    className="font-semibold underline"
                    onClick={() => setTab('manual')}
                  >
                    Enter Promo Code
                  </button>{' '}
                  instead.
                </div>
              ) : null}

              {scannerError ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                  {scannerError}
                </div>
              ) : null}

              {scannerSupported ? (
                <QrScanner
                  active={tab === 'scan' && phase === 'idle'}
                  onDetect={handleScannerDetect}
                  onError={handleScannerError}
                />
              ) : (
                <div className="flex aspect-[4/3] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--dash-border)] bg-[var(--dash-surface-2)] p-6 text-center">
                  <ScanLine className="size-10 text-[var(--dash-muted)]" aria-hidden />
                  <p className="mt-3 text-sm text-[var(--dash-muted)]">
                    Camera scanning unavailable — enter the promo code manually.
                  </p>
                </div>
              )}

              <p className="text-center text-xs text-[var(--dash-muted)]">
                Point the camera at the guest&apos;s voucher QR code
              </p>

              <Button
                type="button"
                variant="secondary"
                className="min-h-12 w-full"
                onClick={() => setTab('manual')}
              >
                Enter promo code instead
              </Button>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="manual-promo" className="text-sm font-medium text-[var(--dash-ink)]">
                  Promo code
                </label>
                <input
                  id="manual-promo"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  value={manualCode}
                  onChange={(event) => setManualCode(normalizePromoInput(event.target.value))}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && manualCode.trim()) {
                      runValidate({ code: manualCode });
                    }
                  }}
                  placeholder="e.g. SUMMER2026"
                  className={`${DASH_INPUT_CLASS} mt-2 min-h-14 font-mono text-lg tracking-widest uppercase`}
                />
              </div>
              <Button
                type="button"
                className="min-h-14 w-full text-base font-semibold"
                disabled={!manualCode.trim() || !perm.validate}
                onClick={() => runValidate({ code: manualCode })}
              >
                Validate
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="min-h-12 w-full"
                onClick={() => setTab('scan')}
              >
                Try QR scan instead
              </Button>
            </div>
          )}

          {perm.view ? (
            <p className="mt-6 text-center text-xs text-[var(--dash-muted)]">
              <Link href="/dashboard/redemptions" className="underline hover:text-[var(--dash-ink)]">
                View redemption history
              </Link>
            </p>
          ) : null}
        </>
      )}
    </PageContainer>
  );
}

export default function StaffRedeemPage() {
  return (
    <AuthGate permission={PERMISSIONS.REDEMPTIONS_REDEEM}>
      <StaffRedeemInner />
    </AuthGate>
  );
}
