import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import Navbar from "./components/layout/Navbar";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import ChatPopup from "./components/chat/ChatPopup";
import { useAuth } from "./context/AuthContext";

// Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import GigBoardPage from "./pages/GigBoardPage";
import GigDetailPage from "./pages/GigDetailPage";
import FlatmatePage from "./pages/FlatmatePage";
import FlatmateDetailPage from "./pages/FlatmateDetailPage";
import MarketplacePage from "./pages/MarketplacePage";
import MarketplaceDetailPage from "./pages/MarketplaceDetailPage";
import LostFoundPage from "./pages/LostFoundPage";
import LostFoundDetailPage from "./pages/LostFoundDetailPage";
import RidesPage from "./pages/RidesPage";
import RideDetailPage from "./pages/RideDetailPage";
import ProfilePage from "./pages/ProfilePage";

function AppShell() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Navbar />
      <Outlet />
      {isAuthenticated && <ChatPopup />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <BrowserRouter>
          <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Main App Routes */}
          <Route element={<AppShell />}>
            <Route path="/" element={<Navigate to="/gigs" replace />} />
            <Route path="/gigs" element={<GigBoardPage />} />
            
            <Route path="/flatmates" element={<FlatmatePage />} />
            
            <Route path="/marketplace" element={<MarketplacePage />} />
            
            <Route path="/lost-found" element={<LostFoundPage />} />
            
            <Route path="/rides" element={<RidesPage />} />

            {/* Feature details and account routes require sign in */}
            <Route element={<ProtectedRoute />}>
              <Route path="/gigs/:id" element={<GigDetailPage />} />
              <Route path="/flatmates/:id" element={<FlatmateDetailPage />} />
              <Route path="/marketplace/:id" element={<MarketplaceDetailPage />} />
              <Route path="/lost-found/:id" element={<LostFoundDetailPage />} />
              <Route path="/rides/:id" element={<RideDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>
          </Routes>
        </BrowserRouter>
      </ChatProvider>
    </AuthProvider>
  );
}
