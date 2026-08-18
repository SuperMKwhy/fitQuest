const tokens = require('./src/theme/tokens');

module.exports = {
  content: ['./App.js', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: tokens.colors,
      borderRadius: tokens.radius,
      spacing: {
        xs: `${tokens.spacing.xs}px`,
        base: `${tokens.spacing.base}px`,
        sm: `${tokens.spacing.sm}px`,
        md: `${tokens.spacing.md}px`,
        lg: `${tokens.spacing.lg}px`,
        xl: `${tokens.spacing.xl}px`,
      },
      fontFamily: {
        headline: ['SpaceGrotesk-Bold'],
        'headline-medium': ['SpaceGrotesk-Medium'],
        body: ['HankenGrotesk-Regular'],
        'body-medium': ['HankenGrotesk-Medium'],
        label: ['JetBrainsMono-Bold'],
        pixel: ['PressStart2P'],
      },
    },
  },
  plugins: [],
};
