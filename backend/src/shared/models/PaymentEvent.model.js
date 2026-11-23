import mongoose from 'mongoose';

const paymentEventSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    eventType: { type: String, required: true, index: true },
    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: { type: String, index: true },
    signatureVerified: { type: Boolean, required: true },
    processed: { type: Boolean, default: false },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    processingError: { type: String, default: '' },
  },
  { timestamps: true, collection: 'payment_events' }
);

export const PaymentEvent = mongoose.model('PaymentEvent', paymentEventSchema);
