'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bug,
  LayoutDashboard,
  FolderKanban,
  Upload,
  BarChart3,
  Settings,
  ChevronLeft,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

type SessionUser = {
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
};

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Projects',
    href: '/dashboard/projects',
    icon: FolderKanban,
  },
  {
    title: 'Failures',
    href: '/dashboard/failures',
    icon: Bug,
  },
  {
    title: 'Uploads',
    href: '/dashboard/uploads',
    icon: Upload,
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
];

const bottomNavItems = [
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      const response = await fetch('/api/auth/session');
      if (!response.ok) return;
      const result = await response.json();
      if (!cancelled) setUser(result.user);
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  const displayName = user?.user_metadata?.full_name || user?.email || 'Account';
  const displayEmail = user?.email || '';
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="flex flex-col w-64 border-r border-border bg-card h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
          <Bug className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-semibold tracking-tight">TestPulse</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-primary/15 to-primary/5 text-primary border-l-2 border-primary font-medium'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Bottom section */}
      <div className="p-3 space-y-1">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.title}
            </Link>
          );
        })}

        <button
          onClick={async () => {
            try {
              await fetch('/api/auth/logout', { method: 'POST' });
            } catch (e) {
              // Ignore errors
            }
            window.location.href = '/login';
          }}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>

      {/* User section */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.user_metadata?.avatar_url || ''} />
            <AvatarFallback className="text-xs">{initials || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
