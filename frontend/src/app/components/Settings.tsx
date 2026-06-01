import { useState, useEffect } from 'react';
import { User, Lock, Shield, DollarSign } from 'lucide-react';
import { getUserProfile, updateUserProfile, changeUserPassword } from '../../api/user';

// Currency symbol mapping (used locally & exported for the whole app)
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  NGN: '₦',
};

export function Settings() {
  // ---------- Profile state ----------
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    currency: 'USD',
    monthlyIncome: 0,
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // ---------- Password state ----------
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Load user profile on first render
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const user = await getUserProfile();
        setProfile({
          fullName: user.fullName || '',
          email: user.email || '',
          currency: user.currency || 'USD',
          monthlyIncome: user.monthlyIncome || 0,
        });
        // Save currency to localStorage for global access
        localStorage.setItem('currency', user.currency || 'USD');
      } catch (err: any) {
        setProfileError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Handle profile update
  const handleProfileUpdate = async () => {
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);
    try {
      const updated = await updateUserProfile({
        fullName: profile.fullName,
        email: profile.email,
        currency: profile.currency,
        monthlyIncome: profile.monthlyIncome,
      });
      setProfile(updated);
      // Persist currency globally
      localStorage.setItem('currency', updated.currency);
      setProfileSuccess('Profile updated successfully');
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle password change
  const handlePasswordUpdate = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    setPasswordLoading(true);
    try {
      await changeUserPassword({ currentPassword, newPassword });
      setPasswordSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Settings
        </h2>
        <p className="text-muted-foreground mt-0.5">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Information */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-medium text-foreground">Profile Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={profile.fullName}
              onChange={(e) =>
                setProfile({ ...profile, fullName: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={profile.email}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Monthly Income
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={profile.monthlyIncome || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    monthlyIncome: Number(e.target.value),
                  })
                }
                min="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Currency
            </label>
            <select
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={profile.currency}
              onChange={(e) =>
                setProfile({ ...profile, currency: e.target.value })
              }
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="NGN">NGN (₦)</option>
            </select>
          </div>
        </div>

        {profileError && (
          <p className="text-red-500 text-sm mt-3">{profileError}</p>
        )}
        {profileSuccess && (
          <p className="text-emerald-600 text-sm mt-3">{profileSuccess}</p>
        )}

        <button
          onClick={handleProfileUpdate}
          disabled={profileLoading}
          className="mt-4 inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
        >
          {profileLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Security (Password change) */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-medium text-foreground">Security</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              New Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        {/* Two‑factor placeholder (unchanged) */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Two-Factor Authentication
              </p>
              <p className="text-xs text-muted-foreground">
                Add an extra layer of security
              </p>
            </div>
            <label className="relative inline-block w-12 h-6">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary transition-colors cursor-pointer"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
            </label>
          </div>
        </div>

        {passwordError && (
          <p className="text-red-500 text-sm mt-3">{passwordError}</p>
        )}
        {passwordSuccess && (
          <p className="text-emerald-600 text-sm mt-3">{passwordSuccess}</p>
        )}

        <button
          onClick={handlePasswordUpdate}
          disabled={passwordLoading}
          className="mt-4 inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
        >
          {passwordLoading ? 'Updating...' : 'Update Password'}
        </button>
      </div>

      {/* Security Status */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-medium text-foreground">Security Status</h3>
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-foreground">
            Your data is encrypted with AES-256 encryption
          </p>
        
          <p className="text-muted-foreground">IP Address: 192.168.1.100</p>
        </div>
      </div>
    </div>
  );
}