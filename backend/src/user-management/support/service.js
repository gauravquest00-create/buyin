import { SupportTicket } from '../../shared/models/SupportTicket.model.js';
import { uploadBufferToCloudinary, isCloudinaryConfigured } from '../../config/cloudinary.js';
import { validateUploadFile } from '../../config/storage.js';
import { generateCode } from '../../shared/utils/crypto.js';
import { NotFoundError } from '../../shared/errors/AppError.js';

export async function createTicket(userId, payload, file) {
  let attachment;
  if (file) {
    const policy = validateUploadFile(file, 'SUPPORT_ATTACHMENT');
    if (isCloudinaryConfigured()) {
      const uploaded = await uploadBufferToCloudinary(file.buffer, {
        folder: policy.folder,
        isPrivate: true,
        resourceType: file.mimetype === 'application/pdf' ? 'raw' : 'image',
      });
      attachment = { publicId: uploaded.publicId, resourceType: uploaded.resourceType, originalName: file.originalname };
    }
  }
  return SupportTicket.create({
    ticketCode: generateCode('TKT'),
    userId,
    subject: payload.subject,
    category: payload.category,
    priority: payload.priority,
    messages: [{ senderType: 'USER', senderId: userId, body: payload.message, attachment }],
  });
}

export async function listMyTickets(userId) {
  return SupportTicket.find({ userId }).sort({ updatedAt: -1 }).lean();
}

export async function replyToTicket(userId, ticketId, message) {
  const ticket = await SupportTicket.findOne({ _id: ticketId, userId });
  if (!ticket) throw new NotFoundError('Support ticket not found');
  ticket.messages.push({ senderType: 'USER', senderId: userId, body: message });
  await ticket.save();
  return ticket;
}
