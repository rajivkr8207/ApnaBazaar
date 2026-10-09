# Product requirements — ApnaBazaar

## 1. Product summary

ApnaBazaar is a multi-vendor e-commerce platform intended to help sellers manage their catalog and inventory while enabling customers to discover and buy products through a straightforward storefront.

The current product category and visual direction are sneaker-focused. The catalog and data model are general enough to accommodate additional product categories as the application evolves.

## 2. Problem statement

Small and independent sellers need a reliable place to maintain product details, options, and stock. Customers need a clear, attractive way to browse what is currently available without having to understand the seller-side system.

The product should make those two experiences feel like one cohesive marketplace while keeping seller data and account capabilities appropriately separated.

## 3. Users and roles

### Customer

- Browse active categories and published products without signing in.
- Search, filter, sort, and paginate the public catalog.
- Choose an available product variant.
- Sign in and manage a personal cart.
- See product options and the price captured for each cart item.
- Start checkout, complete Razorpay payment, and view persisted order history; fulfillment/tracking is not yet available.

### Seller

- Register/sign in using a seller-enabled account.
- List, inspect, update, activate/deactivate, and remove owned products.
- Add and maintain product variants such as size/color.
- Set and inspect base-product and variant-level stock.
- Never read or modify another seller's records through an ID substitution.

### Administrator

- Create and maintain categories and category hierarchy.
- Activate/deactivate categories.
- Eventually moderate sellers, products, and marketplace operations.

Admin and seller account provisioning policy should be explicitly defined before public seller onboarding is opened. Public customer registration must not allow self-assigned admin privileges.

## 4. Product goals

1. Make real catalog data easy to discover.
2. Let sellers manage product and stock records safely within their ownership scope.
3. Keep product options and prices understandable to customers.
4. Present a premium sneaker-shopping experience that feels editorial rather than like an unstyled admin system.
5. Keep the app simple to operate and extend using the existing Node, Express, and MongoDB stack.

## 5. Success criteria

- A visitor can load the storefront and browse only active, published catalog records.
- Search, category filtering, sort, and pagination use server data and do not expose seller-only records.
- A seller can manage only products they own, including variants and stock.
- Cart operations reject unavailable products/options and quantities above stock.
- Sensitive auth data is excluded from ordinary API user output; tokens are not stored in browser storage.
- Core shopping surfaces are usable on mobile and desktop, with keyboard focus and reduced-motion support.
- Checkout never reports success unless a real payment/order flow confirms it.

## 6. Functional requirements

### Accounts and authentication

- Support customer, seller, and admin roles.
- Support local credentials; a Google provider is represented in the model but OAuth routes are not currently complete.
- Hash local passwords.
- Support email verification OTP and account status checks.
- Issue and rotate access/refresh tokens using the existing configuration.
- Support profile retrieval/edit, password change, logout, and token refresh.

### Category management

- Categories have display name, unique slug, description, image, active state, and optional parent.
- A parent must exist; categories cannot be their own ancestor.
- Public category lists include only active categories.

### Catalog/product management

- Products belong to one seller and a category.
- Product data includes name, slug, description, base price/currency, images, optional SKU/brand/attributes/SEO, status, and active state.
- Sellers may modify only products they own.
- Public catalog returns only active `published` products and active variants.
- Product search, category filter, sort, and pagination have bounded and validated inputs.

### Variants and inventory

- A variant belongs to exactly one product and carries its own SKU, attributes, images, optional price override, and active state.
- Sellers must own the product before managing any child variant or stock.
- Stock can be tracked for a product with no variant or for an individual variant.
- Stock status is derived from quantity using the currently defined threshold; the inventory quantity is authoritative.

### Cart

- A signed-in user has one cart.
- Cart line identity is the product plus optional variant.
- Adding an existing product/variant increments that line rather than creating a duplicate line.
- Quantity changes and additions validate current availability.
- Price snapshots are for cart display only; checkout must recompute all values.

### Checkout and payment

