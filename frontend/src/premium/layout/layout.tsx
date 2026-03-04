import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarCheck2, CreditCard, Truck, Shield, Moon, Sun, Menu, X, Bell, LogOut, Settings, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../theme/ThemeProvider';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/premium/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/premium/bookings', label: 'Bookings', icon: CalendarCheck2 },
  { to: '/premium/payments', label: 'Payments', icon: CreditCard },
  { to: '/premium/driver-assignment', label: 'Driver Assignment', icon: Truck },
  { to: '/premium/admin', label: 'Admin Panel', icon: Shield }
];

// Breadcrumb configuration
const breadcrumbMap: Record<string, string[]> = {
  '/premium/dashboard': ['Dashboard'],
  '/premium/bookings': ['Operations', 'Bookings'],
  '/premium/payments': ['Operations', 'Payments'],
  '/premium/driver-assignment': ['Operations', 'Driver Assignment'],
  '/premium/admin': ['Administration', 'Admin Panel'],
};

// Get breadcrumb items for current route
const getBreadcrumbs = (pathname: string): string[] => {
  return breadcrumbMap[pathname] || ['Dashboard'];
};

const PremiumLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setUserMenuOpen(false);
  };

  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: '#f7f7f7' }}>
      {/* Top Header Bar */}
      <header className="sticky top-0 left-0 right-0 z-50 h-16 border-b-2 shadow-lg" style={{ backgroundColor: '#000000', borderColor: '#d4af37' }}>
        <div className="h-full flex items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
          {/* Left: Mobile Menu + Branding + Breadcrumbs */}
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden flex-shrink-0 rounded-lg border p-2 transition-all"
              style={{ color: '#ffffff', borderColor: '#d4af37', backgroundColor: 'transparent' }}
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Mobile Branding */}
            <div className="lg:hidden flex-shrink-0 flex flex-col leading-tight">
              <p className="text-xs uppercase tracking-[0.18em] font-semibold" style={{ color: '#ffffff' }}>Lezit</p>
              <p className="text-xs font-bold" style={{ color: '#d4af37' }}>Transports</p>
            </div>

            {/* Breadcrumbs - with truncation */}
            <nav className="hidden md:flex items-center gap-1 text-sm min-w-0 flex-1">
              {breadcrumbs.map((crumb, idx) => (
                <div key={idx} className="flex items-center gap-1 min-w-0">
                  {idx > 0 && <ChevronRight className="h-4 w-4 flex-shrink-0" style={{ color: '#d4af37' }} />}
                  <span className="truncate" style={{ 
                    color: idx === breadcrumbs.length - 1 ? '#ffffff' : 'rgba(255, 255, 255, 0.78)',
                    fontWeight: idx === breadcrumbs.length - 1 ? 600 : 400
                  }}>
                    {crumb}
                  </span>
                </div>
              ))}
            </nav>

            {/* Desktop Navigation Menu */}
            <nav className="hidden lg:flex items-center gap-1 ml-8">
              <Link to="/" className="px-3 py-2 text-sm font-medium rounded" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Home</Link>
              <Link to="/services" className="px-3 py-2 text-sm font-medium rounded" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Services</Link>
              <Link to="/contact" className="px-3 py-2 text-sm font-medium rounded" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Contact</Link>
            </nav>
          </div>

          {/* Right: Actions - with flex-shrink-0 to prevent squishing */}
          <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
            {/* Notifications */}
            <button className="relative rounded-lg border p-2 transition-all" style={{ color: '#ffffff', borderColor: '#d4af37', backgroundColor: 'transparent' }}>
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: '#d4af37' }} />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-lg border p-2 transition-all"
              style={{ color: '#ffffff', borderColor: '#d4af37', backgroundColor: 'transparent' }}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-lg border px-3 py-2 transition-all"
                style={{ color: '#ffffff', borderColor: '#d4af37', backgroundColor: 'transparent' }}
              >
                <div className="h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{ color: '#000000', backgroundColor: '#d4af37' }}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:block text-sm font-medium text-white">{user?.name?.split(' ')[0] || 'User'}</span>
              </button>

              {/* User Menu Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl border animate-in fade-in zoom-in-95 duration-200" style={{
                  backgroundColor: '#ffffff',
                  borderColor: '#eadfb8'
                }}>
                  <div className="border-b px-4 py-3" style={{ borderColor: '#eadfb8' }}>
                    <p className="text-sm font-semibold" style={{ color: '#1f2937' }}>{user?.name}</p>
                    <p className="text-xs" style={{ color: '#6b7280' }}>{user?.email}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
                      style={{ color: '#1f2937' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7f1df'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
                      style={{ color: '#ef4444' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fbe7b6'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Enhanced Sidebar */}
        <aside
          className={cn(
            'fixed left-0 top-16 z-40 h-[calc(100vh-64px)] w-60 overflow-y-auto border-r px-3 py-4 shadow-lg transition-transform duration-300 md:w-72 lg:static lg:border-b-0 lg:shadow-none',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
          style={{
            backgroundColor: '#ffffff',
            borderColor: '#e5d7a8'
          }}
        >
          {/* Sidebar Header */}
          <div className="mb-8 hidden lg:block">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.18em] font-bold" style={{ color: '#8a6f22' }}>Navigation</p>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200'
                  )}
                  style={{
                    backgroundColor: isActive ? '#f7f1df' : 'transparent',
                    color: isActive ? '#000000' : '#1f2937'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#fcf6e8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-lg" style={{ backgroundColor: '#d4af37' }} />
                  )}
                  
                  <Icon className={cn(
                    'h-5 w-5 flex-shrink-0 transition-transform duration-200',
                    isActive && 'scale-110'
                  )} style={{ color: isActive ? '#d4af37' : '#6b7280' }} />
                  
                  <span className="flex-1 truncate">{label}</span>
                  
                  {isActive && (
                    <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: '#d4af37' }} />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="absolute bottom-0 left-0 right-0 border-t p-3 lg:relative lg:mt-8 lg:border-t" style={{
            backgroundColor: '#ffffff',
            borderColor: '#e5d7a8'
          }}>
            <div className="flex items-center gap-3 rounded-lg border p-3" style={{
              backgroundColor: '#f8f3e4',
              borderColor: '#e5d7a8'
            }}>
              <div className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ color: '#000000', backgroundColor: '#d4af37' }}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold" style={{ color: '#1f2937' }}>{user?.name}</p>
                <p className="truncate text-xs" style={{ color: '#6a5a2a' }}>{user?.role}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 w-full space-y-6 p-4 md:p-6 lg:p-8 overflow-y-auto min-h-[calc(100vh-64px)]" style={{
          backgroundColor: '#f7f7f7'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default PremiumLayout;
