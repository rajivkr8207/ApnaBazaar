
import { clearInterval, setInterval } from 'node:timers';
import { expirePendingPayments } from './payment.service.js';
import logger from '../../config/logger.js';

let paymentExpiryTimer;

export function startPaymentExpiryJob() {
  if (paymentExpiryTimer) return;

  const runExpiry = async () => {
    try {
      await expirePendingPayments();
    } catch (error) {
      logger.error(
        `Could not expire pending checkouts: ${error.message}`
      );
    }
  };

  // Server start hone par ek baar check karo.
  void runExpiry();

  // Uske baad har 60 seconds mein check karo.
  paymentExpiryTimer = setInterval(() => {
    void runExpiry();
  }, 60_000);

  paymentExpiryTimer.unref();
}

export function stopPaymentExpiryJob() {
  if (paymentExpiryTimer) {
    clearInterval(paymentExpiryTimer);
    paymentExpiryTimer = undefined;
  }
}
