import {
  Bell,
  LayoutDashboard,
  Sun,
  Moon,
  User as UserIcon,
  Settings,
  LogOut,
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface DashboardNavbarProps {
  onNavigate?: (page: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function DashboardNavbar({ onNavigate, theme, onToggleTheme }: DashboardNavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10">
            <LayoutDashboard className="h-5 w-5 text-blue-500" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-semibold leading-tight tracking-normal">Dashboard</h2>
            <p className="truncate text-xs text-secondary">Overview</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            className="rounded-full hover:bg-accent/50"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger className="relative rounded-full p-2 transition-colors hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="space-y-2 p-2">
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-sm">New achievement unlocked: 7-day streak!</p>
                  <p className="text-xs text-secondary mt-1">2 minutes ago</p>
                </div>
                <div className="p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <p className="text-sm">Auto-summary ready for your last session</p>
                  <p className="text-xs text-secondary mt-1">15 minutes ago</p>
                </div>
                <div className="p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <p className="text-sm">Break time in 5 minutes</p>
                  <p className="text-xs text-secondary mt-1">20 minutes ago</p>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full p-1 transition-colors hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-purple-500/25">
                <UserIcon className="h-5 w-5 text-white" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onNavigate?.('profile')}>
                <UserIcon className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigate?.('settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  localStorage.removeItem('auth_token');
                  onNavigate?.('home');
                }}
              >
                <LogOut className="w-4 h-4 mr-2 text-destructive" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
