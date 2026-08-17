/**
 * Single source of truth for the design system, ported 1:1 from
 * design/design.md's canonical palette + type scale (post-audit —
 * every mockup in design/*.html was normalized to these exact values).
 *
 * tailwind.config.js re-exports these as NativeWind classes; anything
 * that can't use a className (react-native-maps, StatusBar, Slider,
 * SVG props) should import this file directly instead of hardcoding hex.
 */
module.exports = {
  colors: {
    primary: '#006b55',
    'on-primary': '#ffffff',
    'primary-container': '#3ecfaa',
    'on-primary-container': '#005442',
    secondary: '#ae2f34',
    'on-secondary': '#ffffff',
    'secondary-container': '#ff6b6b',
    'on-secondary-container': '#6d0010',
    tertiary: '#765b00',
    'on-tertiary': '#ffffff',
    'tertiary-container': '#e0b331',
    'on-tertiary-container': '#5c4600',
    error: '#ba1a1a',
    'on-error': '#ffffff',
    'error-container': '#ffdad6',
    'on-error-container': '#93000a',
    background: '#fcf9f8',
    'on-background': '#1c1b1b',
    surface: '#fcf9f8',
    'on-surface': '#1c1b1b',
    'on-surface-variant': '#3c4a44',
    outline: '#6c7a74',
    'outline-variant': '#bbcac3',
    'surface-container-lowest': '#ffffff',
    'surface-container-low': '#f6f3f2',
    'surface-container': '#f0eded',
    'surface-container-high': '#eae7e7',
    'surface-container-highest': '#e5e2e1',
    'inverse-surface': '#313030',
    'inverse-on-surface': '#f3f0ef',
    'inverse-primary': '#50ddb7',
    // The one canonical "ink" for every hard-border/hard-shadow component.
    // design.md flagged #1A1A1A / rgba(28,27,27,1) drift as a bug in the
    // original mockups — this is the only near-black value in the app.
    ink: '#1c1b1b',
  },
  radius: {
    DEFAULT: 4,
    lg: 8,
    xl: 12,
    full: 9999,
  },
  spacing: {
    xs: 4,
    base: 8,
    sm: 12,
    md: 24,
    lg: 40,
    xl: 64,
  },
  // The flat, non-blurred "brutalist" offset used by every card/button
  // border — see src/components/Chibi.js for the component that renders it.
  hardShadowOffset: 4,
};
