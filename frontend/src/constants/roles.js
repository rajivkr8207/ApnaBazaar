// ─── Application Roles ────────────────────────────────────────────────────────
// Used for route protection and conditional UI rendering.

export const ROLES = {
  ADMIN:   'admin',
  SELLER:  'seller',
  BUYER:   'buyer',
  GUEST:   'guest',
}

// Ordered by privilege level (highest → lowest)
export const ROLE_HIERARCHY = [
  ROLES.ADMIN,
  ROLES.SELLER,
  ROLES.BUYER,
  ROLES.GUEST,
]

// Human-readable labels
export const ROLE_LABELS = {
  [ROLES.ADMIN]:  'Administrator',
  [ROLES.SELLER]: 'Seller',
  [ROLES.BUYER]:  'Buyer',
  [ROLES.GUEST]:  'Guest',
}

export default ROLES
