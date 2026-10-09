import crypto from 'crypto';
import mongoose from 'mongoose';
import Config from '../../config/Config.js';
import { ApiError } from '../../utils/ApiError.js';
import Cart from '../cart/cart.model.js';
import Product from '../product/product.model.js';
import ProductStock from '../productStock/productStock.model.js';
import ProductVariant from '../productVariant/productVariant.model.js';
import Payment from './payment.model.js';
import { getRazorpayClient, razorPaycreateOrder } from '../../services/payment.service.js';

const CURRENCY = 'INR';
const RESERVATION_WINDOW_MS = 15 * 60 * 1000;
const PAISA_PER_RUPEE = 100;

const amountInPaise = (amount) => {
  const paise = Math.round(Number(amount) * PAISA_PER_RUPEE);
  if (!Number.isSafeInteger(paise) || paise < 1) {
    throw new ApiError(400, 'Order contains an invalid price');
  }
  return paise;
};

const timingSafeHexEqual = (actual, expected) => {
  if (!/^[a-f\d]{64}$/i.test(actual || '') || !/^[a-f\d]{64}$/i.test(expected || '')) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expected, 'hex'));
};

const hashIdempotencyKey = (userId, key) =>
  crypto.createHash('sha256').update(`${userId}:${key}`).digest('hex');

const checkoutResponse = (payment) => ({
  paymentId: payment._id,
  keyId: Config.razorpay_key_id,
  orderId: payment.razorpay.orderId,
  amount: amountInPaise(payment.price.amount),
  currency: payment.price.currency,
  expiresAt: payment.reservationExpiresAt,
  prefill: { name: payment.shippingAddress.fullName },
});

const getCheckoutSnapshot = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).lean();
  if (!cart?.items?.length) {
    throw new ApiError(400, 'Your cart is empty');
  }
  if (cart.items.length > 100) {
    throw new ApiError(400, 'Checkout supports at most 100 distinct cart items');
  }

  const orderItems = [];
  let totalPaise = 0;

  for (const cartItem of cart.items) {
    if (!Number.isInteger(cartItem.quantity) || cartItem.quantity < 1) {
      throw new ApiError(409, 'A cart item has an invalid quantity');
    }
    const product = await Product.findOne({
      _id: cartItem.product,
      isActive: true,
      status: 'published',
    }).lean();
    if (!product) {
      throw new ApiError(409, 'A product in your cart is no longer available');
    }

    let variant = null;
    if (cartItem.variant) {
      variant = await ProductVariant.findOne({
        _id: cartItem.variant,
        product: product._id,
        isActive: true,
      }).lean();
      if (!variant) {
        throw new ApiError(409, 'A product option in your cart is no longer available');
      }
    }

    const stock = await ProductStock.findOne({
      product: product._id,
      variant: variant ? variant._id : null,
    }).lean();
    if (!stock) {
      throw new ApiError(409, 'Stock information is unavailable for a cart item');
    }
    if (stock.quantity - (stock.reservedQuantity || 0) < cartItem.quantity) {
      throw new ApiError(409, `Insufficient available stock for ${product.name}`);
    }

    const unitPrice = variant?.price > 0 ? variant.price : product.price;
    const currency = variant?.price > 0 ? variant.currency : product.currency;
    if (currency !== CURRENCY) {
      throw new ApiError(400, `Razorpay checkout currently supports ${CURRENCY} orders only`);
    }

    const unitPricePaise = amountInPaise(unitPrice);
    const lineTotalPaise = unitPricePaise * cartItem.quantity;
    if (!Number.isSafeInteger(lineTotalPaise)) {
      throw new ApiError(400, 'Order total exceeds the supported amount');
    }
    totalPaise += lineTotalPaise;
    if (!Number.isSafeInteger(totalPaise)) {
      throw new ApiError(400, 'Order total exceeds the supported amount');
    }

    orderItems.push({
      productId: product._id,
      variantId: variant?._id || null,
      sellerId: product.seller,
      title: product.name,
      description: product.description || '',
      sku: variant?.sku || product.sku || null,
      images: variant?.images?.length ? variant.images : product.images || [],
      quantity: cartItem.quantity,
      price: { amount: unitPricePaise / PAISA_PER_RUPEE, currency },
      lineTotal: { amount: lineTotalPaise / PAISA_PER_RUPEE, currency },
      stockId: stock._id,
    });
  }

  if (totalPaise < PAISA_PER_RUPEE) {
    throw new ApiError(400, 'Razorpay orders must total at least INR 1.00');
  }

  return { orderItems, totalPaise };
};

