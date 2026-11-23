import * as service from './service.js';
import { sendSuccess } from '../../shared/responses/apiResponse.js';

export async function packages(_req, res, next) {
  try {
    const items = await service.listPublicPackages();
    return sendSuccess(res, { message: 'Recharge packages fetched', data: { packages: items } });
  } catch (err) {
    return next(err);
  }
}

export async function createOrder(req, res, next) {
  try {
    const data = await service.createRechargeOrder({
      userId: req.user._id,
      packageCode: req.body.packageCode,
      customAmountInr: req.body.customAmountInr,
    });
    return sendSuccess(res, { statusCode: 201, message: 'Razorpay order created', data });
  } catch (err) {
    return next(err);
  }
}

export async function verifyPayment(req, res, next) {
  try {
    const data = await service.verifyClientCheckoutPayment({
      userId: req.user._id,
      ...req.body,
    });
    return sendSuccess(res, { message: 'Payment verified and wallet credited', data });
  } catch (err) {
    return next(err);
  }
}

export async function webhook(req, res, next) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const eventIdHeader = req.headers['x-razorpay-event-id'];
    const data = await service.handleRazorpayWebhook({
      rawBody: req.body,
      signature,
      eventIdHeader,
    });
    return sendSuccess(res, { message: 'Webhook processed', data });
  } catch (err) {
    return next(err);
  }
}
