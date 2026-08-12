'use client';

import { useCallback, useEffect, useState } from 'react';
import { Copy, Download, QrCode } from 'lucide-react';
import * as redemptionService from '../../lib/api/redemptionService';
import { messageFromApiResult } from '../../lib/api/errors';
import { ApiErrorBanner } from './AlertBanner';
import { useToast } from './ToastProvider';
import { Button, LoadingState } from './ui';

export default function PromoQrPanel({ ticketId }) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorResult, setErrorResult] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [copied, setCopied] = useState(false);

  const loadQr = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    setError('');
    setErrorResult(null);

    const result = await redemptionService.getTicketQr(ticketId);
    if (!result.ok) {
      setErrorResult(result);
      setError(
        messageFromApiResult(result, 'Unable to load QR code. Please try again.', {
          resource: 'QR code',
        }),
      );
      setQrData(null);
    } else {
      setQrData(result.data);
    }
    setLoading(false);
  }, [ticketId]);

  useEffect(() => {
    loadQr();
  }, [loadQr]);

  async function handleCopyLink() {
    const url = qrData?.validationUrl;
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Validation link copied');
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Unable to copy the link. Please try again.');
    }
  }

  async function handleDownload(format) {
    const fetcher =
      format === 'svg'
        ? redemptionService.downloadTicketQrSvg
        : redemptionService.downloadTicketQrPng;
    const result = await fetcher(ticketId);
    if (!result.ok || !result.url) {
      toast.error('Unable to download the QR code. Please try again.');
      return;
    }
    const ext = format === 'svg' ? 'svg' : 'png';
    const code = qrData?.promoCode || ticketId;
    redemptionService.triggerBlobDownload(result.url, `voucher-${code}.${ext}`);
    window.setTimeout(() => URL.revokeObjectURL(result.url), 1000);
  }

  if (loading) {
    return (
      <section className="dash-panel p-5">
        <LoadingState rows={2} label="Loading QR code…" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="dash-panel p-5">
        <ApiErrorBanner result={errorResult} message={error} />
        <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={loadQr}>
          Retry
        </Button>
      </section>
    );
  }

  if (!qrData) return null;

  return (
    <section className="dash-panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--dash-ink)]">
            <QrCode className="size-4" aria-hidden />
            Staff QR code
          </h2>
          <p className="mt-1 text-xs text-[var(--dash-muted)]">
            Scan at the venue to validate and redeem this voucher. Tokens are issued by the server.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        {qrData.qrPngDataUrl ? (
          <img
            src={qrData.qrPngDataUrl}
            alt={`QR code for promo ${qrData.promoCode || 'voucher'}`}
            className="size-44 rounded-xl border border-[var(--dash-border)] bg-white p-2"
            width={176}
            height={176}
          />
        ) : null}

        <div className="flex w-full flex-1 flex-col gap-2 sm:max-w-md">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--dash-muted)]">
            Validation link
          </p>
          <p className="break-all rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 py-2 font-mono text-xs text-[var(--dash-ink-soft)]">
            {qrData.validationUrl || '—'}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={handleCopyLink} disabled={!qrData.validationUrl}>
              <Copy className="size-3.5" />
              {copied ? 'Copied' : 'Copy link'}
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => handleDownload('png')}>
              <Download className="size-3.5" />
              Download PNG
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => handleDownload('svg')}>
              <Download className="size-3.5" />
              Download SVG
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
