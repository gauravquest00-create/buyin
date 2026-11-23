import { WalletTransaction } from '../../shared/models/WalletTransaction.model.js';
import { buildPaginationMeta } from '../../shared/responses/apiResponse.js';

export async function listUserTransactions(userId, query) {
  const filter = { userId };
  if (query.type) filter.type = query.type;
  if (query.direction) filter.direction = query.direction;

  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    WalletTransaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    WalletTransaction.countDocuments(filter),
  ]);

  return { items, meta: buildPaginationMeta(page, limit, total) };
}
