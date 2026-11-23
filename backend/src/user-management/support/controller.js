import * as service from './service.js';
import { sendSuccess } from '../../shared/responses/apiResponse.js';

export async function list(req, res, next) {
  try {
    const tickets = await service.listMyTickets(req.user._id);
    return sendSuccess(res, { message: 'Support tickets fetched', data: { tickets } });
  } catch (err) {
    return next(err);
  }
}

export async function create(req, res, next) {
  try {
    const ticket = await service.createTicket(req.user._id, req.body, req.file);
    return sendSuccess(res, { statusCode: 201, message: 'Support ticket created', data: { ticket } });
  } catch (err) {
    return next(err);
  }
}

export async function reply(req, res, next) {
  try {
    const ticket = await service.replyToTicket(req.user._id, req.params.ticketId, req.body.message);
    return sendSuccess(res, { message: 'Reply added to ticket', data: { ticket } });
  } catch (err) {
    return next(err);
  }
}
