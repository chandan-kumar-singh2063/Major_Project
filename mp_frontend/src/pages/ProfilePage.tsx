import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, ordersAPI } from '@/api/services';
import { Package, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

interface Order {
  id: number;
  created_at: string;
  status: string;
  total_price: string;
  items: any[];
}

const ProfilePage = () => {
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editProfile, setEditProfile] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', confirm_new_password: '' });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token) {
      navigate('/');
      return;
    }

    Promise.all([
      authAPI.getProfile(),
      ordersAPI.getMyOrders()
    ])
      .then(([profileRes, ordersRes]: [any, any]) => {
        setProfile(profileRes.data);
        setOrders(ordersRes.data.slice(0, 5));
      })
      .catch(() => setError('Failed to load profile data'))
      .finally(() => setLoading(false));
  }, [navigate]);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await authAPI.updateProfile(profile);
      setSuccess('Profile updated!');
      setEditProfile(false);
      setTimeout(() => setSuccess(null), 1500);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err?.response?.data?.error || err?.response?.data?.detail || 'Failed to update profile');
      setTimeout(() => setError(null), 3000);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    navigate('/');
    window.location.reload();
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    if (passwordForm.new_password !== passwordForm.confirm_new_password) {
      setPasswordError('New passwords do not match');
      return;
    }
    try {
      await authAPI.changePassword({ old_password: passwordForm.old_password, new_password: passwordForm.new_password });
      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({ old_password: '', new_password: '', confirm_new_password: '' });
      setTimeout(() => setPasswordSuccess(null), 1500);
    } catch (err: any) {
      setPasswordError(err?.response?.data?.error || 'Failed to change password');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex text-black dark:text-white transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg p-6 flex flex-col gap-4">
        <div className="mb-6">
          <div className="font-bold text-lg text-primary">My Account</div>
        </div>
        <nav className="flex flex-col gap-2">
          <button className="text-left px-3 py-2 rounded hover:bg-primary/10 font-medium bg-primary/10 text-primary">Profile</button>
          <button className="text-left px-3 py-2 rounded hover:bg-primary/10 font-medium text-gray-700 dark:text-gray-200" onClick={() => navigate('/orders')}>My Orders</button>
          <button className="text-left px-3 py-2 rounded hover:bg-primary/10 font-medium text-gray-700 dark:text-gray-200" disabled>My Reviews</button>
          <button className="text-left px-3 py-2 rounded hover:bg-primary/10 font-medium text-gray-700 dark:text-gray-200" onClick={() => navigate('/wishlist')}>My Wishlist</button>
          <button className="text-left px-3 py-2 rounded hover:bg-primary/10 font-medium text-gray-700 dark:text-gray-200" disabled>My Returns</button>

          <button className="text-left px-3 py-2 rounded hover:bg-red-100 text-red-600 font-medium mt-8" onClick={handleLogout}>Logout</button>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8">
        <h2 className="text-3xl font-bold mb-6">Manage My Account</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Personal Profile */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <div className="font-semibold text-lg text-gray-900 dark:text-white">Personal Profile</div>
              <button className="text-primary underline hover:text-primary/80 transition" onClick={() => setEditProfile(v => !v)}>{editProfile ? 'Cancel' : 'Edit'}</button>
            </div>
            {success && <div className="mb-4 p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded text-center">{success}</div>}
            {editProfile ? (
              <form onSubmit={handleSave} className="flex flex-col gap-3">
                <input type="text" name="username" value={profile?.username || ''} disabled className="px-3 py-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-500" />
                <input type="email" name="email" value={profile?.email || ''} onChange={handleChange} className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600" required />
                <input type="text" name="first_name" placeholder="First Name" value={profile?.first_name || ''} onChange={handleChange} className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                <input type="text" name="last_name" placeholder="Last Name" value={profile?.last_name || ''} onChange={handleChange} className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                <input type="text" name="phone_number" placeholder="Phone Number" value={profile?.phone_number || ''} onChange={handleChange} className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                <textarea name="address" placeholder="Shipping Address" value={profile?.address || ''} onChange={(e: any) => setProfile({ ...profile, address: e.target.value })} className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 min-h-[100px]" />
                <button type="submit" className="bg-primary text-white py-2 rounded font-semibold hover:bg-primary/90 transition shadow-md">Save Changes</button>
              </form>
            ) : (
              <div className="flex flex-col gap-3 text-gray-700 dark:text-gray-300">
                <div className="flex justify-between border-b border-gray-50 dark:border-gray-700 pb-2"><span className="font-medium">Username:</span> {profile?.username}</div>
                <div className="flex justify-between border-b border-gray-50 dark:border-gray-700 pb-2"><span className="font-medium">Email:</span> {profile?.email}</div>
                <div className="flex justify-between border-b border-gray-50 dark:border-gray-700 pb-2"><span className="font-medium">First Name:</span> {profile?.first_name || '-'}</div>
                <div className="flex justify-between border-b border-gray-50 dark:border-gray-700 pb-2"><span className="font-medium">Last Name:</span> {profile?.last_name || '-'}</div>
                <div className="flex justify-between"><span className="font-medium">Phone:</span> {profile?.phone_number || '-'}</div>
              </div>
            )}
          </div>

          {/* Address Book */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <div className="font-semibold text-lg text-gray-900 dark:text-white">Shipping Address</div>
              <button className="text-primary underline hover:text-primary/80 transition" onClick={() => setEditProfile(true)}>Edit</button>
            </div>
            {profile?.address ? (
              <div className="text-gray-700 dark:text-gray-300">
                <p className="font-medium mb-1">Default Address:</p>
                <p className="whitespace-pre-wrap">{profile.address}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <p>No addresses found.</p>
                <button className="text-primary text-sm mt-2 hover:underline" onClick={() => setEditProfile(true)}>Add Address</button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-100 dark:border-gray-700 mb-8 transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              <div className="font-bold text-xl text-gray-900 dark:text-white">Recent Orders</div>
            </div>
            <button
              onClick={() => navigate('/orders')}
              className="group flex items-center gap-1 text-primary text-sm font-semibold hover:underline"
            >
              View All History
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="flex flex-wrap items-center justify-between p-4 rounded-xl border border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      #{order.id}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Ordered {new Date(order.created_at).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500">{order.items.length} items • Rs. {order.total_price}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${order.status.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-primary/10 text-primary'
                      }`}>
                      {order.status.toLowerCase() === 'delivered' ? <CheckCircle className="w-3 h-3" /> :
                        order.status.toLowerCase() === 'cancelled' ? <XCircle className="w-3 h-3" /> :
                          <Clock className="w-3 h-3" />}
                      {order.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No orders found yet.</p>
              <button
                onClick={() => navigate('/')}
                className="mt-4 text-primary font-semibold hover:underline"
              >
                Start Shopping
              </button>
            </div>
          )}
        </div>


        {/* Change Password */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Security</h3>
          {passwordError && <div className="mb-4 p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded text-sm text-center">{passwordError}</div>}
          {passwordSuccess && <div className="mb-4 p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded text-sm text-center">{passwordSuccess}</div>}
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Old Password</label>
              <input
                type="password"
                name="old_password"
                value={passwordForm.old_password}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary/20 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">New Password</label>
              <input
                type="password"
                name="new_password"
                value={passwordForm.new_password}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary/20 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Confirm New Password</label>
              <input
                type="password"
                name="confirm_new_password"
                value={passwordForm.confirm_new_password}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary/20 outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 rounded font-semibold hover:bg-primary/90 transition shadow-md"
            >
              Update Password
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;