/* App — route definitions */
import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'

import LoginPage         from '@/pages/Authentication/Login'
import HomePage          from '@/pages/Home'
import ExplorePage       from '@/pages/Explore'
import TrendingTab       from '@/pages/Explore/TrendingTab'
import QuestionsTab      from '@/pages/Explore/QuestionsTab'
import CompetitionsTab   from '@/pages/Explore/CompetitionsTab'
import CompetitionDetail from '@/pages/Explore/CompetitionDetail'
import SearchPage        from '@/pages/Search'
import PostPage          from '@/pages/Post'
import AuthorPage        from '@/pages/Author'
import OnboardingPage    from '@/pages/Onboarding'
import WritePage         from '@/pages/Write'
import CollectionsPage   from '@/pages/Collections'
import CollectionDetail  from '@/pages/Collections/CollectionDetail'
import ProfilePage       from '@/pages/Profile'
import PublicRoute       from './routes/PublicRoute'

export default function App() {
  return (
    <Routes>
      {/* ── Public full-screen routes ── */}
      <Route path="/login"      element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup"     element={<PublicRoute><LoginPage signUp={true} /></PublicRoute>} />
      <Route path="/onboarding" element={<PublicRoute><OnboardingPage /></PublicRoute>} />

      {/* ── App shell routes ── */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />

        {/* Explore — sub-tabs nested, index redirects to trending */}
        <Route path="/explore" element={<ExplorePage />}>
          <Route index element={<Navigate to="trending" replace />} />
          <Route path="trending"     element={<TrendingTab />} />
          <Route path="questions"    element={<QuestionsTab />} />
          <Route path="competitions" element={<CompetitionsTab />} />
        </Route>
        {/* Competition detail — standalone page within AppLayout */}
        <Route path="/explore/competitions/:id" element={<CompetitionDetail />} />

        <Route path="/search"          element={<SearchPage />} />
        <Route path="/post/:id"        element={<PostPage />} />
        <Route path="/author"          element={<AuthorPage />} />
        <Route path="/write"           element={<WritePage />} />
        <Route path="/collections"     element={<CollectionsPage />} />
        <Route path="/collections/:id" element={<CollectionDetail />} />
        <Route path="/profile"         element={<ProfilePage />} />

        {/* Redirects */}
        <Route path="/artist"  element={<Navigate to="/author" replace />} />
        <Route path="*"        element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
