// App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { ChatBotProvider } from "./contexts/ChatBotContext";
import ChatBot from "./components/ChatBot";
import Home from "./pages/Home";
import Dashboard from "./components/Dashboard";
import StartTest from "./pages/StartTest";
import PracticeTest from "./pages/PracticeTest";
import Donate from "./pages/Donate";
import AboutUs from "./pages/AboutUs";
import AboutPage from "./pages/AboutPage";
import HelpPage from "./pages/HelpPage";
import ContactUs from "./pages/ContactUs";
import TipsPage from "./pages/TipsPage";
import Electronics from "./pages/Electronics";
import Fashion from "./pages/Fashion";
import Books from "./pages/Books";
import HomeDecor from "./pages/HomeDecor";
import Gadgets from "./pages/Gadgets";
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordRequestPage from './pages/ResetPasswordRequestPage';
import ResetPasswordConfirmPage from './pages/ResetPasswordConfirmPage';
import OrdersPage from "./pages/OrdersPage";
import WishlistPage from "./pages/WishlistPage";
import SearchResults from "./components/SearchResults";
import SellerDashboard from "./pages/SellerDashboard";

import ProductDetailPage from "./components/ProductDetailPage";
import PaymentSuccess from "./components/payment-success";
import { useState, useEffect } from "react";
import AuthModal from "./components/AuthModal";

// -------------------- ProtectedRoute --------------------
interface ProtectedRouteProps {
  children: React.ReactNode;
}
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check localStorage for JWT token
    const accessToken = localStorage.getItem("access");
    setToken(accessToken);
    setLoading(false);
  }, []);

  if (loading) return <div className="text-center mt-20 text-xl">Loading...</div>;
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// -------------------- Main App --------------------
function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <CartProvider>
      <ChatBotProvider>
        <Router>
          <Routes>
            {/* Protected Pages */}
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/start-test" element={<ProtectedRoute><StartTest /></ProtectedRoute>} />
            <Route path="/practice-test" element={<ProtectedRoute><PracticeTest /></ProtectedRoute>} />
            <Route path="/tips" element={<ProtectedRoute><TipsPage /></ProtectedRoute>} />
            <Route path="/donate" element={<ProtectedRoute><Donate /></ProtectedRoute>} />
            <Route path="/contactus" element={<ProtectedRoute><ContactUs /></ProtectedRoute>} />
            <Route path="/aboutus" element={<ProtectedRoute><AboutUs /></ProtectedRoute>} />
            <Route path="/aboutpage" element={<ProtectedRoute><AboutPage /></ProtectedRoute>} />
            <Route path="/helppage" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/category/electronics" element={<ProtectedRoute><Electronics /></ProtectedRoute>} />
            <Route path="/category/fashion" element={<ProtectedRoute><Fashion /></ProtectedRoute>} />
            <Route path="/category/books" element={<ProtectedRoute><Books /></ProtectedRoute>} />
            <Route path="/category/gadgets" element={<ProtectedRoute><Gadgets /></ProtectedRoute>} />
            <Route path="/category/home_decor" element={<ProtectedRoute><HomeDecor /></ProtectedRoute>} />

            {/* Auth Pages */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset-password" element={<ResetPasswordRequestPage />} />
            <Route path="/reset-password/:uidb64/:token" element={<ResetPasswordConfirmPage />} />

            {/* Product & Payment */}
            <Route path="/product/:id" element={<ProtectedRoute><ProductDetailPage /></ProtectedRoute>} />
            <Route path="/search-results" element={<ProtectedRoute><SearchResults /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
            <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
            <Route path="/seller-dashboard" element={<ProtectedRoute><SellerDashboard /></ProtectedRoute>} />


            {/* 404 */}
            <Route path="*" element={<div className="text-center mt-20 text-2xl font-semibold">404 Not Found</div>} />
          </Routes>

          {/* Global Components */}
          <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
          <ChatBot />
        </Router>
      </ChatBotProvider>
    </CartProvider>
  );
}

export default App;
export { ProtectedRoute };
