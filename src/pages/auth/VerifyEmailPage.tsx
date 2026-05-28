import { MailCheck, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../../components/ui/button';

interface VerifyEmailPageProps {
  onNavigate: (page: string) => void;
  onContinue?: () => void;
}

export function VerifyEmailPage({ onNavigate, onContinue }: VerifyEmailPageProps) {
  return (
    <div className="min-h-screen w-full bg-background px-4 py-10 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full rounded-2xl border border-border bg-card p-8 text-center shadow-xl"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/20">
            <MailCheck className="h-8 w-8" />
          </div>

          <h1 className="gradient-text mb-3">Verify your email</h1>
          <p className="mx-auto mb-8 max-w-md text-secondary">
            We will add the verification code here soon. For now, this page confirms the signup verification step exists.
          </p>

          <Button className="w-full" size="lg" onClick={onContinue}>
            <Sparkles className="mr-2 h-4 w-4" />
            Continue
          </Button>

          <button
            type="button"
            onClick={() => onNavigate('signin')}
            className="mt-5 text-sm font-medium text-secondary transition-colors hover:text-foreground"
          >
            Back to sign in
          </button>
        </motion.div>
      </div>
    </div>
  );
}
