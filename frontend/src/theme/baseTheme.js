const fontStack = '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'

const baseTypography = {
  fontFamily: fontStack,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 600,
  h1: { fontSize: '3rem', fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.1 },
  h2: { fontSize: '2.25rem', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15 },
  h3: { fontSize: '1.875rem', fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.2 },
  h4: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.25 },
  h5: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.3 },
  h6: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.35 },
  subtitle1: { fontSize: '1rem', fontWeight: 500, letterSpacing: '0.01em' },
  subtitle2: { fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.01em' },
  body1: { fontSize: '1rem', lineHeight: 1.6 },
  body2: { fontSize: '0.875rem', lineHeight: 1.6 },
  button: { fontWeight: 600, textTransform: 'none' }
}

const baseTheme = {
  shape: { borderRadius: 8 },
  spacing: 8,
  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 }
  },
  typography: baseTypography,
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true }
    },
    MuiPaper: {
      defaultProps: { elevation: 0 }
    }
  }
}

export { baseTypography }
export default baseTheme
