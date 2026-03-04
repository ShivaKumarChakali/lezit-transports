import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarCheck2, CreditCard, Truck, Shield, Moon, Sun } from 'lucide-react';
import { useTheme } from '../theme/ThemeProvider';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/premium/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/premium/bookings', label: 'Bookings', icon: CalendarCheck2 },
  { to: '/premium/payments', label: 'Payments', icon: CreditCard },
  { to: '/premium/driver-assignment', label: 'Driver Assignment', icon: Truck },
  { to: '/premium/admin', label: 'Admin Panel', icon: Shield }
];

const PremiumLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-[240px_1fr]">
        <aside className="border-b border-border/60 bg-card/95 px-4 py-4 lg:border-b-0 lg:border-r">
          <div className="mb-4 flex items-center justify-between lg:mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Lezit</p>
              <p className="text-base font-semibold">Transports Cloud</p>
            </div>
            <button
              onClick={toggleTheme}
              className="rounded-xl border border-border/60 bg-background p-2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>

          <nav className="grid gap-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="space-y-6 bg-gradient-to-b from-background via-background to-muted/20 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PremiumLayout;
