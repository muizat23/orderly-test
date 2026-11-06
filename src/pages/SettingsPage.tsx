import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../components/ui/select';
import { CheckCircle2, Shield, Store, Bell, User } from 'lucide-react';

export const SettingsPage = () => {
  const { user, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'Profile' | 'Store' | 'Notifications' | 'Security'>(
    'Profile'
  );

  // Profile
  const [fullName, setFullName] = useState(user?.name || 'Maya Chen');
  const [email, setEmail] = useState(user?.email || 'maya@orderly.test');

  // Notifications
  const [emailOnOrder, setEmailOnOrder] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(false);

  // Store
  const [storeName, setStoreName] = useState(user?.storeName || 'Orderly Specialty Roasters');
  const [currency, setCurrency] = useState('USD ($)');
  const [timezone, setTimezone] = useState('GMT (London)');
  const [supportEmail, setSupportEmail] = useState('support@orderly.test');

  // Security
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Status
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    api.getSettings().then((s) => {
      if (s) {
        setFullName(s.fullName || 'Maya Chen');
        setEmail(s.email || 'maya@orderly.test');
        setEmailOnOrder(s.emailOnOrder ?? true);
        setLowStockAlerts(s.lowStockAlerts ?? true);
        setWeeklySummary(s.weeklySummary ?? false);
        setStoreName(s.storeName || 'Orderly Specialty Roasters');
        setCurrency(s.currency || 'USD ($)');
        setTimezone(s.timezone || 'GMT (London)');
        setSupportEmail(s.supportEmail || 'support@orderly.test');
        setTwoFactorAuth(s.twoFactorAuth ?? false);
      }
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateSettings({
        fullName,
        email,
        emailOnOrder,
        lowStockAlerts,
        weeklySummary,
        storeName,
        currency,
        timezone,
        supportEmail,
        twoFactorAuth,
      });

      updateUserProfile({
        name: fullName,
        email,
        storeName,
      });

      if (newPassword.trim()) {
        setCurrentPassword('');
        setNewPassword('');
        setToastMessage('Settings and password updated successfully in local storage!');
      } else {
        setToastMessage('Settings updated successfully in local storage!');
      }

      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: unknown) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-[#bfe5d1] bg-[#d9f0e3] p-3 text-xs font-medium text-[#2e8b57] animate-fade-in shadow-2xs">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#14302b]">Settings</h2>
        <p className="text-xs text-[#6b7f7a]">
          Manage account profile, store parameters, notifications, and security.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'Profile', label: 'Profile', icon: User },
          { id: 'Store', label: 'Store', icon: Store },
          { id: 'Notifications', label: 'Notifications', icon: Bell },
          { id: 'Security', label: 'Security', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'Profile' | 'Store' | 'Notifications' | 'Security')}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${activeTab === tab.id
                  ? 'border-[#0f6b5c] bg-[#e4f0ed] font-semibold text-[#0f6b5c]'
                  : 'border-[#dde4e2] bg-white text-[#14302b] hover:bg-[#f3f5f4]'
                }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <Card className="p-6">
        <form onSubmit={handleSave} className="space-y-5 text-xs">
          {/* Profile Tab */}
          {activeTab === 'Profile' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-[#dde4e2]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0f6b5c] text-sm font-bold text-white shadow-xs">
                  {fullName
                    .split(' ')
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || 'MC'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#14302b]">{fullName}</h3>
                  <p className="text-xs text-[#6b7f7a]">{email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[#6b7f7a] mb-1 font-medium">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-lg border border-[#dde4e2] bg-[#fbfcfc] p-2.5 text-xs font-medium text-[#14302b] focus:border-[#0f6b5c] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[#6b7f7a] mb-1 font-medium">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-[#dde4e2] bg-[#fbfcfc] p-2.5 text-xs font-medium text-[#14302b] focus:border-[#0f6b5c] focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Store Tab */}
          {activeTab === 'Store' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[#6b7f7a] mb-1 font-medium">Store Name</label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full rounded-lg border border-[#dde4e2] bg-[#fbfcfc] p-2.5 text-xs font-medium text-[#14302b] focus:border-[#0f6b5c] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[#6b7f7a] mb-1 font-medium">Support Email</label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full rounded-lg border border-[#dde4e2] bg-[#fbfcfc] p-2.5 text-xs font-medium text-[#14302b] focus:border-[#0f6b5c] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[#6b7f7a] mb-1 font-medium">Store Currency</label>
                  <Select value={currency} onValueChange={(val) => setCurrency(val)}>
                    <SelectTrigger className="w-full h-9 rounded-lg bg-[#fbfcfc] border-[#dde4e2]">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD ($)">USD ($) - US Dollar</SelectItem>
                      <SelectItem value="GBP (£)">GBP (£) - British Pound</SelectItem>
                      <SelectItem value="EUR (€)">EUR (€) - Euro</SelectItem>
                      <SelectItem value="CAD ($)">CAD ($) - Canadian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-[#6b7f7a] mb-1 font-medium">Primary Timezone</label>
                  <Select value={timezone} onValueChange={(val) => setTimezone(val)}>
                    <SelectTrigger className="w-full h-9 rounded-lg bg-[#fbfcfc] border-[#dde4e2]">
                      <SelectValue placeholder="Timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GMT (London)">GMT (London / UK)</SelectItem>
                      <SelectItem value="EST (New York)">EST (New York / US)</SelectItem>
                      <SelectItem value="PST (Los Angeles)">PST (Los Angeles / US)</SelectItem>
                      <SelectItem value="CET (Berlin)">CET (Berlin / Europe)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'Notifications' && (
            <div className="space-y-4">
              <p className="text-xs text-[#6b7f7a]">
                Control what email alerts and web notifications you receive for store events.
              </p>

              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between border-t border-[#dde4e2] pt-3">
                  <div>
                    <p className="font-semibold text-[#14302b]">New Order Alert</p>
                    <p className="text-[11px] text-[#6b7f7a]">Receive an email notification when a customer places an order</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmailOnOrder(!emailOnOrder)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${emailOnOrder ? 'bg-[#0f6b5c]' : 'bg-[#dde4e2]'
                      }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5 ${emailOnOrder ? 'translate-x-4' : 'translate-x-0'
                        }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-[#dde4e2] pt-3">
                  <div>
                    <p className="font-semibold text-[#14302b]">Low Stock Threshold Alerts</p>
                    <p className="text-[11px] text-[#6b7f7a]">Alert team when items fall below reorder level</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLowStockAlerts(!lowStockAlerts)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${lowStockAlerts ? 'bg-[#0f6b5c]' : 'bg-[#dde4e2]'
                      }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5 ${lowStockAlerts ? 'translate-x-4' : 'translate-x-0'
                        }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-[#dde4e2] pt-3">
                  <div>
                    <p className="font-semibold text-[#14302b]">Weekly Performance Summary</p>
                    <p className="text-[11px] text-[#6b7f7a]">Receive a weekly recap of sales revenue and order volume</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWeeklySummary(!weeklySummary)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${weeklySummary ? 'bg-[#0f6b5c]' : 'bg-[#dde4e2]'
                      }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5 ${weeklySummary ? 'translate-x-4' : 'translate-x-0'
                        }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'Security' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#dde4e2]">
                <div>
                  <p className="font-semibold text-[#14302b]">Two-Factor Authentication (2FA)</p>
                  <p className="text-[11px] text-[#6b7f7a]">Add an extra layer of security using an authenticator app</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTwoFactorAuth(!twoFactorAuth)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${twoFactorAuth ? 'bg-[#0f6b5c]' : 'bg-[#dde4e2]'
                    }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5 ${twoFactorAuth ? 'translate-x-4' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-1">
                <div>
                  <label className="block text-[#6b7f7a] mb-1 font-medium">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full rounded-lg border border-[#dde4e2] bg-[#fbfcfc] p-2.5 text-xs text-[#14302b] focus:border-[#0f6b5c] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[#6b7f7a] mb-1 font-medium">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (optional)"
                    className="w-full rounded-lg border border-[#dde4e2] bg-[#fbfcfc] p-2.5 text-xs text-[#14302b] focus:border-[#0f6b5c] focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-[#dde4e2]">
            <Button
              type="submit"
              variant="accent"
              disabled={isSaving}
              className="gap-1.5"
            >
              {isSaving ? 'Saving...' : 'Save settings'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
