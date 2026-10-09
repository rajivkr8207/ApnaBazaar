import Razorpay from 'razorpay';
import Config from '../config/Config.js';
import { ApiError } from '../utils/ApiError.js';

export const getRazorpayClient = () => {
  if (!Config.razorpay_key_id || !Config.razorpay_key_secret) {
    throw new ApiError(503, 'Razorpay is not configured on this server');
  }

  return new Razorpay({
    key_id: Config.razorpay_key_id,
    key_secret: Config.razorpay_key_secret,
  });
};

export const razorPaycreateOrder = async ({ amount, currency = 'INR', receipt, notes }) => {
  if (!Number.isSafeInteger(amount) || amount < 1) {
    throw new ApiError(400, 'Razorpay order amount must be a positive integer in paise');
  }

  return getRazorpayClient().orders.create({
    amount,
    currency,
    ...(receipt ? { receipt } : {}),
    ...(notes ? { notes } : {}),
  });
};
