export function sendSuccess(res, { statusCode = 200, message = 'Operation completed successfully', data = {}, meta = undefined } = {}) {
  const payload = { success: true, message, data };
  if (meta !== undefined) payload.meta = meta;
  return res.status(statusCode).json(payload);
}

export function sendError(res, { statusCode = 500, message = 'Internal server error', code = 'INTERNAL_ERROR', details = undefined } = {}) {
  const payload = { success: false, message, code };
  if (details !== undefined) payload.details = details;
  return res.status(statusCode).json(payload);
}

export function buildPaginationMeta(page, limit, total) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 20));
  return {
    page: safePage,
    limit: safeLimit,
    total,
    totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    hasNext: safePage * safeLimit < total,
    hasPrev: safePage > 1,
  };
}
