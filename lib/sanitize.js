/**
 * Strip fields the browser UI should not retain or render.
 * Defense in depth — backend should also omit secrets from list payloads.
 */
export function sanitizeAdminTicket(ticket) {
  if (!ticket || typeof ticket !== 'object') return ticket;
  const { token, passwordHash, password, ...safe } = ticket;
  return safe;
}

export function sanitizeAdminTicketList(items) {
  if (!Array.isArray(items)) return [];
  return items.map(sanitizeAdminTicket);
}
