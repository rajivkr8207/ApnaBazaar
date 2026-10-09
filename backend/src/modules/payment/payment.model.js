import mongoose from 'mongoose';
import priceSchema from '../price/price.model.js';

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', default: null },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    sku: { type: String, default: null },
    images: { type: [String], default: [] },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: priceSchema, required: true },
    lineTotal: { type: priceSchema, required: true },
    stockId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductStock', required: true },
  },
  { _id: false },
);

const paymentSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'expired', 'refund_pending', 'refund_failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    idempotencyKeyHash: { type: String, unique: true, sparse: true, select: false },
    price: { type: priceSchema, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    orderItems: { type: [orderItemSchema], required: true },
    shippingAddress: {
      fullName: { type: String, required: true, trim: true, maxlength: 120 },
      phone: { type: String, required: true, trim: true, maxlength: 30 },
      addressLine1: { type: String, required: true, trim: true, maxlength: 200 },
      addressLine2: { type: String, trim: true, maxlength: 200, default: '' },
      city: { type: String, required: true, trim: true, maxlength: 100 },
      state: { type: String, required: true, trim: true, maxlength: 100 },
      postalCode: { type: String, required: true, trim: true, maxlength: 20 },
      country: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        minlength: 2,
        maxlength: 2,
      },
    },
    razorpay: {
      orderId: { type: String, unique: true, sparse: true },
      paymentId: { type: String, default: null },
      refundId: { type: String, default: null },
      refundReceipt: { type: String, default: null },
      refundReason: { type: String, default: null, maxlength: 250 },
      refundRequestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    },
    reservationExpiresAt: { type: Date, required: true, index: true },
    paidAt: { type: Date, default: null },
    refundedAt: { type: Date, default: null },
    failureReason: { type: String, default: null, maxlength: 500 },
  },
  { timestamps: true },
);

paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1, reservationExpiresAt: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
