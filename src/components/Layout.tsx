import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu, ChevronDown, Settings as SettingsIcon, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './ui/dropdown-menu';

export const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, quickLogin } = useAuth();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/orders')) return 'Orders';
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/customers')) return 'Customers';
    if (path.startsWith('/products')) return 'Products';
    if (path.startsWith('/inventory')) return 'Inventory';
    if (path.startsWith('/reports')) return 'Reports';
    if (path.startsWith('/team')) return 'Team';
    if (path.startsWith('/settings')) return 'Settings';
    return 'Dashboard';
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleSignOut = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen w-full bg-[#f3f5f4] text-[#14302b]">
      {/* Fixed Desktop Sidebar */}
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content Area offset by sidebar width on desktop */}
      <div className="flex min-h-screen flex-col pt-16 md:pl-60">
        {/* Top Header Bar - Fixed permanently at top so it NEVER moves while scrolling */}
        <header className="fixed top-0 right-0 left-0 z-30 flex h-16 items-center justify-between border-b border-[#dde4e2] bg-white px-6 md:left-60">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-2 text-[#14302b] hover:bg-[#e4f0ed] md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold text-[#14302b]">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2.5 text-left transition-opacity hover:opacity-85 focus:outline-hidden cursor-pointer"
                  aria-label="User account menu"
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs"
                    style={{ backgroundColor: user?.avatarColor || '#0f6b5c' }}
                  >
                    {getInitials(user?.name)}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-semibold leading-tight text-[#14302b]">
                      {user?.name || 'Guest User'}
                    </p>
                    <p className="text-[11px] text-[#6b7f7a] flex items-center gap-1">
                      <span>{user?.role || 'Viewer'}</span>
                      <ChevronDown className="h-3 w-3 opacity-60" />
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-xs font-bold text-[#14302b]">{user?.name || 'User'}</p>
                  <p className="text-[11px] text-[#6b7f7a] truncate">{user?.email || 'user@orderly.test'}</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded bg-[#e4f0ed] px-2 py-0.5 text-[10px] font-semibold text-[#0f6b5c]">
                      <Shield className="h-2.5 w-2.5" />
                      {user?.role || 'Staff'}
                    </span>
                    <span className="text-[10px] text-[#6b7f7a] truncate">
                      {user?.storeName || 'Specialty Roasters'}
                    </span>
                  </div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <SettingsIcon className="mr-2 h-4 w-4 text-[#6b7f7a]" />
                  <span>Settings & Profile</span>
                </DropdownMenuItem>

                <DropdownMenuLabel>Switch Demo User</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => quickLogin('Admin')}>
                  <div className="flex items-center justify-between w-full">
                    <span>Maya Chen</span>
                    <span className="text-[10px] text-[#0f6b5c] font-bold">Admin</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => quickLogin('Staff')}>
                  <div className="flex items-center justify-between w-full">
                    <span>Sam Ortiz</span>
                    <span className="text-[10px] text-[#2f6fc8] font-bold">Staff</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => quickLogin('Viewer')}>
                  <div className="flex items-center justify-between w-full">
                    <span>Lena Park</span>
                    <span className="text-[10px] text-[#f2a33a] font-bold">Viewer</span>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700"
                >
                  <LogOut className="mr-2 h-4 w-4 text-red-500" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-6 md:p-8 lg:p-10">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>

        {/* App Footer */}
        <footer className="border-t border-[#dde4e2] bg-white px-6 py-3 text-xs text-[#6b7f7a]">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <span>Orderly &bull; Order Management System</span>
            <span>Version 1.0.0</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
