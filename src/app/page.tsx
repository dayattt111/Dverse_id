import { JSX } from 'react'
import dynamic from 'next/dynamic'

// components
import Stack from '@mui/material/Stack'
import PageLoader from '@/components/section-loader'

const HomeHero = dynamic(() => import('./_components/home-hero'), {
  loading: () => <PageLoader />,
})
const HomeAbout = dynamic(() => import('./_components/home-about'), {
  loading: () => <PageLoader />,
})
const HomePastEvents = dynamic(() => import('./_components/home-past-events'), {
  loading: () => <PageLoader />,
})
const HomeProblemStatement = dynamic(() => import('./_components/home-problem-statement'), {
  loading: () => <PageLoader />,
})
const HomeTimeline = dynamic(() => import('./_components/home-timeline'), {
  loading: () => <PageLoader />,
})
const HomeRegistration = dynamic(() => import('./_components/home-registration'), {
  loading: () => <PageLoader />,
})
const HomeBenefits = dynamic(() => import('./_components/home-benefits'), {
  loading: () => <PageLoader />,
})
const HomeFAQ = dynamic(() => import('./_components/home-faq'), {
  loading: () => <PageLoader />,
})
const HomeContactSection = dynamic(() => import('./_components/home-contact-section'), {
  loading: () => <PageLoader />,
})
const HomeCTA = dynamic(() => import('./_components/home-cta'), {
  loading: () => <PageLoader />,
})

const HomePage = (): JSX.Element => {
  return (
    <Stack component='main' direction='column'>
      <HomeHero />
      <HomeAbout />
      <HomePastEvents />
      <HomeBenefits />
      <HomeProblemStatement />
      <HomeTimeline />
      <HomeRegistration />
      <HomeFAQ />
      <HomeContactSection />
      <HomeCTA />
    </Stack>
  )
}

export default HomePage
