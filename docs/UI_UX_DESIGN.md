# UI/UX design — Sole Society storefront

This document specifies the required experience for the planned React storefront. It is a design and implementation contract, not evidence that frontend components currently exist. The repository currently has no frontend source files.

## 1. Experience principles

The storefront is the customer-facing front door to ApnaBazaar's current sneaker catalog. The experience should feel considered, tactile, and premium while keeping product discovery and purchase intent clear.

1. **Editorial, not cluttered:** give the hero and product photography room to breathe.
2. **Products first:** catalog cards use clean white surfaces and make price/options easy to scan.
3. **Dark atmosphere, bright focus:** use smoky charcoal and restrained glass in the header/hero, then transition into light catalog surfaces.
4. **Accent with intention:** lime green is reserved for primary calls to action, selection, and small confirmations.
5. **Truthful commerce:** show live server catalog data; do not invent inventory, delivery promises, reviews, or checkout success.
6. **Inclusive by default:** support keyboard navigation, clear labels, reduced motion, responsive layouts, and readable contrast.

## 2. Visual direction

The supplied reference is interpreted as premium smoky black glassmorphism with a subtle green ambient glow, clean white product cards, and selective lime-green accents.

### Centralized theme tokens

All palette, surface, text, border, shadow, and gradient values must be defined centrally in `frontend/src/theme/tokens.css` as CSS custom properties. Component styles must use those variables and must not introduce local color literals. Values below establish the initial design system and may be tuned centrally after visual validation.

| Token | Initial value | Usage |
| --- | --- | --- |
| `--color-smoky-black` | `#111310` | Main dark background and hero |
| `--color-smoky-black-soft` | `#171916` | Raised dark surfaces |
| `--surface-glass` | `rgb(255 255 255 / 8%)` | Dark glass surfaces |
| `--surface-glass-strong` | `rgb(255 255 255 / 14%)` | Focused glass panels |
| `--color-white` | `#ffffff` | Product cards and light surfaces |
| `--color-page` | `#f8f9f6` | Light catalog background |
| `--color-lime` | `#c4f458` | Primary actions and selected states |
| `--color-text-primary` | `#171916` | Primary text on light backgrounds |
| `--color-text-secondary` | `#787d77` | Secondary text on light backgrounds |
| `--color-text-on-dark` | `#f8f9f6` | Text on dark surfaces |
| `--color-text-on-dark-muted` | `#b8bdb5` | Secondary text on dark surfaces |
| `--color-border` | `#e7e9e3` | Light-surface dividers |
| `--color-border-glass` | `rgb(255 255 255 / 16%)` | Glass panel outline |
| `--shadow-card` | `0 16px 48px rgb(17 19 16 / 10%)` | Product/card elevation |
| `--shadow-glow` | `0 0 64px rgb(196 244 88 / 16%)` | Subtle lime ambient glow |
| `--gradient-hero` | `linear-gradient(135deg, #111310 0%, #1d2619 55%, #111310 100%)` | Hero backdrop |
| `--gradient-lime-glow` | `radial-gradient(ellipse, rgb(196 244 88 / 18%), transparent 70%)` | Restrained green glow |

The values above are initial tokens; centralize any future refinements in the same file. Glass belongs on selected dark surfaces only. Product cards remain crisp white and readable.

### Typography

- Display: Manrope, bold, tight tracking, for hero and section headings.
- Body/UI: DM Sans, for controls, descriptive copy, and labels.
- Maintain hierarchy through size and weight before introducing additional colors.
- The planned storefront may load these fonts from Google Fonts, with a system sans-serif fallback; include the required font host in the backend CSP when wiring the frontend.

### Imagery

- Prefer clear, well-lit product photography on neutral backgrounds for product cards.
- The hero may use a larger editorial sneaker image with a dark/green atmospheric treatment.
- Use `object-fit: cover`, descriptive alt text, and lazy loading for catalog images.
- Fall back gracefully when a product has no image or an image request fails.
- Remote image hosts must be explicitly covered by the app's Content Security Policy.

## 3. Page structure

