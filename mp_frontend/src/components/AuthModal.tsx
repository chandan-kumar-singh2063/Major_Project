import { useState, useEffect } from 'react';
import { authAPI } from '@/api/services';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [mode, setMode] = useState<'login' | 'register' | 'profile'>('login');
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'buyer' });
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && localStorage.getItem('access')) {
      authAPI.getProfile().then((res: any) => {
        setProfile(res.data);
        setMode('profile');
      });
    } else if (isOpen) {
      setMode('login');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (mode === 'profile') {
      setProfile({ ...profile, [e.target.name]: e.target.value });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.login({ username: form.username, password: form.password });
      localStorage.setItem('access', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);
      setSuccess('Login successful!');
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 1000);
    } catch (err: any) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authAPI.register(form);
      setSuccess('Registration successful! Please login.');
      setMode('login');
    } catch (err: any) {
      setError('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authAPI.updateProfile(profile);
      setSuccess('Profile updated!');
      setTimeout(() => setSuccess(null), 1500);
    } catch (err: any) {
      setError('Profile update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setProfile(null);
    setMode('login');
    onClose();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-gray-200 bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-sm relative">
        <button className="absolute top-2 right-2 text-xl" onClick={onClose}>&times;</button>
        {mode === 'profile' ? (
          <>
            <h2 className="text-2xl font-bold mb-4">Profile</h2>
            {error && <div className="mb-2 text-red-500">{error}</div>}
            {success && <div className="mb-2 text-green-600">{success}</div>}
            <form onSubmit={handleProfileUpdate}>
              <input
                type="text"
                name="username"
                value={profile?.username || ''}
                disabled
                className="w-full mb-2 px-3 py-2 border rounded bg-gray-100"
              />
              <input
                type="email"
                name="email"
                value={profile?.email || ''}
                onChange={handleChange}
                className="w-full mb-2 px-3 py-2 border rounded"
                required
              />
              <input
                type="text"
                name="first_name"
                placeholder="First Name"
                value={profile?.first_name || ''}
                onChange={handleChange}
                className="w-full mb-2 px-3 py-2 border rounded"
              />
              <input
                type="text"
                name="last_name"
                placeholder="Last Name"
                value={profile?.last_name || ''}
                onChange={handleChange}
                className="w-full mb-2 px-3 py-2 border rounded"
              />
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase px-1">Role</label>
                <div className="px-3 py-2 border rounded bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 capitalize">
                  {profile?.role || 'buyer'}
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 rounded font-semibold hover:bg-primary/90 transition"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </form>
            <button className="w-full mt-4 bg-red-500 text-white py-2 rounded font-semibold hover:bg-red-600 transition" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4">{mode === 'login' ? 'Login' : 'Register'}</h2>
            {error && <div className="mb-2 text-red-500">{error}</div>}
            {success && <div className="mb-2 text-green-600">{success}</div>}
            <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                className="w-full mb-2 px-3 py-2 border rounded"
                required
              />
              {mode === 'register' && (
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full mb-2 px-3 py-2 border rounded"
                  required
                />
              )}
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full mb-3 px-3 py-2 border rounded"
                required
              />
              {mode === 'register' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Join as:</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                  >
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                  </select>
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 rounded font-semibold hover:bg-primary/90 transition"
                disabled={loading}
              >
                {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
              </button>
            </form>
            <div className="mt-4 text-center">
              {mode === 'login' ? (
                <span>Don't have an account?{' '}
                  <button className="text-primary underline" onClick={() => setMode('register')}>Register</button>
                </span>
              ) : (
                <span>Already have an account?{' '}
                  <button className="text-primary underline" onClick={() => setMode('login')}>Login</button>
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;