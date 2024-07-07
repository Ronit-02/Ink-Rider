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
import EditorPage from "../pages/EditorPage";
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import BackendCheck from "./BackendCheck";
import MaintenancePage from "../pages/MaintenancePage";

const AppRoutes = () => {
  return (
    <Routes>
        {/* Maintenance Page Route */}
        <Route path="/maintenance" element={<MaintenancePage />} />
            
        {/* Other Routes */}
        <Route path="/*" element={
            <BackendCheck>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route 
                    path="/login" 
                    element={<PublicRoute> <LoginPage /> </PublicRoute>}
                />
                <Route 
                    path="/signup" 
                    element={<PublicRoute> <SignupPage /> </PublicRoute>} 
                />
                <Route 
                    path="/auth/google/success" 
                    element={<PublicRoute> <AuthSuccessPage /> </PublicRoute>} 
                />
                
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/post/:id" element={<DisplayPostPage />} />

                <Route 
                    path="/write"
                    element={<ProtectedRoute> <CreatePostPage/> </ProtectedRoute>}
                />
                <Route path='/editor' element={<EditorPage />} />
                <Route 
                    path="/profile"
                    element={<ProtectedRoute> <ProfilePage/> </ProtectedRoute>}
                />
            </Routes>
            </BackendCheck>
        }/>
    </Routes>
  )
}

export default AppRoutes;