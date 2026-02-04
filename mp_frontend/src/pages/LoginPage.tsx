// LoginPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { useCart } from "@/contexts/CartContext";

// Configure axios globally
axios.defaults.withCredentials = true;

const LoginPage = () => {
  const [email, setEmail] = useState(""); // Changed from username to email
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { refreshCart } = useCart();

  // --------------------- Normal Login ---------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Send both email and username (as email) to satisfy backend
      const res = await axios.post(
        "http://localhost:8000/api/auth/login/",
        {
          email: email,
          password: password
        }
      );

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      // Refresh cart data immediately after login
      await refreshCart();

      // Save user info if available
      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      navigate("/");
    } catch (err: any) {
      console.error("Login Error:", err.response?.data);
      const errorMsg = err.response?.data?.non_field_errors?.[0]
        || err.response?.data?.detail
        || "Invalid email or password";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // --------------------- Google Login ---------------------
  const handleGoogleLogin = async (response: any) => {
    setLoading(true);
    setError(null);

    console.log("🔍 Google Response:", response);
    console.log("🔍 Credential:", response.credential);

    try {
      const payload = {
        access_token: response.credential,
      };

      console.log("📤 Sending to backend:", payload);

      const res = await axios.post(
        "http://localhost:8000/auth/google/",
        payload
      );

      console.log("✅ Login successful:", res.data);

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      // Refresh cart data immediately after login
      await refreshCart();

      navigate("/");
    } catch (err: any) {
      console.error("❌ Google login error:", err.response?.data);

      const errorMsg = err.response?.data?.non_field_errors?.[0]
        || err.response?.data?.detail
        || err.response?.data?.error
        || "Google login failed";

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
          Login
        </h2>

        {error && <div className="mb-4 text-red-500">{error}</div>}

        <form onSubmit={handleLogin} className="mb-4">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-2 px-3 py-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 px-3 py-2 border rounded"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded hover:bg-primary/90 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="flex items-center justify-center mb-4">
          <span className="text-gray-400 dark:text-gray-300">OR</span>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => setError("Google login failed")}
          />
        </div>

        <div className="mt-4 text-center text-gray-700 dark:text-gray-300">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-primary underline"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;