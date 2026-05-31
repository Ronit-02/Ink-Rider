import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout         from '@/shared/components/layout/AppLayout'
import LoginPage         from '@/features/auth/pages/Login'
import HomePage          from '@/features/discovery/pages/Home'
import ExplorePage       from '@/features/discovery/pages/Explore'
import TrendingTab       from '@/features/discovery/pages/Explore/TrendingTab'
import QuestionsTab      from '@/features/discovery/pages/Explore/QuestionsTab'
import CompetitionsTab   from '@/features/discovery/pages/Explore/CompetitionsTab'
import CompetitionDetail from '@/features/discovery/pages/Explore/CompetitionDetail'
import SearchPage        from '@/features/discovery/pages/Search'
import PostPage          from '@/features/post/pages'
import AuthorPage        from '@/features/user/pages/Author'
import OnboardingPage    from '@/features/onboarding/pages'
import WritePage         from '@/features/editor/pages'
import CollectionsPage   from '@/features/collection/pages'
import CollectionDetail  from '@/features/collection/pages'
import ProfilePage       from '@/features/user/pages/Profile'
import PublicRoute       from '@/app/routes/PublicRoute'
import PrivateRoute      from '@/app/routes/PrivateRoute'

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
        <Route path="/collections"     element={<CollectionsPage />} />
        <Route path="/collections/:id" element={<CollectionDetail />} />

        {/* ── Private routes ── */}
        <Route path="/write"           element={<PrivateRoute><WritePage /></PrivateRoute>} />
        <Route path="/profile"         element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

        {/* Redirects */}
        <Route path="*"        element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
