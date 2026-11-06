import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Boxes,
  BarChart3,
  UserCheck,
  Settings,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Orders', to: '/orders', icon: ShoppingCart },
    { label: 'Customers', to: '/customers', icon: Users },
    { label: 'Products', to: '/products', icon: Package },
    { label: 'Inventory', to: '/inventory', icon: Boxes },
    { label: 'Reports', to: '/reports', icon: BarChart3 },
    { label: 'Team', to: '/team', icon: UserCheck },
    { label: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container - permanently fixed on desktop to avoid scroll jitter */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-[#0f6b5c] p-5 text-white transition-transform duration-200 ease-in-out md:translate-x-0 md:transition-none ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between pb-8 pt-1">
          <Logo variant="sidebar" size="md" />
          {onClose && (
            <button
              onClick={onClose}
              className="rounded p-1 text-emerald-200 hover:bg-white/10 hover:text-white md:hidden"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all ${isActive
                    ? 'bg-white/18 font-semibold text-white shadow-xs'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0 opacity-80" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Store & User Info */}
        <div className="border-t border-white/15 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-xs"
                style={{ backgroundColor: user?.avatarColor || 'rgba(255,255,255,0.2)' }}
              >
                {user?.name
                  ? user.name
                    .split(' ')
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()
                  : '☕'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">
                  {user?.name || 'Orderly Roasters'}
                </p>
                <p className="truncate text-[11px] text-emerald-200">
                  {user?.role ? `${user.role} • ` : ''}{user?.storeName || 'Main Hub'}
                </p>
              </div>
            </div>

            {user && (
              <button
                type="button"
                onClick={handleLogout}
                title="Sign Out"
                className="rounded-lg p-1.5 text-white/70 hover:bg-white/15 hover:text-white transition-colors"
                aria-label="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
