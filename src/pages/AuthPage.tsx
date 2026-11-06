import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Logo } from '../components/Logo';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../components/ui/select';

const DEMO_ACCOUNTS = [
  {
    name: 'Maya Chen',
    email: 'maya@orderly.test',
    role: 'Admin' as UserRole,
    roleColor: 'bg-[#0f6b5c] text-white',
  },
  {
    name: 'Sam Ortiz',
    email: 'sam@orderly.test',
    role: 'Staff' as UserRole,
    roleColor: 'bg-[#2f6fc8] text-white',
  },
  {
    name: 'Lena Park',
    email: 'lena@orderly.test',
    role: 'Viewer' as UserRole,
    roleColor: 'bg-[#f2a33a] text-[#2b1c00]',
  },
];

export const AuthPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated, redirect to /dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Sign In state
  const [signInEmail, setSignInEmail] = useState('maya@orderly.test');
  const [signInPassword, setSignInPassword] = useState('password123');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [isCustomEmail, setIsCustomEmail] = useState(false);

  // UI status
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!signInEmail) {
      setErrorMessage('Please select or enter an email address.');
      return;
    }

    setSubmitting(true);
    const result = await login(signInEmail, signInPassword);
    setSubmitting(false);

    if (result.success) {
      setSuccessMessage('Authentication successful! Loading dashboard...');
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 300);
    } else {
      setErrorMessage(result.error || 'Failed to sign in. Please verify your credentials.');
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#f3f5f4] text-[#14302b]">
      {/* Left Column: Clean Brand Panel (Desktop only) */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-[#0f6b5c] p-12 text-white lg:flex">
        {/* Top Logo */}
        <div>
          <Logo variant="sidebar" size="lg" showBadge={false} />
          <p className="mt-2 text-xs text-emerald-100/70">
            Order Management & Fulfillment Dashboard
          </p>
        </div>

        {/* Center Editorial Title */}
        <div className="max-w-md space-y-4">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white">
            Streamline your orders, stock, and fulfillment in one place.
          </h1>
          <p className="text-sm leading-relaxed text-emerald-100/80">
            Real-time order state progression, live inventory deduction, and multi-role operations designed for modern ecommerce teams.
          </p>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-white/10 pt-4 text-xs text-emerald-100/60">
          <span>Orderly Commerce Dashboard &bull; Web Developer Test</span>
        </div>
      </div>

      {/* Right Column: Clean Sign In Form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-20">
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="mb-6 lg:hidden">
            <Logo variant="light" size="md" showBadge={false} />
          </div>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-[#14302b]">Sign In</h2>
            <p className="mt-1 text-xs text-[#6b7f7a]">
              Select a team account below for instant demo access.
            </p>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700 animate-fade-in shadow-2xs">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800 animate-fade-in shadow-2xs">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#14302b]">
                  Account (Instant Access)
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomEmail(!isCustomEmail)}
                  className="text-[11px] text-[#0f6b5c] hover:underline cursor-pointer"
                >
                  {isCustomEmail ? 'Choose instant demo account' : 'Enter custom email'}
                </button>
              </div>

              {isCustomEmail ? (
                <input
                  type="email"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-[#dde4e2] bg-white py-2.5 px-3 text-xs text-[#14302b] placeholder-[#6b7f7a] focus:border-[#0f6b5c] focus:outline-hidden"
                />
              ) : (
                <Select
                  value={signInEmail}
                  onValueChange={(val) => {
                    setSignInEmail(val);
                    setSignInPassword('password123');
                  }}
                >
                  <SelectTrigger className="w-full h-11 rounded-xl bg-white border-[#dde4e2] px-3 text-xs cursor-pointer">
                    <SelectValue placeholder="Select instant access account..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DEMO_ACCOUNTS.map((acc) => (
                      <SelectItem key={acc.email} value={acc.email}>
                        <div className="flex items-center gap-2 py-0.5 w-full">
                          <span className="font-semibold text-[#14302b]">{acc.name}</span>
                          <span className="text-[11px] text-[#6b7f7a] font-normal">
                            ({acc.email})
                          </span>
                          <span className={`ml-auto rounded px-1.5 py-0.5 text-[10px] font-bold ${acc.roleColor}`}>
                            {acc.role}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#14302b] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-[#6b7f7a]" />
                <input
                  type={showSignInPassword ? 'text' : 'password'}
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#dde4e2] bg-white py-2.5 pl-9 pr-10 text-xs text-[#14302b] placeholder-[#6b7f7a] focus:border-[#0f6b5c] focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowSignInPassword(!showSignInPassword)}
                  className="absolute right-3 top-3 text-[#6b7f7a] hover:text-[#14302b] cursor-pointer"
                  tabIndex={-1}
                >
                  {showSignInPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 mt-2 text-xs font-bold gap-1.5 cursor-pointer"
            >
              {submitting ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In & Enter Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
