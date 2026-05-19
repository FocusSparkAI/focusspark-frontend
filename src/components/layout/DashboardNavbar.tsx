import {
  Bell,
  LayoutDashboard,
  Sun,
  Moon,
  User as UserIcon,
  Settings,
  LogOut,
  CircleUserRound,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
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
    <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl leading-tight">Dashboard</h2>
            <p className="text-xs text-secondary">Overview</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            className="rounded-full hover:bg-accent/50"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full relative hover:bg-accent/50 p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
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
            <DropdownMenuTrigger className="flex h-12 w-12 items-center justify-center rounded-full hover:bg-accent/50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-background">
              <Avatar
                className="shrink-0 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600"
                style={{ width: 40, height: 40, borderRadius: '9999px' }}
              >
                <AvatarFallback
                  className="flex items-center justify-center bg-transparent text-white"
                  style={{ width: '100%', height: '100%', borderRadius: '9999px' }}
                >
                  <CircleUserRound style={{ width: 22, height: 22 }} />
                </AvatarFallback>
              </Avatar>
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