const reserveInventory = async (orderItems, session) => {
  const reservations = new Map();
  for (const item of orderItems) {
    const stockId = item.stockId.toString();
    reservations.set(stockId, (reservations.get(stockId) || 0) + item.quantity);
  }

  for (const [stockId, quantity] of reservations) {
    const stock = await ProductStock.findOneAndUpdate(
      {
        _id: stockId,
        $expr: {
          $gte: [{ $subtract: ['$quantity', { $ifNull: ['$reservedQuantity', 0] }] }, quantity],
        },
      },
      { $inc: { reservedQuantity: quantity } },
      { new: true, session },
    );
    if (!stock) {
      throw new ApiError(
        409,
        'Stock changed while checkout was starting; refresh your cart and retry',
      );
    }
  }
};

const adjustReservations = async (payment, session, settle) => {
  const reservations = new Map();
  for (const item of payment.orderItems) {
    const stockId = item.stockId.toString();
    reservations.set(stockId, (reservations.get(stockId) || 0) + item.quantity);
  }

  for (const [stockId, quantity] of reservations) {
    if (settle) {
      const stock = await ProductStock.findOne({
        _id: stockId,
        quantity: { $gte: quantity },
        reservedQuantity: { $gte: quantity },
      }).session(session);
      if (!stock) {
        throw new ApiError(409, 'Inventory reservation is no longer valid; contact support');
      }

      stock.quantity -= quantity;
      stock.reservedQuantity -= quantity;
      stock.stockStatus =
        stock.quantity === 0 ? 'out_of_stock' : stock.quantity <= 5 ? 'low_stock' : 'in_stock';
      await stock.save({ session });
    } else {
      const stock = await ProductStock.findOneAndUpdate(
        { _id: stockId, reservedQuantity: { $gte: quantity } },
        { $inc: { reservedQuantity: -quantity } },
        { new: true, session },
      );
      if (!stock) {
        throw new ApiError(409, 'Inventory reservation is no longer valid; contact support');
      }
    }
  }
};

const createRazorpayOrder = async ({ orderId, totalPaise, userId }) => {
  try {
    return await razorPaycreateOrder({
      amount: totalPaise,
      currency: CURRENCY,
      receipt: orderId.toString(),
      notes: { userId: userId.toString(), paymentId: orderId.toString() },
    });
  } catch {
    throw new ApiError(502, 'Could not create a Razorpay order; please retry checkout');
  }
};

export const createCheckout = async (userId, shippingAddress, requestKey) => {
  getRazorpayClient();
  await expirePendingPayments();
  const idempotencyKeyHash = hashIdempotencyKey(userId, requestKey);
  const existingPayment = await Payment.findOne({ idempotencyKeyHash }).select(
    '+idempotencyKeyHash',
  );
  if (existingPayment) {
    if (existingPayment.status !== 'pending') {
      throw new ApiError(409, 'This checkout request has already been used; start a new checkout');
    }
    return checkoutResponse(existingPayment);
  }

  const { orderItems, totalPaise } = await getCheckoutSnapshot(userId);
  const paymentId = new mongoose.Types.ObjectId();
  const reservationExpiresAt = new Date(Date.now() + RESERVATION_WINDOW_MS);
  const razorpayOrder = await createRazorpayOrder({
    orderId: paymentId,
    totalPaise,
    userId,
  });

  if (
    razorpayOrder.amount !== totalPaise ||
    razorpayOrder.currency !== CURRENCY ||
    !razorpayOrder.id
  ) {
    throw new ApiError(502, 'Razorpay returned an invalid order response');
  }

  const session = await mongoose.startSession();
  let payment;
  try {
    await session.withTransaction(async () => {
      await reserveInventory(orderItems, session);
      [payment] = await Payment.create(
        [
          {
            _id: paymentId,
            idempotencyKeyHash,
            user: userId,
            status: 'pending',
            price: { amount: totalPaise / PAISA_PER_RUPEE, currency: CURRENCY },
            orderItems,
            shippingAddress,
            reservationExpiresAt,
            razorpay: { orderId: razorpayOrder.id },
          },
        ],
        { session },
      );
    });
  } catch (error) {
    if (error.code === 11000) {
      const previousPayment = await Payment.findOne({ idempotencyKeyHash }).select(
        '+idempotencyKeyHash',
      );
      if (previousPayment?.status === 'pending') {
        return checkoutResponse(previousPayment);
      }
    }
    throw error;
  } finally {
    await session.endSession();
  }

  return checkoutResponse(payment);
};

