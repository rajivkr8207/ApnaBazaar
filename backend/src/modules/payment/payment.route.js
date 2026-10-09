import { Router } from 'express';
import { verifyAdmin, verifyCustomer, verifyJWT } from '../../middlewares/auth.middleware.js';
import {
  createCheckoutController,
  getOrderByIdController,
  getOrderHistoryController,
  getRefundQueueController,
  razorpayWebhookController,
  refundOrderController,
  verifyCheckoutPaymentController,
} from './payment.controller.js';
import {
  createCheckoutValidation,
  orderIdValidation,
  orderHistoryValidation,
  refundValidation,
  verifyPaymentValidation,
  webhookValidation,
} from './payment.validate.js';

const paymentRouter = Router();

paymentRouter.post('/webhook', webhookValidation, razorpayWebhookController);
paymentRouter.use(verifyJWT);
paymentRouter.post('/checkout', verifyCustomer, createCheckoutValidation, createCheckoutController);
paymentRouter.post(
  '/verify',
  verifyCustomer,
  verifyPaymentValidation,
  verifyCheckoutPaymentController,
);
paymentRouter.get('/admin/refunds', verifyAdmin, orderHistoryValidation, getRefundQueueController);
paymentRouter.get('/', orderHistoryValidation, getOrderHistoryController);
paymentRouter.get('/:paymentId', orderIdValidation, getOrderByIdController);
paymentRouter.post(
  '/:paymentId/refund',
  verifyAdmin,
  orderIdValidation,
  refundValidation,
  refundOrderController,
);

export default paymentRouter;
