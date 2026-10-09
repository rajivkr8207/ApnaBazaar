# ApnaBazaar architecture

## 1. Product overview

ApnaBazaar is a multi-vendor commerce application. Sellers manage their own products, variants, and inventory. Customers can browse the public catalog and maintain a personal cart. Administrative category management and account capabilities are provided by the backend.

The repository currently contains the Node.js backend only; the `frontend/` directory is empty and no frontend build is checked in. Backend checkout/payment APIs exist, but customer-facing payment UI, order fulfillment, and seller/admin dashboards are not implemented end to end.

## 2. Runtime and technology

| Area                | Current implementation                                                      |
| ------------------- | --------------------------------------------------------------------------- |
| Runtime             | Node.js, ES modules                                                         |
| HTTP API            | Express 5                                                                   |
| Database / ODM      | MongoDB / Mongoose                                                          |
| Authentication      | JWT access and refresh tokens, HTTP-only cookies, bcryptjs password hashing |
| Validation          | express-validator                                                           |
| Frontend (current)  | No frontend source or manifest is present; `frontend/` is empty             |
| Frontend (required) | Vite, React, Redux Toolkit, React Router, React Toastify, Lucide React; JavaScript |
| Security middleware | Helmet, CORS, HPP, request-size limits, and express-rate-limit              |
| Email               | Nodemailer-backed mail service                                              |
| Image support       | ImageKit service and upload middleware are present                          |

## 3. Repository layout

```text
backend/
  server.js
  src/
    app.js
    app.middleware.js
    app.routes.js
    config/                 # environment, MongoDB, mail, Redis, logging, validation
    middlewares/            # authentication, errors, uploads
    modules/
      user/                 # accounts and authentication
      category/             # hierarchical catalog categories
      product/              # seller product management and public catalog
      productVariant/       # product options / variants
      productStock/         # inventory by product or variant
      cart/                 # authenticated customer cart
      payment/              # Razorpay checkout, verification, webhooks, order history, refunds
      price/                # shared amount/currency schema
      health/               # health endpoint
    services/               # mail and image service integrations
    utils/                  # API response/error and async handler helpers
frontend/                       # currently empty; planned independent Vite package
  package.json
  index.html
  src/
    app/                        # React entry point and application setup
    features/                   # feature-owned UI and Redux slices
    components/                 # shared reusable UI
    pages/                      # route-level screens
    services/                   # same-origin API clients
    hooks/                      # shared/custom React hooks
    store/                      # Redux Toolkit store
    routes/                     # React Router configuration
    theme/
      tokens.css                # single source for colors, surfaces, borders, shadows, gradients
docs/
```

Each feature module generally has a model, service, controller, route, and validation file. Keep database operations and business rules in services; controllers should translate HTTP input/output and routes should compose validation and authorization middleware.

The frontend layout above is the target architecture, not a description of checked-in files. Use JavaScript and keep UI-specific state in feature slices only when it is shared across screens; keep transient component state local. `theme/tokens.css` is the single source of visual design tokens, imported once and consumed through CSS custom properties. Do not scatter raw color, border, shadow, or gradient values across component styles. The backend remains an independent API and must not absorb frontend business presentation logic.

## 4. Request lifecycle

1. `backend/server.js` loads configuration, connects to MongoDB, then starts the HTTP server.
2. `backend/src/app.js` installs common middleware and mounts `/api/v1`. The current static middleware serves `public/dist` and the fallback sends `public/dist/index.html`; neither the frontend source nor that build output is present in the repository now.
3. `backend/src/app.routes.js` mounts feature routers.
4. Route middleware validates input and applies authentication/role checks as needed.
5. Controllers invoke feature services and return the shared `ApiResponse` envelope.
6. Errors are passed to the shared Express error middleware.

API response envelope:

```json
{
  "statusCode": 200,
  "data": {},
  "message": "Success",
  "success": true
}
```

## 5. Main modules and API surface

All API routes are prefixed with `/api/v1`.

### Health

- `GET /health`

### Authentication and user profile

The router is mounted at `/auth`:

- `POST /auth/register`
- `POST /auth/verify-email`
- `POST /auth/resend-otp`
- `POST /auth/login`
- `POST /auth/refresh-token`
- `POST /auth/logout`
- `GET /auth/profile`
- `PATCH /auth/profile`
- `PATCH /auth/change-password`

Access JWTs can be read from the `accessToken` cookie or the `Authorization: Bearer` header. Public registration is intended to create customer accounts; privileged roles must not be accepted from public input.

### Categories

- `GET /categories` — public active-category list
- `POST /categories` — admin-only create
- `PATCH /categories/:id` — admin-only update
- `DELETE /categories/:id` — admin-only delete
- `PATCH /categories/:id/activate`
- `PATCH /categories/:id/deactivate`

Category records may reference a parent category. Hierarchy validation prevents self-parenting and circular ancestry.

### Products

- `GET /products/catalog` — public, active and published catalog with pagination, search, category filter, and sort
- `GET /products` — seller's own products
- `POST /products` — seller creates a product
- `GET /products/:id` — seller reads an owned product
- `PATCH /products/:id` — seller updates an owned product
- `DELETE /products/:id` — seller deletes an owned product
- `PATCH /products/:id/activate`
- `PATCH /products/:id/deactivate`

Seller product CRUD is scoped to the authenticated seller. A public listing requires both `isActive: true` and `status: "published"`.

### Product variants

- `GET /products/:productId/variants`
- `POST /products/:productId/variants`
- `GET /products/:productId/variants/:variantId`
- `PATCH /products/:productId/variants/:variantId`
- `DELETE /products/:productId/variants/:variantId`

Variant endpoints are seller-only and verify that the seller owns the parent product.

### Stock

