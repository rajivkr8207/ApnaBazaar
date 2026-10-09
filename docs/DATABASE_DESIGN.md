# Database design

## 1. Database technology and conventions

ApnaBazaar uses MongoDB through Mongoose. Models are defined by feature in `backend/src/modules`. References use Mongo ObjectIds and Mongoose `ref` names.

Shared conventions:

- Schemas use `timestamps: true` where records need lifecycle timestamps.
- IDs and references are ObjectIds; reference names must exactly match registered model names.
- Price values use numeric amounts and ISO currency codes. The shared price subdocument is defined in `backend/src/modules/price/price.model.js`.
- Validate at the schema and request boundary. Service logic must also enforce ownership and cross-document rules.
- Add indexes to support actual lookup patterns; do not duplicate indexes declared both inline and as schema indexes.
- Unique index changes on an existing database require migration/index review before deployment.

## 2. Collections and relationships

```text
User 1 ─── * Product (seller)
Category 1 ─── * Product
Category 1 ─── * Category (parentCategory)
Product 1 ─── * ProductVariant
Product 1 ─── * ProductStock (base product stock)
ProductVariant 1 ─── * ProductStock (variant stock)
User 1 ─── 1 Cart
Cart 1 ─── * CartItem ─── 1 Product
CartItem 0..1 ─── 1 ProductVariant
Payment 1 ─── * payment snapshot items (current partial payment model)
```

## 3. Model definitions

### User

Identity/profile fields:

- `fullName`, normalized `username`, normalized `email`, `mobile`, `avatar`
- `role`: `admin`, `seller`, or `customer`
- `provider`: `local` or `google`, plus optional `googleId`
- `isVerified`, `isActive`, `isBlocked`, `lastLoginAt`
- `createdAt`, `updatedAt`

Authentication fields:

- Local `password` is bcrypt-hashed by a save hook and excluded from ordinary queries.
- `otp` and `otpExpire` support email verification and are excluded from ordinary queries.
- `refreshTokenHash` stores a one-way digest rather than the raw refresh token and is excluded from ordinary queries.
- `refreshTokenVersion` supports token-version management.

`username`, `email`, `mobile`, and `googleId` have uniqueness requirements. Optional identity fields should use sparse/partial indexes and be omitted when absent; setting many records to explicit `null` can conflict with uniqueness depending on index semantics. Verify current index definitions and existing data before production migration. Public registration must force `customer`.

### Category

Fields: `name`, globally unique `slug`, `description`, `image`, optional `parentCategory` reference to `Category`, `isActive`, and timestamps.

Parent references must point to an existing category. Self-parenting and circular ancestor chains are invalid. Removing a category that still has child categories or products needs an explicit business policy; the current delete path should be treated as a hard-delete risk until this behavior is enforced.

### Product

Fields include:

- `seller`: required `User` reference
- `category`: required `Category` reference
- `name`, globally unique `slug`, optional SKU and brand
- `description`, numeric `price`, `currency`
- `attributes`, `seo`, `images`
- `status`: `draft`, `published`, `pending_review`, or `rejected`
- `isActive`, timestamps

Public catalog queries require `isActive: true` and `status: "published"`. Sellers can only access and mutate their own products. Current slug uniqueness is global; if tenant-specific duplicate product names/URLs are needed later, evaluate a unique compound index and URL routing before changing that rule.

### ProductVariant

Fields: `product` reference, SKU, attributes map, images, optional override price/currency, `isActive`, timestamps.

Each variant SKU is currently unique. Variant price `0` acts as “use parent product price” in cart display logic. If zero-price variants should be sold for free, distinguish “unset price” from zero rather than relying on this convention.

### ProductStock

Fields: `product`, optional `variant`, integer-like non-negative `quantity`, `stockStatus`, and timestamps.

The current status hook maps zero to `out_of_stock`, quantities 1–5 to `low_stock`, and higher values to `in_stock`. This threshold is a product decision and should be centralized/configured if it needs to vary.

Stock is a separate collection, allowing variant-level stock. Before checkout is added, inventory changes must be atomic or guarded against concurrent purchases. A cart validation alone does not reserve inventory.

### Cart

One cart per user, with embedded items containing:

- product reference
- optional variant reference
- positive integer quantity
- price snapshot `{ amount, currency }`

The cart is mutable and user-scoped. It is not an order record and is not a stock reservation. Revalidate item existence, active/published state, current price, currency, and stock during checkout.

### Payment

The partial payment schema includes status, price, provider metadata, user reference, and embedded item snapshots. Do not rely on it as a complete order model. Before launch, define durable order and seller-fulfillment records, immutable line-item snapshots, payment idempotency, signature verification, status transitions, refunds, and stock reservation/release semantics.

## 4. Index design and review

Indexes currently support unique identity/slug/SKU lookups, seller product lists, category filtering, stock lookups, and one-cart-per-user access.

Review index declarations against production query patterns:

- Ensure a field does not have both an inline `index: true` and an equivalent explicit index.
- Optional unique fields such as mobile and Google ID need safe sparse/partial semantics.
- A compound `{ product: 1, variant: 1 }` unique stock index with `variant: null` needs validation against MongoDB null/missing semantics; test base-product stock uniqueness explicitly.
- Mongoose's `unique` option creates an index; it is not a document validator.
- Use a controlled migration/maintenance process for index changes. Do not rely on automatic production index creation without reviewing its operational impact.

## 5. Data lifecycle and integrity

MongoDB references do not automatically cascade on delete. Product deletion must account for variant and stock records; category deletion must account for products and children; user deletion must account for carts and seller inventory. Prefer soft-deactivation/archival for commerce history. Establish explicit cleanup, retention, and audit policies before hard deletion.

Service-layer checks are needed for:

1. Seller owns product.
2. Variant belongs to the requested product.
3. Category exists and is permitted.
4. Product/variant is purchasable and has enough stock.
5. Cart price is recalculated from the current catalog before an order/payment is created.

## 6. Schema evolution

For any schema/index change:

1. Identify existing records affected by the new constraint.
2. Write a one-off migration or an idempotent operational script.
3. Backfill/normalize data before building a unique index.
4. Test against a copy of representative data.
5. Deploy migrations and application code in a compatible order.
6. Document rollback or repair steps.

The planned frontend does not introduce a collection migration. It will read existing categories, products, variants, stock, and authenticated cart data through the API.

## 7. Frontend boundary

The planned Vite/React frontend is a separate JavaScript application using the existing `/api/v1` contracts; it does not add or own MongoDB collections. Redux state and browser UI state are not authoritative records. Prices, roles, product visibility, and stock must continue to be validated by the backend. Adding Redux Toolkit, React Router, Toastify, Lucide React, or the centralized visual theme does not require a database schema change.
