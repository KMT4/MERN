import { useState, useEffect } from "react";
import {
  User,
  Lock,
  Bell,
  Database,
  Shield,
  Mail,
  DollarSign,
  Save,
  KeyRound,
  Download,
  Trash2,
  Eye,
  RefreshCw,
  Smartphone,
  FileDown,
  Settings2,
} from "lucide-react";
import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
} from "../../api/user";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function SettingsPanel({
  title,
  subtitle,
  icon: Icon,
  children,
  right,
  className,
}: {
  title: string;
  subtitle?: string;
  icon: any;
  children: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/80 bg-card shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col justify-between gap-3 border-b border-border/80 p-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <Icon className="h-4 w-4" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-card-foreground">
              {title}
            </h3>

            {subtitle && (
              <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>

        {right}
      </div>

      <div className="p-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-card-foreground">
        {label}
      </label>

      {children}
    </div>
  );
}

function StatusMessage({
  type,
  children,
}: {
  type: "success" | "error";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mt-4 rounded-xl border px-3 py-2 text-xs font-medium",
        type === "success"
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
          : "border-red-500/20 bg-red-500/10 text-red-500",
      )}
    >
      {children}
    </div>
  );
}

function Toggle({ defaultChecked }: { defaultChecked?: boolean }) {
  return (
    <label className="relative inline-block h-5 w-10 shrink-0">
      <input
        type="checkbox"
        className="peer sr-only"
        defaultChecked={defaultChecked}
      />

      <div className="h-5 w-10 cursor-pointer rounded-full bg-muted transition-colors peer-checked:bg-primary" />

      <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
    </label>
  );
}

