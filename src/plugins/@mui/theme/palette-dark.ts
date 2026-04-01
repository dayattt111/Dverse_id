import { PaletteOptions, alpha } from '@mui/material'
import { grey } from '@mui/material/colors'

const paletteDark: PaletteOptions = {
  mode: 'dark',
  background: {
    default: '#020617',        // Deep navy (slate-950)
    paper: '#0f172a',          // Navy (slate-900) untuk cards
  },
  text: {
    primary: '#ffffff',        // Pure white untuk readability
    secondary: '#86efac',      // Soft green (green-300) untuk secondary
    disabled: grey[600],
  },
  divider: alpha('#4ade80', 0.1),  // Very subtle green divider
}

export default paletteDark
