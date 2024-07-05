import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import AuthSuccessPage from "../pages/AuthSuccessPage";
import HomePage from "../pages/HomePage";
import CreatePostPage from "../pages/CreatePostPage";
import ProfilePage from "../pages/ProfilePage";
import DisplayPostPage from "../pages/DisplayPostPage";
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

const AppRoutes = () => {
  return (
    <Routes>
        <Route 
            path="/login" 
            element={<PublicRoute> <LoginPage /> </PublicRoute>}
        />
        <Route 
            path="/auth/google/success" 
            element={<PublicRoute> <AuthSuccessPage /> </PublicRoute>} 
        />

        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/post/:id" element={<DisplayPostPage />} />
        <Route path="/" element={<HomePage />} />

        <Route 
            path="/write"
            element={<ProtectedRoute> <CreatePostPage/> </ProtectedRoute>}
        />
        <Route 
            path="/profile"
            element={<ProtectedRoute> <ProfilePage/> </ProtectedRoute>}
        />
    </Routes>
  )
}

export default AppRoutes;