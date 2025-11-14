import { createTheme, alpha } from '@mui/material/styles'
import baseTheme, { baseTypography } from './baseTheme.js'

const primaryColor = '#6366F1'
const secondaryColor = '#A1A1AA'
const dividerColor = '#E5E7EB'
const textColor = '#1F2937'
const backgroundColor = '#F9FAFB'

const palette = {
  primary: { main: primaryColor, contrastText: '#FFFFFF' },
  secondary: { main: secondaryColor, contrastText: '#111827' },
  error: { main: '#EF4444' },
  warning: { main: '#F97316' },
  info: { main: '#3B82F6' },
  success: { main: '#10B981' },
  background: { default: backgroundColor, paper: '#FFFFFF' },
  text: { primary: textColor, secondary: '#4B5563' },
  divider: dividerColor
}

const shadows = [
  'none',
  '0px 1px 2px rgba(15, 23, 42, 0.08)',
  '0px 1px 3px rgba(15, 23, 42, 0.12)',
  '0px 4px 8px rgba(15, 23, 42, 0.08)',
  '0px 4px 12px rgba(15, 23, 42, 0.08)',
  '0px 8px 16px rgba(15, 23, 42, 0.08)',
  '0px 12px 20px rgba(15, 23, 42, 0.08)',
  '0px 16px 24px rgba(15, 23, 42, 0.08)',
  '0px 20px 28px rgba(15, 23, 42, 0.08)',
  '0px 24px 32px rgba(15, 23, 42, 0.08)',
  '0px 28px 36px rgba(15, 23, 42, 0.08)',
  ...Array(15).fill('0px 0px 0px rgba(0,0,0,0)')
]

const cardShadow = '0px 12px 24px rgba(15, 23, 42, 0.06)'
const focusRing = `0 0 0 3px ${alpha(primaryColor, 0.2)}`

const components = {
  MuiCssBaseline: {
    styleOverrides: {
      '*, *::before, *::after': { boxSizing: 'border-box' },
      body: {
        margin: 0,
        backgroundColor: backgroundColor,
        color: textColor,
        fontFamily: baseTypography.fontFamily,
        fontFeatureSettings: '"cv02","cv03","cv04"',
        WebkitFontSmoothing: 'antialiased'
      },
      '#root': { minHeight: '100vh' },
      a: { color: primaryColor }
    }
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: baseTheme.shape.borderRadius,
        fontWeight: 600,
        padding: '0.5rem 1.5rem',
        textTransform: 'none'
      },
      containedPrimary: {
        backgroundColor: primaryColor,
        boxShadow: '0px 8px 20px rgba(99, 102, 241, 0.35)',
        '&:hover': { backgroundColor: '#4F46E5', boxShadow: '0px 12px 24px rgba(99, 102, 241, 0.35)' }
      },
      outlined: {
        borderColor: dividerColor,
        color: textColor,
        '&:hover': { borderColor: '#CBD5F5', backgroundColor: alpha(primaryColor, 0.04) }
      }
    }
  },
  MuiTextField: {
    defaultProps: { size: 'medium', variant: 'outlined' }
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: baseTheme.shape.borderRadius,
        backgroundColor: '#FFFFFF',
        '& .MuiOutlinedInput-notchedOutline': { borderColor: dividerColor },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#C7D2FE' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: primaryColor,
          boxShadow: focusRing
        }
      },
      input: { padding: '14px 16px' }
    }
  },
  MuiInputLabel: {
    styleOverrides: {
      root: { fontWeight: 500, letterSpacing: '0.01em' }
    }
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: baseTheme.shape.borderRadius * 1.25,
        border: `1px solid ${dividerColor}`,
        boxShadow: cardShadow,
        backgroundColor: '#FFFFFF'
      }
    }
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: baseTheme.shape.borderRadius,
        border: `1px solid ${dividerColor}`,
        backgroundColor: '#FFFFFF'
      }
    }
  },
  MuiTable: {
    styleOverrides: {
      root: {
        borderSpacing: '0',
        borderCollapse: 'separate'
      }
    }
  },
  MuiTableHead: {
    styleOverrides: {
      root: {
        '& .MuiTableCell-root': {
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          letterSpacing: '0.08em',
          color: '#6B7280',
          borderBottom: `1px solid ${dividerColor}`
        }
      }
    }
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: `1px solid ${dividerColor}`,
        padding: '12px 16px'
      },
      head: {
        fontWeight: 600
      }
    }
  },
  MuiTabs: {
    styleOverrides: {
      indicator: {
        height: 3,
        borderRadius: 3,
        backgroundColor: primaryColor
      }
    }
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: baseTheme.shape.borderRadius,
        fontWeight: 500
      }
    }
  }
}

const modernTheme = createTheme({
  ...baseTheme,
  palette,
  shadows,
  typography: {
    ...baseTypography,
    h1: { ...baseTypography.h1, fontSize: '2.75rem' },
    h2: { ...baseTypography.h2, fontSize: '2rem' },
    h3: { ...baseTypography.h3, fontSize: '1.75rem' },
    body1: { ...baseTypography.body1, color: textColor },
    body2: { ...baseTypography.body2, color: '#4B5563' }
  },
  components: {
    ...baseTheme.components,
    ...components
  }
})

export default modernTheme
