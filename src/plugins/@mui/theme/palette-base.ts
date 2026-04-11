import { PaletteOptions } from '@mui/material'

// D-Verse GreenTech Color Scheme
// Primary: Fresh Green (#2e7d32) - Nature/GreenTech accent
// Secondary: Navy Blue (#0f172a) - Deep Ocean / Professional base
const paletteBase: Partial<PaletteOptions> = {
  primary: {
    light: '#66bb6a',      // Fresh green (green-400)
    main: '#2e7d32',       // Leaf green (green-800)
    dark: '#1b5e20',       // Deep forest green (green-900)
    contrastText: '#ffffff',
  },
  secondary: {
    light: '#334155',      // Slate-700
    main: '#0f172a',       // Navy / Slate-900
    dark: '#020617',       // Deep navy / Slate-950
    contrastText: '#ffffff',
  },
  success: {
    main: '#16a34a',       // Green for success states
    contrastText: '#ffffff',
  },
  info: {
    main: '#0288d1',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#ed6c02',
    contrastText: '#ffffff',
  },
}

export default paletteBase
