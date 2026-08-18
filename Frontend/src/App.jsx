import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout         from '@/shared/components/layout/AppLayout'
import PublicRoute       from '@/app/routes/PublicRoute'
import PrivateRoute      from '@/app/routes/PrivateRoute'

const LoginPage = lazy(() => import('@/features/auth/pages/Login'))
const HomePage = lazy(() => import('@/features/discovery/pages/Home'))
const ExplorePage = lazy(() => import('@/features/discovery/pages/Explore'))
const TrendingTab = lazy(() => import('@/features/discovery/pages/Explore/TrendingTab'))
const QuestionsTab = lazy(() => import('@/features/discovery/pages/Explore/QuestionsTab'))
const QuestionDetail = lazy(() => import('@/features/discovery/pages/Explore/QuestionDetail'))
const OpportunitiesPage = lazy(() => import('@/features/question/pages/OpportunitiesPage'))
const CompetitionsTab = lazy(() => import('@/features/discovery/pages/Explore/CompetitionsTab'))
const CompetitionDetail = lazy(() => import('@/features/discovery/pages/Explore/CompetitionDetail'))
const SearchPage = lazy(() => import('@/features/discovery/pages/Search'))
const PostPage = lazy(() => import('@/features/post/pages'))
const AuthorPage = lazy(() => import('@/features/user/pages/Author'))
const OnboardingPage = lazy(() => import('@/features/onboarding/pages'))
const WritePage = lazy(() => import('@/features/editor/pages'))
const CollectionsPage = lazy(() => import('@/features/collection/pages'))
const SavedPage = lazy(() => import('@/features/collection/pages/SavedPage'))
const CollectionDetail = lazy(() => import('@/features/collection/pages/CollectionDetail'))
const ProfilePage = lazy(() => import('@/features/user/pages/Profile'))
const SettingsPage = lazy(() => import('@/features/user/pages/Settings'))
const ShortsPage = lazy(() => import('@/features/discovery/pages/Search/ShortsTab'))
const ShortSeriesDetail = lazy(() => import('@/features/discovery/pages/ShortSeriesDetail'))
const ReadingHistoryPage = lazy(() => import('@/features/discovery/pages/ReadingHistory'))
const MemberHub = lazy(() => import('@/features/membership/pages/MemberHub'))
const NotFound = lazy(() => import('@/app/pages/NotFound'))
const NotificationsPage = lazy(() => import('@/features/notification/pages/NotificationsPage'))
const StaffConsole = lazy(() => import('@/features/staff/pages/StaffConsole'))

const RouteLoader = () => <main role="status" className="min-h-[40vh] flex items-center justify-center bg-[var(--color-bg)] text-[13px] text-[var(--color-text-muted)]">Loading…</main>

export default function App() {
  return (
    <Suspense fallback={<RouteLoader />}><Routes>
      {/* ── Public full-screen routes ── */}
      <Route path="/login"      element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup"     element={<PublicRoute><LoginPage signUp={true} /></PublicRoute>} />
      <Route path="/onboarding" element={<PrivateRoute><OnboardingPage /></PrivateRoute>} />

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
        <Route path="/explore/questions/:id" element={<QuestionDetail />} />
        <Route path="/opportunities" element={<PrivateRoute><OpportunitiesPage /></PrivateRoute>} />

        <Route path="/search"          element={<SearchPage />} />
        <Route path="/post/:id"        element={<PostPage />} />
        <Route path="/author"          element={<AuthorPage />} />
        <Route path="/author/:handle"  element={<AuthorPage />} />
        <Route path="/collections"     element={<CollectionsPage />} />
        <Route path="/saved"            element={<PrivateRoute><SavedPage /></PrivateRoute>} />
        <Route path="/collections/:id" element={<CollectionDetail />} />
        <Route path="/shorts"           element={<ShortsPage />} />
        <Route path="/shorts/series/:id" element={<ShortSeriesDetail />} />
        <Route path="/history"          element={<PrivateRoute><ReadingHistoryPage /></PrivateRoute>} />
        <Route path="/members"          element={<PrivateRoute><MemberHub /></PrivateRoute>} />
        <Route path="/notifications"    element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
        <Route path="/staff"            element={<PrivateRoute><StaffConsole /></PrivateRoute>} />

        {/* ── Private routes ── */}
        <Route path="/write"           element={<PrivateRoute><WritePage /></PrivateRoute>} />
        <Route path="/profile"         element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/settings"        element={<PrivateRoute><SettingsPage /></PrivateRoute>} />

        {/* Redirects */}
        <Route path="*"        element={<NotFound />} />
      </Route>
    </Routes></Suspense>
  )
}