const clearPurchasedCartItems = async (payment, session) => {
  const cart = await Cart.findOne({ user: payment.user }).session(session);
  if (!cart) {
    return;
  }

  for (const purchasedItem of payment.orderItems) {
    const cartItem = cart.items.find(
      (item) =>
        item.product.toString() === purchasedItem.productId.toString() &&
        (item.variant?.toString() || null) === (purchasedItem.variantId?.toString() || null),
    );
    if (!cartItem) {
      continue;
    }

    if (cartItem.quantity <= purchasedItem.quantity) {
      cartItem.deleteOne();
    } else {
      cartItem.quantity -= purchasedItem.quantity;
    }
  }

  await cart.save({ session });
};

const finalizeCapturedPayment = async (orderId, paymentId) => {
  const session = await mongoose.startSession();
  let payment;
  try {
    await session.withTransaction(async () => {
      payment = await Payment.findOne({ 'razorpay.orderId': orderId }).session(session);
      if (!payment) {
        throw new ApiError(404, 'Order not found');
      }
      if (payment.status === 'paid') {
        return;
      }
      if (payment.status !== 'pending') {
        return;
      }

      await adjustReservations(payment, session, true);
      payment.status = 'paid';
      payment.razorpay.paymentId = paymentId;
      payment.paidAt = new Date();
      payment.failureReason = null;
      await payment.save({ session });
      await clearPurchasedCartItems(payment, session);
    });
  } finally {
    await session.endSession();
  }

  return payment;
};

const submitRefund = async (payment, reason, receipt, requestedBy = null) => {
  const session = await mongoose.startSession();
  let refundClaimed = false;
  try {
    await session.withTransaction(async () => {
      refundClaimed = false;
      const current = await Payment.findById(payment._id).session(session);
      if (!current) {
        throw new ApiError(404, 'Order not found');
      }
      if (current.status === 'refunded') {
        return;
      }
      if (current.status === 'refund_pending') {
        return;
      }
      if (!['expired', 'failed', 'refund_failed', 'paid'].includes(current.status)) {
        throw new ApiError(409, 'This order cannot be refunded in its current state');
      }
      current.status = 'refund_pending';
      current.razorpay.refundReceipt = current.razorpay.refundReceipt || receipt;
      current.razorpay.refundReason = reason;
      current.razorpay.refundRequestedBy = requestedBy;
      await current.save({ session });
      refundClaimed = true;
    });
  } finally {
    await session.endSession();
  }

  const current = await Payment.findById(payment._id);
  if (current.status === 'refunded' || !refundClaimed) {
    return current;
  }
  if (current.razorpay.refundId) {
    return current;
  }

  const razorpayClient = getRazorpayClient();
  let refund;
  try {
    refund = await razorpayClient.payments.refund(current.razorpay.paymentId, {
      amount: amountInPaise(current.price.amount),
      notes: { reason: reason.slice(0, 250), paymentId: current._id.toString() },
      receipt: current.razorpay.refundReceipt,
    });
  } catch {
    throw new ApiError(
      502,
      'Refund request could not be confirmed; order is marked for refund reconciliation',
    );
  }

  const update = { 'razorpay.refundId': refund.id };
  if (refund.status === 'processed') {
    update.status = 'refunded';
    update.refundedAt = new Date();
  } else if (refund.status === 'failed') {
    update.status = 'refund_failed';
    update['razorpay.refundId'] = null;
    update['razorpay.refundReceipt'] = null;
  }
  const updatedPayment = await Payment.findOneAndUpdate(
    { _id: current._id, status: 'refund_pending' },
    { $set: update },
    { new: true },
  );
  return updatedPayment || Payment.findById(current._id);
};

