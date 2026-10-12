// ─── Unified Theme Object ─────────────────────────────────────────────────────
// Import this single object anywhere you need design tokens.

import colors from './colors'
import typography from './typography'
import spacing, { borderRadius, breakpoints } from './spacing'

const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  breakpoints,

  // Shadows
  shadows: {
    sm:  '0 1px 2px 0 rgb(0 0 0 / 0.3)',
    md:  '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
    lg:  '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
    xl:  '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)',
    glow: '0 0 20px rgb(124 58 237 / 0.35)',
    glowAccent: '0 0 20px rgb(6 182 212 / 0.35)',
  },

  // Transitions
  transitions: {
    fast:   'all 0.15s ease',
    base:   'all 0.2s ease',
    slow:   'all 0.3s ease',
    spring: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // Z-index scale
  zIndex: {
    base:    0,
    raised:  10,
    dropdown: 100,
    sticky:  200,
    overlay: 300,
    modal:   400,
    toast:   500,
  },
}

export default theme
