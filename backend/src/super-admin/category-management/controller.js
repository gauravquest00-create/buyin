import * as service from './service.js';
import { sendSuccess } from '../../shared/responses/apiResponse.js';

export async function list(req, res, next) {
  try {
    const categories = await service.listCategories(req.query.type);
    return sendSuccess(res, { message: 'Categories fetched', data: { categories } });
  } catch (err) { return next(err); }
}

export async function create(req, res, next) {
  try {
    const category = await service.createCategory(req.body, req.admin, req.ip);
    return sendSuccess(res, { statusCode: 201, message: 'Category created', data: { category } });
  } catch (err) { return next(err); }
}

export async function toggle(req, res, next) {
  try {
    const category = await service.toggleCategory(req.params.categoryId, req.body.isActive);
    return sendSuccess(res, { message: 'Category updated', data: { category } });
  } catch (err) { return next(err); }
}
