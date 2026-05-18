import { Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
  isSpecialPage?: boolean;
}

export function ThemeToggle({ theme, onToggle, isSpecialPage = false }: ThemeToggleProps) {
  return (
    <motion.button
      onClick={onToggle}
      className={`fixed ${isSpecialPage ? 'top-20 right-4' : 'top-4 right-4'} z-50 w-12 h-12 rounded-full bg-card border border-border shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-300 cursor-pointer group`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {/* Sun Icon (visible in dark mode) */}
      <motion.div
        initial={false}
        animate={{
          scale: theme === 'dark' ? 1 : 0,
          rotate: theme === 'dark' ? 0 : 180,
          opacity: theme === 'dark' ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="absolute"
      >
        <Sun className="w-5 h-5 text-yellow-400" />
      </motion.div>

      {/* Moon Icon (visible in light mode) */}
      <motion.div
        initial={false}
        animate={{
          scale: theme === 'light' ? 1 : 0,
          rotate: theme === 'light' ? 0 : -180,
          opacity: theme === 'light' ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="absolute"
      >
        <Moon className="w-5 h-5 text-indigo-600" />
      </motion.div>

      {/* Glow Effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow:
            theme === 'dark'
              ? '0 0 20px rgba(250, 204, 21, 0.3)'
              : '0 0 20px rgba(99, 102, 241, 0.3)',
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
}
