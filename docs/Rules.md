# Engineering rules

These rules apply to contributions in this repository. Follow the installed codebase patterns unless a documented requirement justifies a change.

## Language and stack

- Backend: JavaScript with Node.js ES modules, Express, MongoDB, and Mongoose.
- Do not introduce TypeScript, another ORM, or a second server framework.
- Prefer dependencies already in `backend/package.json`; add a dependency only for a concrete need.
- Frontend requirement: Vite, React, Redux Toolkit, React Router, React Toastify, and Lucide React, using JavaScript only (not TypeScript).
- Organize frontend code by feature with separate feature modules, reusable components, pages, services, hooks, Redux slices/store, and route configuration where appropriate. Keep this frontend package separate from the Express/MongoDB backend.
- The frontend is not implemented yet: `frontend/` is empty and has no package manifest or Vite build. The backend currently targets `public/dist`, which is absent. Keep documentation explicit about this until implementation and serving/build integration exist.

## Module boundaries

- Keep feature code under `backend/src/modules/<feature>/`.
- Route files define URL composition and middleware.
- Validation files define request validation using `express-validator` and the shared `validate` middleware.
- Controllers handle HTTP request/response concerns and call services.
- Services contain business rules and database operations.
- Models define persistence shape, constraints, references, hooks, and indexes.
- Use shared `ApiError`, `ApiResponse`, and `asyncHandler` rather than inventing module-specific response envelopes.
- Use explicit `.js` extensions in relative ES-module imports.

## API and validation

- Validate body, route params, and query parameters before using them.
- Reject invalid ObjectIds, out-of-range quantities, unsupported enums, and unknown sort values rather than silently guessing.
- Do not trust role, user ID, seller ID, price, stock, or payment status supplied by a client.
- Derive the acting user from verified authentication. Apply seller ownership checks at the service/database query boundary.
- Return only the fields required for the caller's use case.
- Keep error messages useful but do not leak raw database errors, secrets, stack traces, or private identity fields.

## Mongoose and data integrity

- Use the existing model names and `ref` names consistently.
- Add timestamps to business entities with lifecycle/history needs.
- Model money with numeric amount plus currency; avoid floating-point calculations for payment totals without a deliberate precision strategy.
- Treat `unique` as an index requirement, not a Mongoose validation rule; map duplicate-key failures to appropriate API errors.
- Avoid duplicate indexes. Before adding/changing unique indexes, check existing database contents and plan a migration.
- Keep optional unique fields absent or use suitable partial/sparse semantics; account for MongoDB's `null` behavior.
- Enforce cross-document rules in services; Mongoose references alone do not guarantee referential integrity.
- Never assume cart validation reserves stock. Checkout must use transaction/atomic conditional updates or another concurrency-safe inventory design.

## Authentication and security

- Hash passwords with bcryptjs; never store plaintext passwords.
- Store refresh-token hashes, not raw long-lived refresh tokens. Rotate tokens and revoke server-side state on logout.
- Keep password, OTP, refresh-token hash, and provider identifiers out of ordinary API responses.
- Public registration may create customers only. Privileged account provisioning requires an authorized flow.
- Use HTTP-only cookies for browser tokens; never put access/refresh tokens in localStorage or sessionStorage.
- Maintain restrictive CORS, request size limits, Helmet CSP, rate limiting, and safe rendering of untrusted data.
- Verify Razorpay checkout signatures and webhook signatures using server secrets; retain the webhook's exact raw body for HMAC verification.
- Treat Razorpay provider state as authoritative only after checking order ID, amount, currency, and captured state. Use idempotency keys for checkout and never fulfill from the browser callback alone.
- Reserve and settle inventory transactionally. Do not lower seller stock below reserved quantity; reconcile late captures/refunds explicitly.
- Escape user search input before compiling database regexes and cap search length/page size.

## Frontend and UX

- Match the smoky-black/glass, subtle green glow, clean-white product-card, and selective lime-accent direction in `UI_UX_DESIGN.md`.
- Define all design tokens in one shared frontend theme file (currently specified as `frontend/src/theme/tokens.css`); never scatter raw color, border, shadow, or gradient values across components.
- Use Redux Toolkit for shared global state, React Router for navigation, React Toastify for user notifications, and Lucide React for icons.
- Use semantic HTML, labels, focus-visible styles, descriptive accessible names, and live status announcements where appropriate.
- Support small screens and `prefers-reduced-motion`.
- Do not present invented products, sales counts, guarantees, shipping terms, subscriptions, or checkout completion as real.
- Keep secrets out of browser code. Prefer same-origin API calls with cookies and `credentials: 'same-origin'`.
- Render user/database strings as text; do not interpolate them into HTML without proper escaping.

## Quality and verification

- Inspect neighboring files and prior art before changing an API or schema.
- Make focused changes and preserve existing API behavior where practical.
- Run `npm run lint -- --quiet` from `backend/` after backend changes.
- Run `node --check` on changed standalone JavaScript when useful.
- Run focused automated tests when available. The current `npm test` script is a placeholder, so do not treat it as a meaningful test suite.
- Exercise the exact behavior in a browser when changing storefront UI; check both desktop and mobile layouts.
- Run `git diff --check` before handing changes back.
- Document behavior, integration limits, migrations, and operational requirements when they change.

## Git and repository hygiene

- Do not commit secrets, `.env` files, generated logs, or dependency directories.
- Do not reformat or rewrite unrelated files to conceal pre-existing issues.
- Keep documentation paths and module references relative to the repository.
