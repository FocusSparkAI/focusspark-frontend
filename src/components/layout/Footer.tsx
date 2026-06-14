import { motion } from 'motion/react';
import {
  Linkedin,
  Sparkles,
  Twitter,
  Youtube,
} from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const footerLinks = [
    { name: 'Home', path: 'home' },
    { name: 'Our Science', path: 'science' },
    { name: 'About Us', path: 'about' },
    { name: 'Contact', path: 'contact' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', path: 'privacy' },
    { name: 'Terms of Service', path: 'terms' },
  ];

  const socialLinks = [
    { icon: Linkedin, label: 'LinkedIn' },
    { icon: Twitter, label: 'Twitter' },
    { icon: Youtube, label: 'YouTube' },
  ];

  return (
    <footer className="relative overflow-hidden bg-card border-t border-border">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30" />

      <div className="mx-auto max-w-6xl px-5 pb-0 pt-8 sm:px-6 lg:px-12 xl:px-16">
        <div
          className="grid items-start gap-14"
          style={{ gridTemplateColumns: '1.35fr 1fr 1fr 1fr' }}
        >
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Sparkles aria-hidden="true" className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-2xl text-foreground">FocusSpark</span>
            </div>

            <p className="max-w-xs text-sm leading-6 text-muted-foreground">
              Public web app for focused studying, AI-assisted progress, goals,
              analytics, and account tools.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-foreground">Explore</h4>
            <div className="flex flex-col gap-3">
              {footerLinks.map((link) => (
                <button
                  key={link.path}
                  type="button"
                  onClick={() => onNavigate(link.path)}
                  className="w-fit text-left text-sm leading-5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-foreground">Legal</h4>
            <div className="flex flex-col gap-3">
              {legalLinks.map((link) => (
                <button
                  key={link.path}
                  type="button"
                  onClick={() => onNavigate(link.path)}
                  className="w-fit text-left text-sm leading-5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-foreground">Social</h4>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.button
                    key={social.label}
                    type="button"
                    aria-label={social.label}
                    className="inline-flex shrink-0 items-center justify-center border border-border bg-background p-0 text-muted-foreground transition-colors hover:border-blue-500 hover:text-foreground"
                    style={{
                      width: 40,
                      height: 40,
                      minWidth: 40,
                      minHeight: 40,
                      borderRadius: 9999,
                    }}
                    whileHover={{ y: -2, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon aria-hidden="true" className="h-4 w-4" />
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex min-h-6 items-center justify-center border-t border-border py-4 text-center text-sm text-muted-foreground">
          &copy; 2026 FocusSpark. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
