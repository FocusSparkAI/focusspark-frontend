import { Menu, Moon, Sun, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function Navigation({
  currentPage,
  onNavigate,
  theme,
  onToggleTheme,
}: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: 'home' },
    { name: 'Our Science', path: 'science' },
    { name: 'About Us', path: 'about' },
    { name: 'Contact', path: 'contact' },
  ];

  const navigateAndClose = (page: string) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => navigateAndClose('home')}
            className="flex min-w-0 items-center gap-2 transition-transform hover:scale-105"
          >
            <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center glow-blue-purple">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="truncate font-bold text-xl text-foreground">FocusSpark</span>
          </button>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigateAndClose(link.path)}
                aria-current={currentPage === link.path ? 'page' : undefined}
                className={`rounded-full px-3 py-2 transition-colors ${
                  currentPage === link.path
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleTheme}
              className="rounded-full transition-all hover:scale-110"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

              <Button
              variant="ghost"
              onClick={() => navigateAndClose('signin')}
              className="hidden md:inline-flex"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigateAndClose('signup')}
              className="hidden bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition-all md:inline-flex"
            >
              Get Started
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="md:hidden rounded-full"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 px-4 py-4 shadow-lg backdrop-blur-xl">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigateAndClose(link.path)}
                aria-current={currentPage === link.path ? 'page' : undefined}
                className={`rounded-lg px-4 py-3 text-left transition-colors ${
                  currentPage === link.path
                    ? 'bg-accent text-accent-foreground ring-1 ring-blue-500/25'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
            <Button
              variant="outline"
              onClick={() => navigateAndClose('signin')}
              className="w-full"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigateAndClose('signup')}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition-all"
            >
              Get Started
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
