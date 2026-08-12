'use client';

import { useCallback, useEffect, useState } from 'react';
import { hasAdminKey } from '../lib/api/client';
import * as templateService from '../lib/api/templateService';
import { messageFromApiResult } from '../lib/api/errors';

/**
 * Load a single voucher template with preview data.
 */
export function useTemplate(templateId, { enabled = true } = {}) {
  const [template, setTemplate] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(Boolean(enabled && templateId));
  const [error, setError] = useState('');
  const [errorResult, setErrorResult] = useState(null);

  const reload = useCallback(async () => {
    if (!enabled || !templateId) return;
    if (!hasAdminKey()) {
      setLoading(false);
      setTemplate(null);
      setPreview(null);
      setError('Your session expired. Please sign in again.');
      setErrorResult({ status: 401, ok: false });
      return;
    }

    setLoading(true);
    setError('');
    setErrorResult(null);

    const result = await templateService.getTemplate(templateId);
    if (!result.ok) {
      setErrorResult(result);
      setError(
        messageFromApiResult(result, 'Unable to load the template. Please try again.', {
          resource: 'template',
        }),
      );
      setTemplate(null);
      setPreview(null);
    } else {
      setTemplate(result.data.template);
      setPreview(result.data.preview || null);
    }
    setLoading(false);
  }, [enabled, templateId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    template,
    preview,
    loading,
    error,
    errorResult,
    reload,
    createTemplate: templateService.createTemplate,
    updateTemplate: (payload) => templateService.updateTemplate(templateId, payload),
    uploadLogo: (image) => templateService.uploadTemplateLogo(templateId, { image }),
    uploadBackground: (image) =>
      templateService.uploadTemplateBackground(templateId, { image }),
    duplicateTemplate: () => templateService.duplicateTemplate(templateId),
    archiveTemplate: () => templateService.archiveTemplate(templateId),
    setDefaultTemplate: () => templateService.setDefaultTemplate(templateId),
  };
}

export default useTemplate;
