import { body, header, param, query } from 'express-validator';
import { validate } from '../../config/validate.js';

export const createCheckoutValidation = [
  header('idempotency-key').trim().isLength({ min: 8, max: 100 }),
  body('shippingAddress').isObject().withMessage('A shipping address is required'),
  body('shippingAddress.fullName').trim().isLength({ min: 2, max: 120 }),
  body('shippingAddress.phone').trim().isLength({ min: 7, max: 30 }),
  body('shippingAddress.addressLine1').trim().isLength({ min: 3, max: 200 }),
  body('shippingAddress.addressLine2').optional().trim().isLength({ max: 200 }),
  body('shippingAddress.city').trim().isLength({ min: 2, max: 100 }),
  body('shippingAddress.state').trim().isLength({ min: 2, max: 100 }),
  body('shippingAddress.postalCode').trim().isLength({ min: 3, max: 20 }),
  body('shippingAddress.country').trim().isLength({ min: 2, max: 2 }).isAlpha(),
  validate,
];

export const verifyPaymentValidation = [
  body('paymentId').isMongoId().withMessage('A valid order ID is required'),
  body('razorpay_order_id').trim().isLength({ min: 1, max: 100 }),
  body('razorpay_payment_id').trim().isLength({ min: 1, max: 100 }),
  body('razorpay_signature').isHexadecimal().isLength({ min: 64, max: 64 }),
  validate,
];

export const orderIdValidation = [
  param('paymentId').isMongoId().withMessage('A valid order ID is required'),
  validate,
];

export const orderHistoryValidation = [
  query('page').optional().isInt({ min: 1, max: 100000 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  validate,
];

export const refundValidation = [body('reason').trim().isLength({ min: 3, max: 250 }), validate];

export const webhookValidation = [
  header('x-razorpay-signature').isHexadecimal().isLength({ min: 64, max: 64 }),
  validate,
];
