# AI working memory

This document records stable project facts and implementation preferences for coding agents. It is not a substitute for reading the relevant source files before a change.

## Project identity

- Repository: ApnaBazaar, a multi-vendor marketplace with a sneaker-focused customer storefront.
- Backend is in `backend/`; `frontend/` currently exists but is empty; project documentation is in `docs/`.
- The intended visual direction is specified in `UI_UX_DESIGN.md`.

## Stack and conventions

- Use Node.js, JavaScript ES modules, Express 5, MongoDB, and Mongoose for backend changes.
- Do not introduce TypeScript, Prisma, or another ORM.
- Backend feature folders normally contain `.model.js`, `.service.js`, `.controller.js`, `.route.js`, and `.validate.js`.
- Use explicit `.js` file extensions in local ESM imports.
- Reuse `ApiError`, `ApiResponse`, `asyncHandler`, and shared `validate` middleware.
- Required frontend target: Vite, React, Redux Toolkit, React Router, React Toastify, and Lucide React, using JavaScript (not TypeScript).
- The frontend target is feature-based, with features, reusable components, pages, services, hooks, Redux slices/store, routes, and a centralized theme.
- Current frontend status: there are no frontend source files or package manifest. `backend/src/app.middleware.js` and `backend/src/app.js` point to `public/dist`, which is also absent. Do not describe storefront behavior as implemented; build and wire the frontend before treating it as available.
- Put all frontend palette and design-token values (including glass surfaces, typography colors, borders, shadows, and gradients) in `frontend/src/theme/tokens.css`; component styles should consume the shared variables.

## Security and data invariants

- Public registration must never grant admin/seller privileges based on untrusted request fields.
- Derive user/seller identity from verified auth and scope database queries by ownership.
- Never trust customer-provided prices or client-side stock; verify current product/variant and inventory on the server.
- Do not place credentials in browser storage. Use the existing HTTP-only cookie/token flow.
- Do not expose password hashes, OTP values/expiry, refresh-token hashes, Google IDs, or other secrets in ordinary responses.
- Cart snapshots do not constitute an order or stock reservation.
- Public catalog must include only active and published products, active categories, and active variants.
- Do not claim checkout, payments, newsletter, shipping guarantees, reviews, or other integrations are complete unless source code and tests prove it.

## Current API vocabulary

- API prefix is `/api/v1`.
- Authentication router is `/auth`, not `/users`.
- Public catalog: `GET /products/catalog`.
- Public categories: `GET /categories`.
- Seller products, variants, and stock APIs require JWT and seller role.
- Cart APIs require JWT and are user-scoped.
- Check `backend/src/app.routes.js` and the corresponding route module for the current exact endpoints before documenting or changing them.
- Payment module files exist but the payment router is not mounted in `backend/src/app.routes.js`; do not describe a payment endpoint as available.

## Working approach

1. Inspect the current working tree and do not overwrite unrelated user changes.
2. Read the relevant module, its route/validator/model/service, shared middleware, and the callers.
3. Identify API compatibility and database migration risks before editing schemas.
4. Make a focused, complete change and update documentation if behavior or a contract changes.
5. Run the smallest meaningful validation; backend lint is `npm run lint -- --quiet` from `backend/`.
6. `npm test` is currently a placeholder and is not evidence that behavior is tested.
7. For front-end changes, serve the app through Express and inspect the rendered page on desktop and mobile. A failed catalog response without a reachable MongoDB instance is an environment/data issue, not proof of a successful catalog integration.
8. Report what was verified and clearly state unverified integrations.

## Reference docs

- Product requirements and scope: `PRD.md`
- System modules and API map: `ARCHITECTURE.md`
- Data relationships/index considerations: `DATABASE_DESIGN.md`
- Visual and interaction contract: `UI_UX_DESIGN.md`
- Engineering constraints: `Rules.md`
- Work sequencing and completion status: `IMPLEMENTATION_PLAN.md`
