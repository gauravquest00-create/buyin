import { AuditLog } from '../../shared/models/AuditLog.model.js';
import { buildPaginationMeta } from '../../shared/responses/apiResponse.js';

export async function listAuditLogs(query) {
  const filter = {};
  if (query.module) filter.module = query.module;
  if (query.action) filter.action = new RegExp(query.action, 'i');
  const page = Number(query.page) || 1;
  const limit = Math.min(100, Number(query.limit) || 30);
  const [logs, total] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    AuditLog.countDocuments(filter),
  ]);
  return { logs, meta: buildPaginationMeta(page, limit, total) };
}
