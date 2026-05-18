import { Search, Bell, Sun, Moon, User as UserIcon, Settings, LogOut, CircleUserRound } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface DashboardNavbarProps {
  onNavigate?: (page: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function DashboardNavbar({ onNavigate, theme, onToggleTheme }: DashboardNavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
            <Input
              type="search"
              placeholder="Search notes, goals, sessions..."
              className="pl-10 bg-input-background border-border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
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
            <DropdownMenuTrigger className="rounded-full p-1 hover:bg-accent/50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50">
              <Avatar className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600">
                <AvatarFallback className="bg-transparent text-white">
                  <CircleUserRound className="w-5 h-5" />
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
