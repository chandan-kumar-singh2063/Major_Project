import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '@/api/services';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const LoginPage = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.login(form);
      localStorage.setItem('access', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);
      navigate('/', { replace: true }); // redirect to home
    } catch {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async tokenResponse => {
      try {
        const res = await axios.post('http://127.0.0.1:8000/auth/google/', {
          access_token: tokenResponse.access_token,
        });
        if (res.data.access) {
          localStorage.setItem('access', res.data.access);
          localStorage.setItem('refresh', res.data.refresh);
        } else if (res.data.key) {
          localStorage.setItem('access', res.data.key);
        }
        window.location.href = '/'; // redirect to home
      } catch (err) {
        alert('Google login failed');
      }
    },
    onError: () => alert('Google login failed'),
    flow: 'implicit',
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        {error && <div className="mb-2 text-red-500 text-center">{error}</div>}
        <form onSubmit={handleLogin}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full mb-3 px-3 py-2 border rounded"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full mb-6 px-3 py-2 border rounded"
            required
          />
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded font-semibold hover:bg-primary/90 transition mb-3"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="text-center mt-2">
          <button
            onClick={() => googleLogin()}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded py-2 px-4 bg-white hover:bg-gray-100 transition"
          >
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="w-5 h-5" />
            Sign in with Google
          </button>
        </div>
        <div className="text-center mt-2">
          <Link to="/reset-password" className="text-primary underline">Forgot Password?</Link>
        </div>
        <div className="text-center mt-2">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary underline">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
