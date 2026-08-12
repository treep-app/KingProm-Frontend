/**
 * Guest scratch-card API (existing production contract).
 */

export async function verifyTicket(token) {
  const res = await fetch(`/api/scratch-card/verify?token=${encodeURIComponent(token)}`, {
    cache: 'no-store',
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

export async function redeemTicket(token) {
  const res = await fetch('/api/scratch-card/redeem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}