1. **Announcement strip:** one short store message and a link to the collection. Only publish operational promises after they are supported.
2. **Sticky header:** brand, desktop navigation, search, account, bag count, and responsive menu.
3. **Hero:** brand statement, concise supporting text, collection CTA, sneaker image, ambient glow, and small glass callouts.
4. **Trust/value strip:** current brand/product discovery values without unverified shipping/authenticity claims.
5. **Category discovery:** category tiles read from active category data; selecting one filters catalog items.
6. **Product collection:** heading, server-backed sorting, category chips, results count, product grid, loading/empty/error states, and pagination.
7. **Brand/community panel:** brand story and collection CTA. Do not collect email until a subscription backend exists.
8. **Footer:** brand, year, and page navigation.
9. **Cart drawer:** authenticated user's cart, product/variant details, quantity controls, subtotal, and clear/remove actions.
10. **Sign-in modal:** when implemented, uses the existing local login endpoint and cookie session.

## 4. Components and states

### Product card

- Product image or neutral fallback.
- Category and brand/seller display name.
- Product title and price/currency.
- Variant dropdown when active variants exist.
- Add-to-bag action.
- Optional save/favorite state is currently browser-session-only and must not be represented as persisted account functionality.

### Catalog states

- Loading skeleton while the API is pending.
- Product grid on success.
- Empty state when there are no matching products.
- Error state when catalog requests fail, with actionable message and filter-reset option.
- Pagination control appears only when more result pages are available.

### Cart states

- Guest: prompt to sign in; do not create a guest cart unless a later product requirement adds one.
- Empty: invitation to continue browsing.
- Populated: line items, variant identifiers/options, quantity buttons, remove controls, and snapshot subtotal.
- API rejection: explain unavailable item/stock/quantity without implying the cart was updated.
- Until a complete order/payment flow exists, any checkout entry point must clearly report that checkout is unavailable rather than imply that an order completed.

## 5. Interaction behavior

- Search submits on Enter and can be opened from the compact search icon at narrow widths.
- Category chips and tiles apply filters and scroll to the product collection.
- Sort changes reload the catalog using server query parameters.
- “Load more” appends the next page.
- Variant selection updates the displayed price to the variant override when present.
- When implemented, adding an item must check server-side product, variant, and stock state. Guests are asked to sign in first; after login, a pending add may be resumed.
- Bag count reflects total cart quantity, not distinct line count.
- Quantity controls call the authenticated cart API; the server remains authoritative.
- Drawers and modals must be dismissible with their close controls or backdrop; Escape-key dismissal is a recommended accessibility behavior.

## 6. Responsive behavior

- Desktop: horizontal navigation, wide two-column hero, multi-column product grid.
- Tablet: tighter spacing and three-column product grid.
- Mobile: collapsible navigation, compact search trigger, stacked hero with overlaid product visual, two-column product grid, and full-height side drawer.
- Avoid horizontal scrolling at common phone widths.
- Keep touch targets comfortably tappable and controls away from screen edges.

## 7. Accessibility and motion

- Use semantic landmarks, heading order, explicit input labels, button names, and meaningful image alt text.
- Provide visible keyboard focus using `:focus-visible`.
- Use `aria-live` for changing catalog/status feedback and correct dialog roles/expanded state.
- Ensure color is not the only way to express state.
- Respect `prefers-reduced-motion`; animation must not be required to understand the page.
- Verify both contrast and focus visibility after any visual changes.

## 8. Content and commerce honesty

- Product/category names, prices, images, and active variant choices come from API data.
- The storefront currently has no confirmed shipping thresholds, return policy, product reviews, newsletter service, or completed checkout. Avoid copy that implies these services are operational.
- Never display a successful subscription or purchase based only on a front-end interaction.
- Price snapshots in a cart are display values, not a final checkout quote.

## 9. Required frontend stack and organization

- Build with Vite and React in JavaScript; do not introduce TypeScript.
- Use Redux Toolkit for shared global state, React Router for navigation, React Toastify for notifications, and Lucide React for icons.
- Organize source by feature, with separate `features/`, shared `components/`, route-level `pages/`, API `services/`, `hooks/`, Redux `store/` and slices, `routes/`, and `theme/` directories as appropriate.
- Keep the frontend package separate from the Express/MongoDB backend. The frontend communicates through the existing `/api/v1` API.
- Store all colors and visual theme tokens in `frontend/src/theme/tokens.css`; shared component styles must consume its variables.
- Ensure the Vite build output and backend static-serving path agree when frontend delivery is implemented.

None of these frontend files currently exist in the repository. Preserve the visual and interaction requirements above as the target; do not mark the storefront as implemented until the application is built and its integration verified.
