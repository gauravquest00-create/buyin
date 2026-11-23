import * as service from './service.js';
import { sendSuccess } from '../../shared/responses/apiResponse.js';

export async function list(req, res, next) {
  try {
    const { logs, meta } = await service.listAuditLogs(req.query);
    return sendSuccess(res, { message: 'Audit logs fetched', data: { logs }, meta });
  } catch (err) { return next(err); }
}
