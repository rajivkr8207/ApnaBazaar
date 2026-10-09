# ApnaBazaar

ApnaBazaar is a multi-vendor commerce project with an Express/MongoDB backend and a lightweight sneaker-focused storefront. Sellers manage their own products, variants, and inventory. Customers can browse the public catalog and maintain an authenticated cart.

> **Current scope:** backend catalog, authenticated-cart, and Razorpay payment/order APIs are present. The customer-facing frontend is not implemented yet.

## Repository

```text
backend/       Node.js API and MongoDB application
frontend/      Empty; planned Vite/React application
docs/          Product, architecture, database, design, and implementation docs
```

## Technology

- Node.js with JavaScript ES modules
- Express 5
- MongoDB with Mongoose
- bcryptjs and JWT for local authentication
- express-validator for API validation
- Required frontend stack (not yet installed/implemented): Vite, React, Redux Toolkit, React Router, React Toastify, and Lucide React; JavaScript only.

## Prerequisites

- A Node.js version supported by the installed dependencies.
- MongoDB reachable from the backend process.
- MongoDB configured as a replica set or sharded cluster; checkout uses transactions.
- SMTP settings for email-based registration verification if using local signup.
- Valid JWT secrets and expiry values.
- Razorpay test/live API credentials and a webhook secret.

## Local setup

1. Copy `backend/.env.example` to `backend/.env`.
2. Set `PORT`, `MONGODB_URI`, access/refresh JWT secrets and expiries, `FRONTEND_URL`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`.
3. Configure SMTP if verification emails are needed. ImageKit and Redis variables are optional for the storefront unless their corresponding services are used.
4. Install backend dependencies and start the server:

```powershell
cd backend
npm install
npm run dev
```

The backend currently points static serving at `public/dist`, but neither that build output nor frontend source files are present. Once the Vite application is implemented, its build output must be wired to that directory (or the backend serving configuration updated). A reachable database and catalog data will also be required for live catalog results.

## Main API routes

All routes are prefixed by `/api/v1`.

| Capability         | Routes                                                                                                          |
| ------------------ | --------------------------------------------------------------------------------------------------------------- |
| Health             | `GET /health`                                                                                                   |
| Auth/profile       | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh-token`, `POST /auth/logout`, `GET /auth/profile` |
| Categories         | `GET /categories`; admin mutations under `/categories`                                                          |
| Public catalog     | `GET /products/catalog`                                                                                         |
| Seller products    | `/products`                                                                                                     |
| Seller variants    | `/products/:productId/variants`                                                                                 |
| Seller stock       | `/products/:productId/stock` and `/products/:productId/variants/:variantId/stock`                               |
| Authenticated cart | `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:itemId`, `DELETE /cart/items/:itemId`, `DELETE /cart`      |
| Payments/orders | `POST /payments/checkout`, `POST /payments/verify`, `POST /payments/webhook`, `GET /payments`, `GET /payments/:paymentId` |
| Admin refund | `POST /payments/:paymentId/refund` |

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for the full route and module map.

Checkout accepts INR carts only and requires a delivery-address snapshot plus an `Idempotency-Key` header. Configure Razorpay webhook events `payment.authorized`, `payment.captured`, `payment.failed`, `order.paid`, `refund.processed`, and `refund.failed` at `/api/v1/payments/webhook`. The backend APIs are implemented, but a customer-facing checkout UI is not present yet.

## Development commands

From `backend/`:

```powershell
npm run dev
npm start
npm run lint
npm run format:check
```

The current `npm test` script is a placeholder that exits with an error; it does not run a test suite. Use lint and syntax checks for basic validation, and add meaningful unit/API/browser tests before relying on automated behavior verification.

## Documentation

- [Product requirements](./docs/PRD.md)
- [Architecture and API map](./docs/ARCHITECTURE.md)
- [Database design](./docs/DATABASE_DESIGN.md)
- [UI/UX design](./docs/UI_UX_DESIGN.md)
- [Engineering rules](./docs/Rules.md)
- [working memory](./docs/MEMORY.md)
- [Implementation plan](./docs/TASK.md)

`docs/MEMORY.md` and `docs/TASK.md` remain compatibility pointers to the canonical AI memory and implementation plan documents. The canonical visual design document is `docs/UI_UX_DESIGN.md`.