const refundLateCapturedPayment = async (payment, razorpayPaymentId) => {
  const current = await Payment.findById(payment._id);
  if (
    !current ||
    !['expired', 'failed', 'refund_pending', 'refund_failed', 'refunded'].includes(current.status)
  ) {
    return current;
  }

  if (current.status === 'refunded') {
    return current;
  }

  if (!current.razorpay.paymentId) {
    current.razorpay.paymentId = razorpayPaymentId;
    await current.save();
  }
  return submitRefund(
    current,
    'Payment was captured after its inventory reservation expired',
    `late-${current._id.toString()}`,
  );
};

const getCapturedRazorpayPayment = async (orderId, paymentId) => {
  const razorpayClient = getRazorpayClient();
  let razorpayPayment;
  try {
    razorpayPayment = await razorpayClient.payments.fetch(paymentId);
  } catch {
    throw new ApiError(502, 'Could not confirm payment status with Razorpay');
  }

  const payment = await Payment.findOne({ 'razorpay.orderId': orderId });
  if (!payment) {
    throw new ApiError(404, 'Order not found');
  }
  if (
    razorpayPayment.order_id !== orderId ||
    razorpayPayment.amount !== amountInPaise(payment.price.amount) ||
    razorpayPayment.currency !== payment.price.currency
  ) {
    throw new ApiError(400, 'Razorpay payment details do not match this order');
  }

  if (razorpayPayment.status === 'authorized') {
    try {
      razorpayPayment = await razorpayClient.payments.capture(
        paymentId,
        amountInPaise(payment.price.amount),
        payment.price.currency,
      );
    } catch {
      try {
        razorpayPayment = await razorpayClient.payments.fetch(paymentId);
      } catch {
        throw new ApiError(
          502,
          'Payment is authorized but could not be captured; retry verification',
        );
      }
    }
  }

  if (razorpayPayment.status !== 'captured') {
    throw new ApiError(409, 'Razorpay has not captured this payment');
  }

  return { payment, razorpayPayment };
};

const completeRazorpayPayment = async (orderId, paymentId) => {
  const { payment } = await getCapturedRazorpayPayment(orderId, paymentId);
  if (payment.status === 'pending') {
    const completed = await finalizeCapturedPayment(orderId, paymentId);
    if (completed.status === 'paid') {
      return completed;
    }
  }

  const current = await Payment.findOne({ 'razorpay.orderId': orderId });
  if (
    current.status === 'expired' ||
    current.status === 'failed' ||
    current.status === 'refund_pending' ||
    current.status === 'refund_failed'
  ) {
    return refundLateCapturedPayment(current, paymentId);
  }
  if (current.status === 'paid') {
    return current;
  }

  throw new ApiError(409, 'Order is not payable in its current state');
};

export const verifyCheckoutPayment = async (userId, details) => {
  getRazorpayClient();
  const payment = await Payment.findOne({ _id: details.paymentId, user: userId });
  if (!payment) {
    throw new ApiError(404, 'Order not found');
  }
  if (payment.razorpay.orderId !== details.razorpay_order_id) {
    throw new ApiError(400, 'Razorpay order does not match this checkout');
  }

  const expectedSignature = crypto
    .createHmac('sha256', Config.razorpay_key_secret || '')
    .update(`${details.razorpay_order_id}|${details.razorpay_payment_id}`)
    .digest('hex');
  if (!timingSafeHexEqual(details.razorpay_signature, expectedSignature)) {
    throw new ApiError(400, 'Invalid Razorpay payment signature');
  }

  return completeRazorpayPayment(details.razorpay_order_id, details.razorpay_payment_id);
};

