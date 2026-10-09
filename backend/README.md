# Backend setup

## MongoDB

Stock adjustment approvals, checkout reservations, and payment settlement use MongoDB transactions. The database
must be a replica set (a single-node replica set is sufficient for local development)
or a sharded cluster; a standalone MongoDB server cannot run these operations.

For a local MongoDB server:

1. Set `replication.replSetName: rs0` in the MongoDB server configuration and restart it.
2. Run `mongosh` and execute `rs.initiate()` once.
3. Set `MONGODB_URI` in `.env` to
   `mongodb://127.0.0.1:27017/rjsupermarket?replicaSet=rs0&retryWrites=false`.

The application also sets `retryWrites: false` when connecting. This option alone
does not enable transactions on a standalone server.

## Razorpay checkout

Configure these variables in `backend/.env`:

- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` from the Razorpay dashboard (use test credentials during development).
- `RAZORPAY_WEBHOOK_SECRET`, matching the secret configured for the Razorpay webhook.

Configure webhook events `payment.authorized`, `payment.captured`, `payment.failed`, `order.paid`, `refund.processed`, and `refund.failed` at:

```text
https://<your-api-host>/api/v1/payments/webhook
```

The backend reprices the cart from product/variant records, accepts INR only, stores an order and address snapshot, and reserves inventory transactionally for 15 minutes. Captured payments are checked with Razorpay before stock is decremented and purchased cart quantities are removed. Expired reservations are released by the scheduled worker; a capture after release triggers a full-refund request. Failed payment attempts release inventory and require a new Razorpay order for retry. Administrators can request a full refund. Monitor `refund_pending`/`refund_failed` orders and reconcile them with Razorpay when necessary.

Payment API routes:

- `POST /api/v1/payments/checkout` (authenticated): requires `Idempotency-Key` and `shippingAddress`.
- `POST /api/v1/payments/verify` (authenticated): verifies the Razorpay checkout signature and captured payment.
- `POST /api/v1/payments/webhook` (Razorpay signature): processes payment, order-paid, and refund events.
- `GET /api/v1/payments` and `GET /api/v1/payments/:paymentId` (authenticated): current user's order history and details.
- `GET /api/v1/payments/admin/refunds` (admin): lists pending/failed refund reconciliation cases.
- `POST /api/v1/payments/:paymentId/refund` (admin): requests a full refund or retries a provider-confirmed failure. A pending/ambiguous refund is returned for reconciliation, not resubmitted.

Checkout request body:

```json
{
  "shippingAddress": {
    "fullName": "Customer Name",
    "phone": "+919876543210",
    "addressLine1": "12 Example Road",
    "addressLine2": "",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400001",
    "country": "IN"
  }
}
```

Send a fresh `Idempotency-Key` for each new payment attempt. Pass the returned `keyId`, `orderId`, and `amount` to Razorpay Checkout. Submit its `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`, plus the local `paymentId`, to `/api/v1/payments/verify`.

The frontend is not present. The checkout API returns the public Razorpay key ID, provider order ID, amount in paise, and local order ID for a future customer UI. Never expose `RAZORPAY_KEY_SECRET` or `RAZORPAY_WEBHOOK_SECRET`.

Concurrent duplicate refund requests are prevented. If Razorpay's refund result is ambiguous, the order remains `refund_pending` in the admin queue; reconcile its provider status before taking further action. Only a provider-confirmed failed refund may be retried through the API.
