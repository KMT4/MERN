import { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Bell,
  Database,
  Shield,
  Mail,
  DollarSign,
} from 'lucide-react';
import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
} from '../../api/user';

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
      } catch (err: any) {
        setProfileError(
          err.response?.data?.message || 'Failed to load profile'
        );
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
      setProfileSuccess('Profile updated successfully');
    } catch (err: any) {
      setProfileError(
        err.response?.data?.message || 'Failed to update profile'
      );
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle password change (with confirm validation)
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
      setPasswordError(
        err.response?.data?.message || 'Failed to change password'
      );
    } finally {
      setPasswordLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground mb-1">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Information */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-primary" />
          <h3 className="text-card-foreground">Profile Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-card-foreground mb-2">
              Full Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
              value={profile.fullName}
              onChange={(e) =>
                setProfile({ ...profile, fullName: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-card-foreground mb-2">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
              value={profile.email}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-card-foreground mb-2">
              Monthly Income
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="number"
                className="w-full pl-10 pr-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
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
            <label className="block text-card-foreground mb-2">Currency</label>
            <select
              className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
              value={profile.currency}
              onChange={(e) =>
                setProfile({ ...profile, currency: e.target.value })
              }
            >
              <option>USD ($)</option>
              <option>EUR (€)</option>
              <option>GBP (£)</option>
              <option>JPY (¥)</option>
            </select>
          </div>
        </div>

        {profileError && (
          <p className="text-red-500 text-sm mt-3">{profileError}</p>
        )}
        {profileSuccess && (
          <p className="text-chart-2 text-sm mt-3">{profileSuccess}</p>
        )}

        <button
          onClick={handleProfileUpdate}
          disabled={profileLoading}
          className="mt-4 bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {profileLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Security (Password change) */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-5 h-5 text-primary" />
          <h3 className="text-card-foreground">Security</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-card-foreground mb-2">
              Current Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-card-foreground mb-2">
              New Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-card-foreground mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        {/* Two‑factor placeholder (unchanged) */}
        <div className="mt-6 p-4 bg-accent rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-card-foreground font-medium">
                Two-Factor Authentication
              </p>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security
              </p>
            </div>
            <label className="relative inline-block w-12 h-6">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-12 h-6 bg-muted rounded-full peer peer-checked:bg-primary transition-colors cursor-pointer"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
            </label>
          </div>
        </div>

        {passwordError && (
          <p className="text-red-500 text-sm mt-3">{passwordError}</p>
        )}
        {passwordSuccess && (
          <p className="text-chart-2 text-sm mt-3">{passwordSuccess}</p>
        )}

        <button
          onClick={handlePasswordUpdate}
          disabled={passwordLoading}
          className="mt-4 bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {passwordLoading ? 'Updating...' : 'Update Password'}
        </button>
      </div>

      {/* Notification Settings – unchanged */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="text-card-foreground">Notification Settings</h3>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Email notifications', icon: Mail, enabled: true },
            { label: 'Push notifications', icon: Bell, enabled: true },
            { label: 'SMS alerts for large transactions', icon: Shield, enabled: false },
            { label: 'Weekly financial summary', icon: Mail, enabled: true },
          ].map((setting, index) => {
            const Icon = setting.icon;
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-accent rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-card-foreground">{setting.label}</span>
                </div>
                <label className="relative inline-block w-12 h-6">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked={setting.enabled}
                  />
                  <div className="w-12 h-6 bg-muted rounded-full peer peer-checked:bg-primary transition-colors cursor-pointer"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data & Privacy – unchanged */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Database className="w-5 h-5 text-primary" />
          <h3 className="text-card-foreground">Data & Privacy</h3>
        </div>
        <div className="space-y-3">
          <button className="w-full text-left p-3 bg-accent rounded-lg hover:bg-accent/80 transition-colors">
            <p className="text-card-foreground font-medium">Export Your Data</p>
            <p className="text-sm text-muted-foreground">
              Download all your financial data
            </p>
          </button>
          <button className="w-full text-left p-3 bg-accent rounded-lg hover:bg-accent/80 transition-colors">
            <p className="text-card-foreground font-medium">Privacy Settings</p>
            <p className="text-sm text-muted-foreground">
              Manage how your data is used
            </p>
          </button>
          <button className="w-full text-left p-3 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors">
            <p className="font-medium">Delete Account</p>
            <p className="text-sm">
              Permanently delete your account and all data
            </p>
          </button>
        </div>
      </div>

      {/* Security Status – unchanged */}
      <div className="bg-gradient-to-r from-chart-3/10 to-chart-2/10 border border-chart-3/20 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="w-6 h-6 text-chart-3" />
          <h3 className="text-card-foreground">Security Status</h3>
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-card-foreground">
            Your data is encrypted with AES-256 encryption
          </p>
          <p className="text-muted-foreground">
            Last login: May 12, 2026 at 9:32 AM
          </p>
          <p className="text-muted-foreground">IP Address: 192.168.1.100</p>
        </div>
      </div>
    </div>
  );
}