import * as service from './service.js';
import { sendSuccess } from '../../shared/responses/apiResponse.js';

export async function summary(_req, res, next) {
  try {
    const data = await service.generateBusinessAnalytics();
    return sendSuccess(res, { message: 'Business analytics generated', data });
  } catch (err) { return next(err); }
}
