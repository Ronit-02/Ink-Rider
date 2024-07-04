import { Routes, Route } from "react-router-dom"

import LoginPage from "./pages/LoginPage"
import AuthSuccessPage from "./pages/AuthSuccessPage"
import HomePage from "./pages/HomePage"
import WritePage from "./pages/WritePage"
import ProfilePage from "./pages/ProfilePage"
import SignupPage from "./pages/SignupPage"
import ForgotPasswordPage from "./pages/ForgotPasswordPage"
import ResetPasswordPage from "./pages/ResetPasswordPage"

function App() {

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/google/success" element={<AuthSuccessPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/write" element={<WritePage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  )
}

export default App