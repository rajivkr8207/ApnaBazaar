import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  createCheckout,
  getOrderById,
  getOrderHistory,
  getRefundQueue,
  processRazorpayWebhook,
  refundOrder,
  verifyCheckoutPayment,
} from './payment.service.js';

export const createCheckoutController = asyncHandler(async (req, res) => {
  const checkout = await createCheckout(
    req.user.id,
    req.body.shippingAddress,
    req.headers['idempotency-key'],
  );
  return res.status(201).json(new ApiResponse(201, checkout, 'Razorpay checkout created'));
});

export const verifyCheckoutPaymentController = asyncHandler(async (req, res) => {
  const payment = await verifyCheckoutPayment(req.user.id, req.body);
  return res.status(200).json(new ApiResponse(200, payment, 'Payment verified successfully'));
});

export const getOrderHistoryController = asyncHandler(async (req, res) => {
  const orders = await getOrderHistory(req.user.id, req.query);
  return res.status(200).json(new ApiResponse(200, orders, 'Order history fetched successfully'));
});

export const getOrderByIdController = asyncHandler(async (req, res) => {
  const order = await getOrderById(req.user.id, req.params.paymentId);
  return res.status(200).json(new ApiResponse(200, order, 'Order fetched successfully'));
});

export const getRefundQueueController = asyncHandler(async (req, res) => {
  const refunds = await getRefundQueue(req.query);
  return res.status(200).json(new ApiResponse(200, refunds, 'Refund queue fetched successfully'));
});

export const refundOrderController = asyncHandler(async (req, res) => {
  const payment = await refundOrder(req.params.paymentId, req.user.id, req.body.reason);
  return res.status(200).json(new ApiResponse(200, payment, 'Refund state returned'));
});

export const razorpayWebhookController = asyncHandler(async (req, res) => {
  await processRazorpayWebhook(req.body, req.headers['x-razorpay-signature'], req.rawBody);
  return res.status(200).json({ received: true });
});
