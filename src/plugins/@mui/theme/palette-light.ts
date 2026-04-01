import { alpha, PaletteOptions } from '@mui/material'
import { grey } from '@mui/material/colors'

const palette: PaletteOptions = {
  mode: 'light',
  background: {
    default: '#f0fdf4',        // Very soft green-white (green-50)
    paper: '#ffffff',          // Pure white for cards/contrast
  },
  text: {
    primary: '#0f172a',        // Navy (slate-900) untuk text utama
    secondary: '#1e3a2f',      // Dark green-gray untuk secondary text
    disabled: grey[400],
  },
  divider: alpha('#2e7d32', 0.08),  // Very subtle green divider
}

export default palette
