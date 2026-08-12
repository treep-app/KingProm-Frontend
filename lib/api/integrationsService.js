import { adminFetch, adminHeaders, omitClientTenantOverrides } from './client';

export async function getMarketplace() {
  return adminFetch('/api/admin/integrations', {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

export async function connectIntegration(payload) {
  return adminFetch('/api/admin/integrations/connect', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(omitClientTenantOverrides(payload)),
  });
}

export async function testIntegration(id) {
  return adminFetch(`/api/admin/integrations/${id}/test`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({}),
  });
}

export async function disconnectIntegration(id) {
  return adminFetch(`/api/admin/integrations/${id}/disconnect`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({}),
  });
}

export async function listIntegrationEvents() {
  return adminFetch('/api/admin/integrations/events', {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

export async function getIntegrationEvent(id) {
  return adminFetch(`/api/admin/integrations/events/${id}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

export async function retryIntegrationEvent(id) {
  return adminFetch(`/api/admin/integrations/events/${id}/retry`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({}),
  });
}

export async function listAutomations() {
  return adminFetch('/api/admin/automations', {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

export async function createAutomation(payload) {
  return adminFetch('/api/admin/automations', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(omitClientTenantOverrides(payload)),
  });
}

export async function updateAutomation(id, payload) {
  return adminFetch(`/api/admin/automations/${id}`, {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify(omitClientTenantOverrides(payload)),
  });
}

export async function archiveAutomation(id) {
  return adminFetch(`/api/admin/automations/${id}/archive`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({}),
  });
}

export async function listAutomationExecutions() {
  return adminFetch('/api/admin/automations/executions', {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

export async function listApiKeys() {
  return adminFetch('/api/admin/api-keys', {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

export async function createApiKey(payload) {
  return adminFetch('/api/admin/api-keys', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(omitClientTenantOverrides(payload)),
  });
}

export async function revokeApiKey(id) {
  return adminFetch(`/api/admin/api-keys/${id}/revoke`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({}),
  });
}

export async function listOutboundWebhooks() {
  return adminFetch('/api/admin/webhooks/outbound', {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

export async function createOutboundWebhook(payload) {
  return adminFetch('/api/admin/webhooks/outbound', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(omitClientTenantOverrides(payload)),
  });
}

export async function updateOutboundWebhook(id, payload) {
  return adminFetch(`/api/admin/webhooks/outbound/${id}`, {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify(omitClientTenantOverrides(payload)),
  });
}

export async function deleteOutboundWebhook(id) {
  return adminFetch(`/api/admin/webhooks/outbound/${id}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  });
}
