import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'

import LoginPage      from '@/pages/Authentication/Login'
import HomePage       from '@/pages/Home'
import ExplorePage    from '@/pages/Explore'
import ExploreTrendingTab    from '@/pages/Explore/TrendingTab'
import ExploreQuestionsTab   from '@/pages/Explore/QuestionsTab'
import ExploreCompetitionsTab from '@/pages/Explore/CompetitionsTab'
import SearchPage     from '@/pages/Search'
import PostPage       from '@/pages/Post'
import ArtistPage     from '@/pages/Artist'
import OnboardingPage from '@/pages/Onboarding'
import WritePage      from '@/pages/Write'
import PublicRoute from './routes/PublicRoute'
import PrivateRoute from './routes/PrivateRoute'

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      {/* Onboarding and Login are full-screens (no navbar) */}
      <Route path="/login" element={<PublicRoute> <LoginPage /> </PublicRoute>} />
      <Route path="/signup" element={<PublicRoute> <LoginPage signUp={true} /> </PublicRoute>} />
      <Route path="/onboarding" element={<PublicRoute> <OnboardingPage /> </PublicRoute>} />

      {/* Private Routes */}
      {/* All other routes share the navbar layout */}
      {/* <Route element={<PrivateRoute> <AppLayout /> </PrivateRoute>}> */}
      <Route element={<AppLayout />}>
        <Route path="/"        element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />}>
          {/* Nested routes for Explore tabs */}
          <Route path="trending"     element={<ExploreTrendingTab />} />
          <Route path="questions"    element={<ExploreQuestionsTab />} />
          <Route path="competitions" element={<ExploreCompetitionsTab />} />
        </Route>
        <Route path="/search"  element={<SearchPage />} />
        <Route path="/post/:id" element={<PostPage />} />
        <Route path="/artist"  element={<ArtistPage />} />
        <Route path="/write"   element={<WritePage />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