export function Settings() {
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    currency: "USD",
    monthlyIncome: 0,
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);

        const user = await getUserProfile();

        setProfile({
          fullName: user.fullName || "",
          email: user.email || "",
          currency: user.currency || "USD",
          monthlyIncome: user.monthlyIncome || 0,
        });
      } catch (err: any) {
        setProfileError(
          err.response?.data?.message || "Failed to load profile",
        );
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileUpdate = async () => {
    setProfileError("");
    setProfileSuccess("");
    setProfileLoading(true);

    try {
      const updated = await updateUserProfile({
        fullName: profile.fullName,
        email: profile.email,
        currency: profile.currency,
        monthlyIncome: profile.monthlyIncome,
      });

      setProfile(updated);
      setProfileSuccess("Profile updated successfully");
    } catch (err: any) {
      setProfileError(
        err.response?.data?.message || "Failed to update profile",
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setPasswordLoading(true);

    try {
      await changeUserPassword({ currentPassword, newPassword });

      setPasswordSuccess("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(
        err.response?.data?.message || "Failed to change password",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const inputClass =
    "h-10 w-full rounded-xl border border-border bg-input-background px-3 text-sm text-card-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-4 focus:ring-primary/10";

  const notificationSettings = [
    {
      label: "Email notifications",
      description: "Receive important account and finance alerts.",
      icon: Mail,
      enabled: true,
    },
    {
      label: "Push notifications",
      description: "Get quick reminders and spending updates.",
      icon: Bell,
      enabled: true,
    },
    {
      label: "SMS alerts for large transactions",
      description: "Receive text alerts for unusual activity.",
      icon: Shield,
      enabled: false,
    },
    {
      label: "Weekly financial summary",
      description: "Get a weekly snapshot of your money activity.",
      icon: FileDown,
      enabled: true,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-primary" />

            <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Settings
            </span>
          </div>

          <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            Account Settings
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your profile, security, notifications and data preferences.
          </p>
        </div>

        <button
          onClick={handleProfileUpdate}
          disabled={profileLoading}
          className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 text-xs font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
        >
          {profileLoading ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          Save Profile
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <SettingsPanel
          title="Profile Information"
          subtitle="Update your personal and financial preferences."
          icon={User}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Full Name">
              <input
                type="text"
                className={inputClass}
                value={profile.fullName}
                onChange={(e) =>
                  setProfile({ ...profile, fullName: e.target.value })
                }
                placeholder="Your full name"
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                className={inputClass}
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                placeholder="you@example.com"
              />
            </Field>

            <Field label="Monthly Income">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  type="number"
                  className={cn(inputClass, "pl-9")}
                  value={profile.monthlyIncome || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      monthlyIncome: Number(e.target.value),
                    })
                  }
                  min="0"
                  placeholder="0"
                />
              </div>
            </Field>

            <Field label="Currency">
              <select
                className={inputClass}
                value={profile.currency}
                onChange={(e) =>
                  setProfile({ ...profile, currency: e.target.value })
                }
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </Field>
          </div>

          {profileError && (
            <StatusMessage type="error">{profileError}</StatusMessage>
          )}

          {profileSuccess && (
            <StatusMessage type="success">{profileSuccess}</StatusMessage>
          )}

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleProfileUpdate}
              disabled={profileLoading}
              className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
            >
              {profileLoading ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {profileLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </SettingsPanel>

        <SettingsPanel
          title="Security Status"
          subtitle="Your account protection summary."
          icon={Shield}
          className="h-fit"
          right={
            <span className="w-fit rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-500 ring-1 ring-emerald-500/15">
              Protected
            </span>
          }
        >
          <div className="space-y-3">
            <div className="rounded-xl border border-border/70 bg-background/50 p-3">
              <p className="text-xs text-muted-foreground">Encryption</p>
              <p className="mt-1 text-sm font-medium text-card-foreground">
                AES-256 enabled
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-background/50 p-3">
              <p className="text-xs text-muted-foreground">Last login</p>
              <p className="mt-1 text-sm font-medium text-card-foreground">
                May 12, 2026 at 9:32 AM
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-background/50 p-3">
              <p className="text-xs text-muted-foreground">IP Address</p>
              <p className="mt-1 text-sm font-medium text-card-foreground">
                192.168.1.100
              </p>
            </div>
          </div>
        </SettingsPanel>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SettingsPanel
          title="Password & Access"
          subtitle="Change your password and manage authentication."
          icon={Lock}
        >
          <div className="space-y-4">
            <Field label="Current Password">
              <input
                type="password"
                className={inputClass}
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </Field>

            <Field label="New Password">
              <input
                type="password"
                className={inputClass}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Field>

            <Field label="Confirm New Password">
              <input
                type="password"
                className={inputClass}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Field>
          </div>

          <div className="mt-5 rounded-xl border border-border/70 bg-background/50 p-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <KeyRound className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-card-foreground">
                    Two-Factor Authentication
                  </p>

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Add an extra layer of security.
                  </p>
                </div>
              </div>

              <Toggle />
            </div>
          </div>

          {passwordError && (
            <StatusMessage type="error">{passwordError}</StatusMessage>
          )}

          {passwordSuccess && (
            <StatusMessage type="success">{passwordSuccess}</StatusMessage>
          )}

          <div className="mt-4 flex justify-end">
            <button
              onClick={handlePasswordUpdate}
              disabled={passwordLoading}
              className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
            >
              {passwordLoading ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Lock className="h-3.5 w-3.5" />
              )}
              {passwordLoading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </SettingsPanel>

        <SettingsPanel
          title="Notification Settings"
          subtitle="Control how FinanceTracker keeps you updated."
          icon={Bell}
        >
          <div className="space-y-3">
            {notificationSettings.map((setting, index) => {
              const Icon = setting.icon;

              return (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-background/50 p-3 transition-colors hover:bg-accent/40"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-card-foreground">
                        {setting.label}
                      </p>

                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {setting.description}
                      </p>
                    </div>
                  </div>

                  <Toggle defaultChecked={setting.enabled} />
                </div>
              );
            })}
          </div>
        </SettingsPanel>
      </div>

      <SettingsPanel
        title="Data & Privacy"
        subtitle="Export data, manage privacy controls, or delete your account."
        icon={Database}
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <button className="rounded-xl border border-border/70 bg-background/50 p-4 text-left transition-colors hover:bg-accent/40">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Download className="h-4 w-4" />
            </div>

            <p className="text-sm font-semibold text-card-foreground">
              Export Your Data
            </p>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Download all financial records and account data.
            </p>
          </button>

          <button className="rounded-xl border border-border/70 bg-background/50 p-4 text-left transition-colors hover:bg-accent/40">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Eye className="h-4 w-4" />
            </div>

            <p className="text-sm font-semibold text-card-foreground">
              Privacy Settings
            </p>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Control how your account and finance data is used.
            </p>
          </button>

          <button className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-left text-red-500 transition-colors hover:bg-red-500/15">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
              <Trash2 className="h-4 w-4" />
            </div>

            <p className="text-sm font-semibold">Delete Account</p>

            <p className="mt-1 text-xs leading-5">
              Permanently delete your account and all stored data.
            </p>
          </button>
        </div>
      </SettingsPanel>

      <section className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-emerald-500/10 p-4 shadow-sm">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <Smartphone className="h-4 w-4" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-card-foreground">
              Account protection is active
            </h3>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Your financial workspace uses encrypted sessions, secure password
              controls, and privacy-first account settings.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}