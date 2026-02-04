import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '@/api/services';
import ReCAPTCHA from 'react-google-recaptcha';

const RegisterPage = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'buyer' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA.');
      setLoading(false);
      return;
    }
    try {
      await authAPI.register({ ...form, recaptcha_token: recaptchaToken });
      setSuccess('Registration successful! Please login.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err: any) {
      console.error("Registration Error:", err.response?.data);
      let errorMsg = 'Registration failed';

      if (err.response?.data) {
        const data = err.response.data;
        if (data.non_field_errors) errorMsg = data.non_field_errors[0];
        else if (data.detail) errorMsg = data.detail;
        else if (data.email) errorMsg = `Email: ${data.email[0]}`;
        else if (data.username) errorMsg = `Username: ${data.username[0]}`;
        else if (data.password) errorMsg = `Password: ${data.password[0]}`;
        else if (data.recaptcha_token) errorMsg = `reCAPTCHA: ${data.recaptcha_token[0]}`;
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
        {error && <div className="mb-2 text-red-500 text-center">{error}</div>}
        {success && <div className="mb-2 text-green-600 text-center">{success}</div>}
        <form onSubmit={handleRegister}>
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
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
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
            className="w-full mb-3 px-3 py-2 border rounded"
            required
          />
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              I want to join as a:
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
            >
              <option value="buyer">Buyer (Customer)</option>
              <option value="seller">Seller (Merchant)</option>
            </select>
          </div>
          <ReCAPTCHA
            sitekey="6LfHFYUrAAAAACVr6Xq3VHKv4VJlaYSJgQ9uWCQE"
            onChange={setRecaptchaToken}
            className="mb-4"
          />
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded font-semibold hover:bg-primary/90 transition mb-3"
            disabled={loading || !recaptchaToken}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <div className="text-center mt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-primary underline">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;