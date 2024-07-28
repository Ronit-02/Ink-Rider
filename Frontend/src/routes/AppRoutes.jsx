import { Routes, Route } from "react-router-dom";

// Pages
// Authentication
import LoginPage from "../pages/authentication/LoginPage";
import SignupPage from "../pages/authentication/SignupPage";
import ForgotPasswordPage from "../pages/authentication/ForgotPasswordPage";
import ResetPasswordPage from "../pages/authentication/ResetPasswordPage";
import AuthSuccessPage from "../pages/authentication/AuthSuccessPage";
import AuthFailurePage from "../pages/authentication/AuthFailurePage"
// Post
import CreatePostPage from "../pages/post/CreatePostPage";
import DisplayPostPage from "../pages/post/DisplayPostPage";
import EditPostPage from "../pages/post/EditPostPage"
// Routes
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
// User
import AuthorPage from "../pages/user/AuthorPage";
import ProfilePage from "../pages/settings/ProfilePage";
import ChangePassPage from "../pages/settings/ChangePassPage"
import ProfileEditPage from "../pages/settings/ProfileEditPage";
import ProfilePostsPage from "../pages/settings/ProfilePostsPage";
// Core
import HomePage from "../pages/core/HomePage";
import SearchPage from "../pages/core/SearchPage";
// Additional
import MaintenancePage from "../pages/status/MaintenancePage";
import NotFoundPage from "../pages/status/NotFoundPage";
// import BackendCheck from "./BackendCheck";

// Layouts
import Layout from "./Layout";
import SettingsLayout from "./SettingsLayout"
import PricingFeaturesPage from "../pages/membership/PricingFeaturesPage";
import CheckoutPage from "../pages/membership/CheckoutPage";
import ExplorePage from "../pages/explore/ExplorePage";

const AppRoutes = () => {
  return (
    <Routes>
        <Route path="/maintenance" element={<MaintenancePage />} />
        {/* <Route path="/*" element={<BackendCheck>
            <Routes> */}
                <Route path="/login" element={<PublicRoute> <LoginPage /> </PublicRoute>}/>
                <Route path="/signup" element={<PublicRoute> <SignupPage /> </PublicRoute>} />
                <Route path="/auth/google/success" element={<PublicRoute> <AuthSuccessPage /> </PublicRoute>} />
                <Route path="/auth/google/failure" element={<AuthFailurePage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route element={<Layout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/post/:id" element={<DisplayPostPage />} />
                    <Route path="/post-edit/:id" element={<ProtectedRoute> <EditPostPage /> </ProtectedRoute>} />
                    <Route path="/user/:id" element={<AuthorPage />} />
                    <Route path="/explore" element={<ExplorePage />} />
                    <Route path="/search/*" element={<SearchPage />} />
                    {/* <Route path="/write" element={<ProtectedRoute> <CreatePostPage/> </ProtectedRoute>}/> */}
                    <Route path="/write" element={<CreatePostPage/>}/>
                    <Route path="/plans" element={<PricingFeaturesPage />} />
                    <Route path="/checkout/:type" element={<ProtectedRoute> <CheckoutPage /> </ProtectedRoute>}  />
                    <Route element={<ProtectedRoute> <SettingsLayout /> </ProtectedRoute>}>
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/profile-posts" element={<ProfilePostsPage />} />
                        <Route path="/profile-edit" element={<ProfileEditPage/>}/>
                        <Route path="/profile-changepass" element={<ChangePassPage />} />
                    </Route>
                </Route>
                <Route path="*" element={<NotFoundPage />} />
            {/* </Routes>
        </BackendCheck>}/> */}
    </Routes>
  )
}

export default AppRoutes;