import * as service from './service.js';
import { sendSuccess } from '../../shared/responses/apiResponse.js';

export async function list(req, res, next) {
  try {
    const tickets = await service.listTickets(req.query);
    return sendSuccess(res, { message: 'Support tickets fetched', data: { tickets } });
  } catch (err) { return next(err); }
}

export async function reply(req, res, next) {
  try {
    const ticket = await service.replyTicket(req.params.ticketId, req.body, req.admin);
    return sendSuccess(res, { message: 'Support reply sent', data: { ticket } });
  } catch (err) { return next(err); }
}
