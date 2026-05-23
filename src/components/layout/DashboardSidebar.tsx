import { motion } from 'motion/react';
import {
  Sparkles,
  LayoutDashboard,
  Trophy,
  BarChart3,
  Bell,
  Settings,
  User,
  LogOut,
  Play,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../utils/classNames';

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate: (page: string) => void;
  currentPage?: string;
}

interface DashboardMenuItem {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  target?: string;
}

const menuItems: DashboardMenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'profile', label: 'Profile', icon: User },
];

export function DashboardSidebar({
  collapsed,
  onToggleCollapse,
  onNavigate,
  currentPage = 'dashboard',
}: DashboardSidebarProps) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="bg-card border-r border-border flex flex-col sticky top-0 h-screen"
    >
      {/* Header */}
      <div
        className={cn(
          'relative flex h-20 items-center border-b border-border px-4',
          collapsed ? 'justify-center' : 'justify-between gap-3 px-6',
        )}
      >
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 glow-blue-purple">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <span className="block truncate text-xl font-semibold leading-tight tracking-normal">FocusSpark</span>
              <span className="block truncate text-xs text-secondary">Student Workspace</span>
            </div>
          </motion.div>
        )}
        <button
          onClick={onToggleCollapse}
          className={cn(
            'flex aspect-square h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background p-0 text-secondary shadow-sm transition-colors hover:bg-accent hover:text-primary focus:outline-none focus:ring-2 focus:ring-blue-500/50',
            collapsed && 'static',
          )}
          style={{
            minWidth: 36,
            minHeight: 36,
            maxWidth: 36,
            maxHeight: 36,
            borderRadius: 9999,
            padding: 0,
          }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto" style={{ padding: 14 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.target ?? item.id)}
              className="w-full flex items-center gap-3 transition-colors group"
              style={{
                minHeight: 44,
                padding: collapsed ? '10px 12px' : '10px 14px',
                marginBottom: 6,
                borderRadius: 10,
                justifyContent: collapsed ? 'center' : 'flex-start',
                color: isActive ? 'var(--foreground)' : 'var(--secondary)',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.14), rgba(139, 92, 246, 0.14))'
                  : 'transparent',
                border: isActive ? '1px solid rgba(59, 130, 246, 0.28)' : '1px solid transparent',
              }}
              title={collapsed ? item.label : undefined}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon
                className="w-5 h-5 flex-shrink-0"
                style={{ color: isActive ? '#3b82f6' : undefined }}
              />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="truncate"
                >
                  {item.label}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Quick Start CTA */}
      <div className="border-t border-border" style={{ padding: 14 }}>
        <motion.button
          onClick={() => {
            localStorage.removeItem('auth_token');
            onNavigate('home');
          }}
          className="w-full flex items-center gap-3 hover:bg-destructive/10 transition-colors text-destructive group"
          style={{
            minHeight: 44,
            padding: collapsed ? '10px 12px' : '10px 14px',
            marginBottom: 10,
            borderRadius: 10,
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
          title={collapsed ? 'Logout' : undefined}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Logout
            </motion.span>
          )}
        </motion.button>
        <Button
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 glow-blue-purple"
          size={collapsed ? 'icon' : 'lg'}
          title={collapsed ? 'Open Extension' : undefined}
        >
          <Play className="w-5 h-5" />
          {!collapsed && <span className="ml-2">Open Extension</span>}
        </Button>
      </div>
    </motion.aside>
  );
}
