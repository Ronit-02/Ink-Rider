import { Routes, Route } from "react-router-dom";

// Pages
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import AuthSuccessPage from "../pages/AuthSuccessPage";
import AuthFailurePage from "../pages/AuthFailurePage"
import HomePage from "../pages/HomePage";
import CreatePostPage from "../pages/CreatePostPage";
import DisplayPostPage from "../pages/DisplayPostPage";
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import BackendCheck from "./BackendCheck";
import MaintenancePage from "../pages/MaintenancePage";
import EditPostPage from "../pages/EditPostPage"
import AuthorPage from "../pages/AuthorPage";
import SearchPage from "../pages/SearchPage";
import NotFoundPage from "../pages/NotFoundPage";
import ProfilePostsPage from "../pages/settings/ProfilePostsPage";
import ProfilePage from "../pages/settings/ProfilePage";
import ChangePassPage from "../pages/settings/ChangePassPage"
import ProfileEditPage from "../pages/settings/ProfileEditPage";

// Layouts
import Layout from "./Layout";
import SettingsLayout from "./SettingsLayout"

const AppRoutes = () => {
  return (
    <Routes>
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/*" element={<BackendCheck>
            <Routes>
                <Route path="/login" element={<PublicRoute> <LoginPage /> </PublicRoute>}/>
                <Route path="/signup" element={<PublicRoute> <SignupPage /> </PublicRoute>} />
                <Route path="/auth/google/success" element={<PublicRoute> <AuthSuccessPage /> </PublicRoute>} />
                <Route path="/auth/google/failure" element={<AuthFailurePage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route element={<Layout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/post/:id" element={<DisplayPostPage />} />
                    <Route path="/post-edit/:id" element={<EditPostPage />} />
                    <Route path="/user/:id" element={<AuthorPage />} />
                    <Route path="/search/*" element={<SearchPage />} />
                    <Route path="/write" element={<ProtectedRoute> <CreatePostPage/> </ProtectedRoute>}/>
                    <Route element={<ProtectedRoute> <SettingsLayout /> </ProtectedRoute>}>
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/profile-posts" element={<ProfilePostsPage />} />
                        <Route path="/profile-edit" element={<ProfileEditPage/>}/>
                        <Route path="/profile-changepass" element={<ChangePassPage />} />
                    </Route>
                </Route>
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BackendCheck>}/>
    </Routes>
  )
}

export default AppRoutes;