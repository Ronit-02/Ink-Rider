import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import AuthSuccessPage from "../pages/AuthSuccessPage";
import AuthFailurePage from "../pages/AuthFailurePage"
import HomePage from "../pages/HomePage";
import CreatePostPage from "../pages/CreatePostPage";
import ProfilePage from "../pages/ProfilePage";
import DisplayPostPage from "../pages/DisplayPostPage";
import EditorPage from "../pages/EditorPage";
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import BackendCheck from "./BackendCheck";
import MaintenancePage from "../pages/MaintenancePage";
import EditPostPage from "../pages/EditPostPage"
import AuthorPage from "../pages/AuthorPage";
import SearchPage from "../pages/SearchPage";
import Layout from "./Layout";
import NotFoundPage from "../pages/NotFoundPage";

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
                    <Route path='/editor' element={<ProtectedRoute> <EditorPage /> </ProtectedRoute>} />
                    <Route path="/write" element={<ProtectedRoute> <CreatePostPage/> </ProtectedRoute>}/>
                    <Route path="/profile" element={<ProtectedRoute> <ProfilePage/> </ProtectedRoute>}/>
                </Route>
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BackendCheck>}/>
    </Routes>
  )
}

export default AppRoutes;