- `GET /products/:productId/stock`
- `PATCH /products/:productId/stock`
- `GET /products/:productId/variants/:variantId/stock`
- `PATCH /products/:productId/variants/:variantId/stock`

Stock operations are seller-only and validate product/variant ownership. Stock is stored separately from the product/variant documents.

### Cart

- `GET /cart`
- `POST /cart/items`
- `PATCH /cart/items/:itemId`
- `DELETE /cart/items/:itemId`
- `DELETE /cart`

Cart routes require a valid access token. Services check product/variant availability and stock on add/update and store an amount/currency price snapshot.

### Payment

The payment router is mounted at `/payments` under `/api/v1`:

- `POST /payments/checkout` — authenticated; requires an `Idempotency-Key` header and delivery address; reprices the current cart, creates a Razorpay order, snapshots the order/address, and reserves stock.
- `POST /payments/verify` — authenticated; validates the Razorpay checkout signature, fetches payment status, captures authorized payments, and settles captured payments.
- `POST /payments/webhook` — provider-signed raw-body callback for authorized/captured/failed attempts and refund events.
- `GET /payments` — authenticated user's paginated order history.
- `GET /payments/:paymentId` — authenticated user's order details.
- `GET /payments/admin/refunds` — admin refund-reconciliation queue.
- `POST /payments/:paymentId/refund` — admin-only full refund request/retry for a captured payment.

Checkout recalculates prices using current product/variant data and accepts INR only. It stores immutable item/seller/price and shipping-address snapshots. Inventory is reserved transactionally for 15 minutes, then decremented after verified capture or released on expiry. A capture arriving after a reservation was released triggers a full refund. Repeated checkout requests using the same idempotency key reuse the existing pending checkout; provider verification and webhook processing are safe to repeat.

Configure `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`. Configure Razorpay webhook events `payment.authorized`, `payment.captured`, `payment.failed`, `order.paid`, `refund.processed`, and `refund.failed` to call `/api/v1/payments/webhook`. Razorpay does not expose an order-expired webhook for this flow; the backend timer expires local reservations. Failed payment attempts release inventory and require a new provider order. The JSON parser retains the exact raw body for webhook HMAC validation. MongoDB replica-set/sharded transactions are required.

Not implemented: frontend checkout UI, tax/shipping charges, seller split transfers/payouts, fulfillment/tracking, returns, and partial refunds. Refund completion does not restock inventory. Ambiguous refund requests stay in the admin reconciliation queue and are not blindly resubmitted; only a provider-confirmed failure can be retried.

## 6. Authentication and trust boundaries

- Browser authentication uses same-origin HTTP-only cookies; the frontend must not persist JWTs in local storage or session storage.
- Checkout and payment verification require customer authentication. The webhook uses Razorpay's signature, not a session token.
- Server-side ownership is authoritative. Never accept a seller ID from request data for seller operations; derive it from the verified JWT.
- Public catalog endpoints must select only storefront-safe fields and must not return password, OTP, refresh-token hash, or provider identifiers.
- Customer-supplied price values are not authoritative. Recalculate and validate prices from database records before checkout.
- Fulfill only after validating the checkout signature and Razorpay-reported order, amount, currency, and captured status. A client success callback by itself is not payment confirmation.
- Reserve stock atomically at checkout, decrement only after capture, and release on reservation expiry.
- Validate all ObjectIds, enums, quantities, sort choices, and search input at the API boundary.
- User-facing errors should not expose stack traces, secrets, or raw database internals.

## 7. Frontend delivery

The intended frontend is a separate Vite/React application built with JavaScript, Redux Toolkit, React Router, React Toastify, and Lucide React. Its feature-based source structure is shown above. Use Toastify for user-facing operation feedback, Lucide React for icons, React Router for navigation, and Redux Toolkit for shared application state. All theme values belong in the centralized theme-token file.

Current repository status: there are no frontend source files or `frontend/package.json`; the directory is empty. The Express app serves `public/dist`, which is also absent, so no working storefront is currently delivered by this checkout. Once implemented, configure Vite's build output to match the backend static directory or deliberately update the backend serving configuration; keep API routes mounted before any SPA fallback. The frontend should call the same-origin API and catalog/cart behavior depends on a reachable MongoDB database with catalog data.

## 8. Configuration

Set backend environment variables in `backend/.env` using `backend/.env.example` as a guide:

- `PORT`, `NODE_ENV`, `MONGODB_URI`
- `JWT_ACCESS_SECRET`, `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`
- `FRONTEND_URL`
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`
- `IMAGE_KIT_PUBLIC_KEY`, `IMAGE_KIT_PRIVATE_KEY`, `IMAGE_KIT_URL_ENDPOINT`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
- Optional Redis settings: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`

Secrets must remain outside source control. Production JWT secrets must be high entropy and distinct.

## 9. Known gaps and architectural direction

- Backend Razorpay checkout/order snapshots, verification, signed webhooks, transactional inventory reservation/settlement, expiry, history, and admin full refunds are implemented; live-account integration still needs verification.
- The customer-facing frontend checkout, seller payouts, tax/shipping calculations, fulfillment/tracking, partial refunds, and returns are not implemented.
- The browser does not yet have account registration, seller dashboards, category admin, or completed payment UI.
- The requested Vite/React frontend, its package manifest, Redux store/slices, routes, reusable UI, and centralized design tokens are not yet implemented.
- Current backend static serving points to missing `public/dist` output; frontend build and backend deployment wiring must be completed together.
- Google is an allowed user provider in the schema, but a complete OAuth sign-in flow is not exposed as an API in the current route set.
- Database availability and seed data are deployment prerequisites for storefront product results.
- Add automated service/API tests for payment retries, replayed callbacks, late captures, refund reconciliation, and inventory concurrency.
