import type { Metadata } from 'next'
import { AppConfig } from '@/configs'
import LeaderboardPageContent from './_components/leaderboard-page-content'

export const metadata: Metadata = {
  title: 'Leaderboard - Top Contributors',
  description: 'Daftar kontributor terbaik komunitas DCN UNDIPA berdasarkan poin, level, dan pencapaian mereka.',
  keywords: ['leaderboard', 'contributors', 'ranking', 'top users', 'komunitas', 'DCN UNDIPA'],
  openGraph: {
    title: `Leaderboard - Top Contributors | ${AppConfig.appName}`,
    description: 'Daftar kontributor terbaik komunitas DCN UNDIPA berdasarkan poin, level, dan pencapaian mereka.',
    url: `${AppConfig.siteUrl}/leaderboard`,
    siteName: AppConfig.appName,
    locale: 'id_ID',
    type: 'website',
  },
}

export default function LeaderboardPage() {
  return <LeaderboardPageContent />
}