- An authenticated customer can start checkout only with a non-empty cart and a delivery-address snapshot.
- The backend recalculates current product/variant prices, accepts INR carts only, and creates a Razorpay order. Client-provided prices are never trusted.
- Checkout requires an `Idempotency-Key`; a retry reuses its pending order rather than creating another.
- Persist immutable product, variant, seller, quantity, price, and address snapshots with the order/payment record.
- Reserve stock transactionally for 15 minutes. Decrement physical stock only after Razorpay-confirmed capture; release reservations at expiry.
- Verify the Razorpay checkout signature and fetch the provider's payment status, amount, currency, and order ID before marking the order paid.
- Process signed Razorpay webhooks idempotently. If capture arrives after inventory reservation expiry, request a full refund rather than fulfill unreserved inventory.
- A failed Razorpay payment attempt releases its reservation; retry by starting a new checkout/provider order.
- Allow administrators to request full refunds for captured orders. A refund does not automatically restock inventory.
- Never report payment success based only on the browser callback.

### Storefront

- Landing page introduces the brand, provides category and product discovery, and offers search/sort controls.
- Product cards display product imagery, name, category/brand, price, and available variant selection.
- Bag UI displays items, quantity controls, removals, and a subtotal based on stored cart snapshots.
- A visitor may browse before sign-in; cart mutation requires authentication.
- The backend payment API is implemented, but the storefront checkout UI is not. Newsletter features remain unimplemented; neither flow may simulate success.

## 7. Non-functional requirements

- JavaScript ES modules only in the backend; use the existing Mongoose ODM.
- The frontend must use JavaScript (not TypeScript) with Vite, React, Redux Toolkit, React Router, React Toastify, and Lucide React.
- Organize the frontend by feature, with separate shared components, pages, services, hooks, Redux slices/store, and routes where appropriate. Keep the frontend application and backend API as separate packages and runtime concerns.
- Keep every visual design token in one centralized frontend theme configuration. Components must consume the shared tokens rather than defining their own color, border, shadow, or gradient values.
- Implement the visual direction in `UI_UX_DESIGN.md`; do not represent the target React frontend as present until its source, dependencies, and build are in the repository.
- Maintain feature-module organization and shared response/error helpers.
- Validate inputs and enforce authorization at every relevant API.
- Use same-origin HTTP-only cookies in the browser flow; do not persist tokens in local/session storage.
- Keep public responses minimal and avoid leaking secrets or internal operational details.
- Keep search and pagination bounded; use database indexes based on real query patterns.
- Make the storefront responsive, keyboard accessible, semantic, and tolerant of reduced motion.
- Keep dependencies and build tooling minimal unless a concrete requirement needs more.

## 8. Out of scope for the current increment

- Shipping/tax calculation, seller split settlements/transfers, fulfillment/tracking, returns, and partial refunds.
- Seller dashboard and admin dashboard UIs.
- Google OAuth implementation.
- Newsletter collection/subscription service.
- Production merchandising promises (shipping thresholds, delivery SLAs, authenticity guarantee) until backed by actual policy and operations.

## 9. Current delivery status

Implemented in the repository: user/auth APIs, category admin APIs and hierarchy, seller product CRUD, product variants, stock endpoints, customer catalog reads, and authenticated cart operations.

Not implemented in the repository: the frontend itself. `frontend/` is empty, there is no frontend package manifest or Vite build, and the backend's static middleware/fallback target (`public/dist`) is not present. The requested React stack and feature-based structure below are requirements for the future frontend, not claims about current code.

Backend Razorpay checkout/order snapshots, verification, signed webhooks, transactional inventory reservation/settlement, expiry, order history, and admin full refunds are implemented. Still incomplete or requiring verification: customer-facing checkout UI, live Razorpay test/live account and webhook flow, live MongoDB seed/catalog setup, production onboarding policy, general cart concurrency behavior, shipping/tax and seller settlement/fulfillment, account registration/verification UI, seller/admin dashboards, automated backend tests, and production operational documentation.

## 10. Acceptance checklist for releases

- [ ] Lint and syntax checks pass.
- [ ] Catalog queries return only active/published products.
- [ ] Seller ownership tests cover product, variant, and stock routes.
- [ ] Cart tests cover merge, quantity bounds, invalid IDs, missing stock, inactive products, inactive variants, and user isolation.
- [ ] Browser tests cover mobile navigation/search, categories, sorting, variant selection, sign-in, cart drawer, and empty/error states.
- [ ] Database indexes are checked against existing data and deployed deliberately.
- [ ] Documentation accurately labels features as implemented, planned, or unavailable.
