import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthUser, UserRole } from '../types';

interface StoredAccount extends AuthUser {
  password: string;
}

const DEFAULT_ACCOUNTS: StoredAccount[] = [
  {
    id: 'user-admin',
    name: 'Maya Chen',
    email: 'maya@orderly.test',
    password: 'password123',
    role: 'Admin',
    storeName: 'Orderly Specialty Roasters',
    avatarColor: '#0f6b5c',
  },
  {
    id: 'user-staff',
    name: 'Sam Ortiz',
    email: 'sam@orderly.test',
    password: 'password123',
    role: 'Staff',
    storeName: 'Orderly Specialty Roasters',
    avatarColor: '#2f6fc8',
  },
  {
    id: 'user-viewer',
    name: 'Lena Park',
    email: 'lena@orderly.test',
    password: 'password123',
    role: 'Viewer',
    storeName: 'Orderly Specialty Roasters',
    avatarColor: '#f2a33a',
  },
];

const STORAGE_KEYS = {
  ACTIVE_USER: 'orderly_active_user_v1',
  ACCOUNTS: 'orderly_accounts_v1',
};

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: {
    name: string;
    email: string;
    password?: string;
    role?: UserRole;
    storeName?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  quickLogin: (role: UserRole) => Promise<void>;
  updateUserProfile: (updates: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getInitialAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ACCOUNTS;
  }
}

function getInitialUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    if (!raw) {
      // Default to null so user can experience the sign-in / sign-up flow,
      // or start logged in as Maya if desired. Defaulting to Maya Chen if preferred,
      // but user asked for "let have an auth page, jus a sign in and signup simulation
      // so we would have users sign in and get to the dashboard etc".
      // Let's seed initial active user as null so visitors land on the auth page or can sign in.
      return null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(getInitialUser);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Ensure accounts DB is initialized
    getInitialAccounts();
  }, []);

  const login = async (
    email: string,
    password = 'password123'
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    // Simulate brief network delay
    await new Promise((res) => setTimeout(res, 500));

    const accounts = getInitialAccounts();
    const cleanEmail = email.trim().toLowerCase();
    const found = accounts.find((acc) => acc.email.toLowerCase() === cleanEmail);

    if (!found) {
      setIsLoading(false);
      return {
        success: false,
        error: `No account found with email "${email}". Please check or click 'Create Account'.`,
      };
    }

    if (password && found.password && found.password !== password && password !== 'password123') {
      setIsLoading(false);
      return {
        success: false,
        error: 'Incorrect password. Demo default is "password123".',
      };
    }

    const authUser: AuthUser = {
      id: found.id,
      name: found.name,
      email: found.email,
      role: found.role,
      storeName: found.storeName || 'Orderly Specialty Roasters',
      avatarColor: found.avatarColor || '#0f6b5c',
    };

    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(authUser));
    setUser(authUser);
    setIsLoading(false);
    return { success: true };
  };

  const signup = async (data: {
    name: string;
    email: string;
    password?: string;
    role?: UserRole;
    storeName?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    // Simulate brief network delay
    await new Promise((res) => setTimeout(res, 600));

    const accounts = getInitialAccounts();
    const cleanEmail = data.email.trim().toLowerCase();

    if (accounts.some((acc) => acc.email.toLowerCase() === cleanEmail)) {
      setIsLoading(false);
      return {
        success: false,
        error: `An account with ${cleanEmail} already exists. Please Sign In instead.`,
      };
    }

    const roleColors: Record<UserRole, string> = {
      Admin: '#0f6b5c',
      Staff: '#2f6fc8',
      Viewer: '#f2a33a',
    };

    const newRole: UserRole = data.role || 'Admin';
    const newAccount: StoredAccount = {
      id: `user-${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      password: data.password || 'password123',
      role: newRole,
      storeName: data.storeName?.trim() || 'Orderly Specialty Roasters',
      avatarColor: roleColors[newRole] || '#0f6b5c',
    };

    const updatedAccounts = [newAccount, ...accounts];
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updatedAccounts));

    const authUser: AuthUser = {
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
      role: newAccount.role,
      storeName: newAccount.storeName,
      avatarColor: newAccount.avatarColor,
    };

    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(authUser));
    setUser(authUser);
    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
    setUser(null);
  };

  const quickLogin = async (role: UserRole) => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 350));
    const accounts = getInitialAccounts();
    const target = accounts.find((a) => a.role === role) || DEFAULT_ACCOUNTS.find((a) => a.role === role)!;
    const authUser: AuthUser = {
      id: target.id,
      name: target.name,
      email: target.email,
      role: target.role,
      storeName: target.storeName || 'Orderly Specialty Roasters',
      avatarColor: target.avatarColor || '#0f6b5c',
    };
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(authUser));
    setUser(authUser);
    setIsLoading(false);
  };

  const updateUserProfile = (updates: Partial<AuthUser>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(updated));

    // Also sync in accounts table
    const accounts = getInitialAccounts();
    const idx = accounts.findIndex((a) => a.id === user.id);
    if (idx !== -1) {
      accounts[idx] = { ...accounts[idx], ...updates };
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        quickLogin,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

