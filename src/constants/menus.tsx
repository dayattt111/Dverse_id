// components
import Box from '@mui/material/Box'

// icons
import HomeOutlinedIcon from '@/assets/icons/fluent--home-32-regular.svg'
import InfoOutlinedIcon from '@/assets/icons/jam--info.svg'
import LayersOutlinedIcon from '@/assets/icons/fluent--layer-24-regular.svg'
import ContactOutlinedIcon from '@/assets/icons/fluent--contact-card-group-28-regular.svg'
import PaperOutlinedIcon from '@/assets/icons/quill--paper.svg'
import EmailOutlinedIcon from '@/assets/icons/eva--email-outline.svg'
import ConversationOutlinedIcon from '@/assets/icons/ci--chat-conversation.svg'
import ContactSupportOutlinedIcon from '@/assets/icons/material-symbols--contact-support-outline-rounded.svg'

export const companyMenus: IMenu[] = [
  {
    label: 'Home',
    path: '/',
    icon: (
      <Box component={HomeOutlinedIcon} sx={{ width: 18, height: 'auto' }} />
    ),
  },
  {
    label: 'About',
    path: '#home-about',
    icon: (
      <Box component={InfoOutlinedIcon} sx={{ width: 18, height: 'auto' }} />
    ),
  },
  {
    label: 'Timeline',
    path: '#home-timeline',
    icon: (
      <Box component={LayersOutlinedIcon} sx={{ width: 20, height: 'auto' }} />
    ),
  },
  {
    label: 'Daftar',
    path: '#home-registration',
    icon: (
      <Box component={PaperOutlinedIcon} sx={{ width: 18, height: 'auto' }} />
    ),
  },
  {
    label: 'FAQ',
    path: '#home-faq',
    icon: (
      <Box component={ConversationOutlinedIcon} sx={{ width: 18, height: 'auto' }} />
    ),
  },
  {
    label: 'Contact',
    path: '#home-contact',
    icon: (
      <Box component={ContactOutlinedIcon} sx={{ width: 18, height: 'auto' }} />
    ),
  },
]

export const supportLinks: IMenu[] = [
  {
    label: 'FAQ',
    path: '#home-faq',
    icon: (
      <Box
        component={ContactSupportOutlinedIcon}
        sx={{ width: 22, height: 'auto' }}
      />
    ),
  },
  {
    label: 'Hubungi Kami',
    path: '#home-contact',
    icon: (
      <Box component={EmailOutlinedIcon} sx={{ width: 18, height: 'auto' }} />
    ),
  },
]
