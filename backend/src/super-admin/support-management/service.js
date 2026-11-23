import { SupportTicket } from '../../shared/models/SupportTicket.model.js';
import { NotFoundError } from '../../shared/errors/AppError.js';

export async function listTickets(query) {
  const filter = {};
  if (query.status) filter.status = query.status;
  return SupportTicket.find(filter).populate('userId', 'fullName email mobile').sort({ updatedAt: -1 }).limit(100).lean();
}

export async function replyTicket(ticketId, { message, status }, admin) {
  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) throw new NotFoundError('Support ticket not found');
  ticket.messages.push({ senderType: 'ADMIN', senderId: admin._id, body: message });
  ticket.assignedAdminId = admin._id;
  if (status) ticket.status = status;
  await ticket.save();
  return ticket;
}
