# Implementation plan

This plan reflects the repository's current state. Checkboxes distinguish existing capability from work that remains before a production-ready multi-vendor commerce launch.

## Phase 1 — Repository baseline and conventions

- [x] Identify Node/Express/Mongoose backend and existing modular structure.
- [x] Preserve existing route/service/model conventions.
- [x] Establish shared API response, error, and validation helpers.
- [ ] Create a separate JavaScript frontend package with Vite and React; the current `frontend/` directory is empty.
- [ ] Add the required frontend dependencies: Redux Toolkit, React Router, React Toastify, and Lucide React.
- [ ] Define the feature-based frontend structure and one centralized theme-token file before implementing UI features.
- [ ] Add and document a reproducible automated test baseline; current `npm test` is a placeholder.
- [ ] Add deployment/operations documentation for production environments.

## Phase 2 — Identity and access control

- [x] User schema includes customer/seller/admin roles, local/Google provider fields, profile and account status fields.
- [x] Local password hashing and comparison use bcryptjs.
- [x] Refresh token is stored as a hash with rotation/revocation behavior in user service.
- [x] JWT, role, and seller middleware are present.
- [ ] Add integration tests for register, OTP expiry/reuse, login, blocked/inactive accounts, refresh rotation, replay, logout, and role authorization.
- [ ] Complete a verified Google OAuth flow before advertising Google sign-in.
- [ ] Review cookie lifetime, `SameSite`, CSRF strategy, and secrets in production deployment.

## Phase 3 — Catalog and seller operations

- [x] Hierarchical categories and circular-parent validation.
- [x] Seller-scoped product CRUD with category, slug, images, price, attributes, status, and SEO fields.
- [x] Product variants with SKU, attributes, images, and optional price.
- [x] Product and variant stock management endpoints.
- [x] Public catalog API returns active, published products and active variants.
- [x] Public active category API.
- [ ] Add service/API tests for seller ownership across product, variant, and stock operations.
- [ ] Define hard-delete behavior for categories/products and dependent variant/stock records; prefer archival or soft deletion when order history exists.
- [ ] Verify unique indexes and migrate/backfill existing records before applying stricter production constraints.
- [ ] Define seller onboarding, product review, and publication authorization policy.

## Phase 4 — Customer storefront

- [ ] Implement the React/Vite storefront and verify the production build output is served by Express; source and `public/dist` are currently absent.
- [ ] Centralize smoky-black, glass, white, lime, text, border, shadow, and gradient tokens; keep component styles on shared variables.
- [ ] Build feature-based pages/components and wire React Router, Redux Toolkit, Toastify, and Lucide React.
- [ ] Connect category list and product search/filter/sort/pagination to the existing API.
- [ ] Render variant options and variant price overrides from API data.
- [ ] Connect cookie-based login, profile check, and authenticated cart UI without browser token storage.
- [ ] Complete keyboard and screen-reader review for menus, dialogs, cart drawer, status messages, and Escape-key handling.
- [ ] Verify desktop/mobile layout and interactions in a browser after implementation.
- [ ] Add user registration/email-verification UI if self-serve customer sign-up is in product scope.
- [ ] Add seller and administrator interfaces only after their workflows and permissions are specified.

## Phase 5 — Cart reliability and checkout

- [x] One cart per user with embedded product/variant lines and amount/currency snapshots.
- [x] Add, update, remove, and clear cart operations.
- [x] Validate product activity, variant membership/activity, stock existence, and requested quantity on mutation.
- [ ] Decide whether cart fetch should reconcile or flag removed/inactive/out-of-stock items.
- [ ] Make concurrent cart writes safe against lost updates where required.
- [ ] Implement durable order and seller-fulfillment schemas with immutable item/address/price/tax snapshots.
- [ ] Recalculate totals from current database data at checkout.
- [ ] Add atomic/transactional stock reservation, decrement, release, and idempotent retry behavior.
- [ ] Implement payment provider order creation, signature/webhook verification, payment status transitions, failure handling, and refunds.
- [ ] Add end-to-end tests for concurrent checkout, duplicate webhooks, payment failure, and inventory release.
- [ ] Replace the storefront's unavailable-checkout message only after the real flow passes tests.

## Phase 6 — Release hardening

- [ ] Add automated unit, API integration, and browser tests.
- [ ] Run lint, tests, production startup checks, and security review.
- [ ] Verify database indexes/migrations using representative existing data.
- [ ] Verify CSP, CORS, cookie, proxy, TLS, logging, rate-limit, and secret-management settings in deployment.
- [ ] Seed or import approved catalog content; do not ship placeholder inventory as real products.
- [ ] Review copy/policies for shipping, returns, authenticity, privacy, and customer support.
- [ ] Ensure logs and API responses do not contain passwords, OTPs, raw refresh tokens, or payment secrets.

## Suggested next delivery order

1. Establish MongoDB connectivity, sample development seed data, and meaningful tests for current catalog/cart/seller APIs.
2. Resolve schema/index behavior and delete/lifecycle policies against existing data.
3. Build the required Vite/React frontend, wire it to Express/API, and test account/catalog/cart against a real local database, including mobile accessibility.
4. Design order/fulfillment and concurrency-safe inventory before integrating payment.
5. Complete real payment and webhook workflows, then enable checkout UI.
6. Add production operational controls and perform release acceptance.

## Definition of done

A phase is complete only when its acceptance criteria are implemented, validated against the real behavior, documented, and its remaining gaps are explicitly listed. Visual presence or a successful static-page response does not prove that database-backed catalog, auth, cart, or payment flows work.
