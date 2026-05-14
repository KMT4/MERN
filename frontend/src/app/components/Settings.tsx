import { User, Lock, Bell, Database, Shield, Mail } from 'lucide-react';

export function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground mb-1">Settings</h2>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-primary" />
          <h3 className="text-card-foreground">Profile Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-card-foreground mb-2">Full Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
              defaultValue="John Doe"
            />
          </div>
          <div>
            <label className="block text-card-foreground mb-2">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
              defaultValue="john.doe@example.com"
            />
          </div>
          <div>
            <label className="block text-card-foreground mb-2">Phone Number</label>
            <input
              type="tel"
              className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
              defaultValue="+1 (555) 123-4567"
            />
          </div>
          <div>
            <label className="block text-card-foreground mb-2">Currency</label>
            <select className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none">
              <option>USD ($)</option>
              <option>EUR (€)</option>
              <option>GBP (£)</option>
              <option>JPY (¥)</option>
            </select>
          </div>
        </div>
        <button className="mt-4 bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
          Save Changes
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-5 h-5 text-primary" />
          <h3 className="text-card-foreground">Security</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-card-foreground mb-2">Current Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-card-foreground mb-2">New Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-card-foreground mb-2">Confirm New Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-ring outline-none"
              placeholder="••••••••"
            />
          </div>
        </div>
        <div className="mt-6 p-4 bg-accent rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-card-foreground font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
            <label className="relative inline-block w-12 h-6">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-12 h-6 bg-muted rounded-full peer peer-checked:bg-primary transition-colors cursor-pointer"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
            </label>
          </div>
        </div>
        <button className="mt-4 bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
          Update Password
        </button>
      </div>

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
              <div key={index} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-card-foreground">{setting.label}</span>
                </div>
                <label className="relative inline-block w-12 h-6">
                  <input type="checkbox" className="sr-only peer" defaultChecked={setting.enabled} />
                  <div className="w-12 h-6 bg-muted rounded-full peer peer-checked:bg-primary transition-colors cursor-pointer"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                </label>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Database className="w-5 h-5 text-primary" />
          <h3 className="text-card-foreground">Data & Privacy</h3>
        </div>
        <div className="space-y-3">
          <button className="w-full text-left p-3 bg-accent rounded-lg hover:bg-accent/80 transition-colors">
            <p className="text-card-foreground font-medium">Export Your Data</p>
            <p className="text-sm text-muted-foreground">Download all your financial data</p>
          </button>
          <button className="w-full text-left p-3 bg-accent rounded-lg hover:bg-accent/80 transition-colors">
            <p className="text-card-foreground font-medium">Privacy Settings</p>
            <p className="text-sm text-muted-foreground">Manage how your data is used</p>
          </button>
          <button className="w-full text-left p-3 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors">
            <p className="font-medium">Delete Account</p>
            <p className="text-sm">Permanently delete your account and all data</p>
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-chart-3/10 to-chart-2/10 border border-chart-3/20 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="w-6 h-6 text-chart-3" />
          <h3 className="text-card-foreground">Security Status</h3>
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-card-foreground">Your data is encrypted with AES-256 encryption</p>
          <p className="text-muted-foreground">Last login: May 12, 2026 at 9:32 AM</p>
          <p className="text-muted-foreground">IP Address: 192.168.1.100</p>
        </div>
      </div>
    </div>
  );
}