export const processRazorpayWebhook = async (payload, signature, rawBody) => {
  if (!Config.razorpay_webhook_secret) {
    throw new ApiError(503, 'Razorpay webhooks are not configured on this server');
  }
  if (!Buffer.isBuffer(rawBody)) {
    throw new ApiError(400, 'Webhook request body is unavailable for signature verification');
  }

  const expectedSignature = crypto
    .createHmac('sha256', Config.razorpay_webhook_secret)
    .update(rawBody)
    .digest('hex');
  if (!timingSafeHexEqual(signature, expectedSignature)) {
    throw new ApiError(400, 'Invalid Razorpay webhook signature');
  }

  const event = payload?.event;
  const paymentEntity = payload?.payload?.payment?.entity;
  const orderEntity = payload?.payload?.order?.entity;
  const refundEntity = payload?.payload?.refund?.entity;

  if (['payment.authorized', 'payment.captured', 'order.paid'].includes(event)) {
    const orderId = paymentEntity?.order_id || orderEntity?.id;
    const paymentId = paymentEntity?.id;
    if (orderId && paymentId) {
      await completeRazorpayPayment(orderId, paymentId);
    }
  } else if (event === 'refund.processed' && refundEntity?.id) {
    const payment = await Payment.findOne({
      'razorpay.paymentId': refundEntity.payment_id,
      status: 'refund_pending',
    });
    if (payment && refundEntity.amount === amountInPaise(payment.price.amount)) {
      payment.status = 'refunded';
      payment.refundedAt = new Date();
      payment.razorpay.refundId = refundEntity.id;
      await payment.save();
    } else if (payment) {
      payment.failureReason = 'A partial refund requires manual reconciliation';
      await payment.save();
    }
  } else if (event === 'refund.failed' && refundEntity?.id) {
    await Payment.findOneAndUpdate(
      {
        'razorpay.paymentId': refundEntity.payment_id,
        status: 'refund_pending',
      },
      {
        $set: {
          status: 'refund_failed',
          failureReason: 'Razorpay refund failed; administrator action is required',
          'razorpay.refundId': null,
          'razorpay.refundReceipt': null,
        },
      },
    );
  } else if (event === 'payment.failed' && paymentEntity?.order_id) {
    await failPayment(paymentEntity.order_id, paymentEntity.error_description);
  }
};

const expirePayment = async (orderId, now = new Date()) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const payment = await Payment.findOne({
        'razorpay.orderId': orderId,
        status: 'pending',
        reservationExpiresAt: { $lte: now },
      }).session(session);
      if (!payment) {
        return;
      }

      await adjustReservations(payment, session, false);
      payment.status = 'expired';
      payment.failureReason = 'Checkout inventory reservation expired';
      await payment.save({ session });
    });
  } finally {
    await session.endSession();
  }
};

const failPayment = async (orderId, reason) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const payment = await Payment.findOne({
        'razorpay.orderId': orderId,
        status: 'pending',
      }).session(session);
      if (!payment) {
        return;
      }

      await adjustReservations(payment, session, false);
      payment.status = 'failed';
      payment.failureReason = String(reason || 'Razorpay payment attempt failed').slice(0, 500);
      await payment.save({ session });
    });
  } finally {
    await session.endSession();
  }
};

export const expirePendingPayments = async () => {
  let expired;
  do {
    expired = await Payment.find({
      status: 'pending',
      reservationExpiresAt: { $lte: new Date() },
    })
      .select('_id razorpay.orderId')
      .limit(100)
      .lean();

    for (const payment of expired) {
      await expirePayment(payment.razorpay.orderId);
    }
  } while (expired.length === 100);
};

export const getRefundQueue = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const filter = { status: { $in: ['refund_pending', 'refund_failed'] } };
  const [orders, total] = await Promise.all([
    Payment.find(filter)
      .select('-orderItems.stockId -__v')
      .sort({ updatedAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Payment.countDocuments(filter),
  ]);

  return { orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

export const getOrderHistory = async (userId, query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const [orders, total] = await Promise.all([
    Payment.find({ user: userId })
      .select('-orderItems.stockId -__v')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Payment.countDocuments({ user: userId }),
  ]);

  return { orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

export const getOrderById = async (userId, paymentId) => {
  const payment = await Payment.findOne({ _id: paymentId, user: userId })
    .select('-orderItems.stockId -__v')
    .lean();
  if (!payment) {
    throw new ApiError(404, 'Order not found');
  }
  return payment;
};

export const refundOrder = async (paymentId, adminId, reason) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw new ApiError(404, 'Order not found');
  }
  if (!payment.razorpay.paymentId) {
    throw new ApiError(409, 'This order has no captured Razorpay payment to refund');
  }

  return submitRefund(payment, reason, `refund-${payment._id.toString()}`, adminId);
};
