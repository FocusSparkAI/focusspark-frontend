import { ArrowLeft, Loader2, MailCheck, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../../components/ui/button';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { BACKEND_ROUTES, buildBackendUrl } from '../../config/backend';
import { getErrorMessage } from '../../utils/apiTypes';

interface VerifyEmailPageProps {
  onNavigate: (page: string) => void;
  onContinue?: () => void;
}

export function VerifyEmailPage({ onNavigate, onContinue }: VerifyEmailPageProps) {
  const [otpArr, setOtpArr] = useState<string[]>(() => Array(6).fill(''));
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(60);
  const [hasVerified, setHasVerified] = useState(false);
  const pendingEmail = sessionStorage.getItem('pending_signup_email') || '';
  const inputsRef = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    if (!pendingEmail && !hasVerified) {
      toast.error('Please sign up first to verify your email');
      onNavigate('signup');
      return;
    }
    inputsRef.current[0]?.focus();
  }, [hasVerified, onNavigate, pendingEmail]);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timerId = window.setTimeout(() => setResendSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timerId);
  }, [resendSeconds]);

  const isValid = otpArr.every((d) => d.length === 1 && /\d/.test(d));

  const setDigit = (idx: number, val: string) => {
    setOtpArr((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const handleChangeDigit = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 1);
    setDigit(idx, v);
    if (v) {
      const next = inputsRef.current[idx + 1];
      next?.focus();
    }
    if (error) setError('');
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key;
    const target = e.currentTarget as HTMLInputElement;
    if (key === 'Enter') {
      handleContinue();
      return;
    }
    if (key === 'Backspace') {
      if (target.value === '') {
        const prev = inputsRef.current[idx - 1];
        if (prev) {
          setDigit(idx - 1, '');
          prev.focus();
        }
      } else {
        setDigit(idx, '');
      }
    } else if (key === 'ArrowLeft') {
      inputsRef.current[idx - 1]?.focus();
    } else if (key === 'ArrowRight') {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (idx: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!paste) return;
    const chars = paste.split('').slice(0, 6 - idx);
    setOtpArr((prev) => {
      const next = [...prev];
      for (let i = 0; i < chars.length; i++) {
        next[idx + i] = chars[i];
      }
      return next;
    });
    const focusIdx = Math.min(6, idx + chars.length) - 1;
    inputsRef.current[focusIdx]?.focus();
  };

  const handleContinue = async () => {
    if (!isValid) {
      setError('Please enter the 6-digit verification code');
      const firstInvalid = otpArr.findIndex((d) => d === '' || !/\d/.test(d));
      inputsRef.current[firstInvalid >= 0 ? firstInvalid : 0]?.focus();
      return;
    }
    if (!pendingEmail) return;

    setIsLoading(true);
    setError('');
    try {
      const url = buildBackendUrl(BACKEND_ROUTES.auth.verifyEmail);
      const resp = await axios.post(url, {
        email: pendingEmail,
        otp: otpArr.join(''),
      });
      const token = resp?.data?.access_token || resp?.data?.token;
      if (token) {
        localStorage.setItem('auth_token', token);
      }
      setHasVerified(true);
      sessionStorage.removeItem('pending_signup_email');
      toast.success('Email verified. Welcome to FocusSpark!');
      onContinue?.();
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Verification failed');
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!pendingEmail) return;

    setIsResending(true);
    setError('');
    try {
      await axios.post(buildBackendUrl(BACKEND_ROUTES.auth.resendVerificationOtp), {
        email: pendingEmail,
      });
      setOtpArr(Array(6).fill(''));
      setResendSeconds(60);
      inputsRef.current[0]?.focus();
      toast.success('A new verification code was sent');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Could not resend code'));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center bg-background px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full rounded-2xl border border-border bg-card px-5 pb-8 pt-8 text-center shadow-xl sm:px-8 sm:pb-10 sm:pt-10"
        >
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/20"
            role="img"
            aria-hidden="true"
          >
            <MailCheck className="h-8 w-8" />
          </div>

          <h1 className="gradient-text mb-3 text-3xl font-semibold leading-tight">Verify your email</h1>
          <p className="mx-auto mb-5 max-w-md text-sm leading-relaxed text-secondary sm:text-base">
            Enter the 6-digit verification code sent to {pendingEmail || 'your email'}.
          </p>

          <div className="mx-auto mb-6 w-full max-w-sm">
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    if (el) inputsRef.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={otpArr[i]}
                  onChange={(e) => handleChangeDigit(i, e)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={(e) => handlePaste(i, e)}
                  aria-label={`Digit ${i + 1}`}
                  className="h-11 w-10 rounded-md border border-input bg-input-background text-center text-lg font-medium focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] sm:h-12 sm:w-12"
                />
              ))}
            </div>
            <p id="otp-error" className={`mt-2 text-sm ${error ? 'text-destructive' : 'text-secondary'}`}>
              {error || 'We sent a 6-digit code to your email.'}
            </p>
          </div>

          <Button className="mx-auto w-full max-w-xs" size="lg" onClick={handleContinue} disabled={!isValid || !onContinue || isLoading} aria-disabled={!isValid || !onContinue || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span className="text-base font-semibold">Verifying...</span>
              </>
            ) : (
              <span className="text-base font-semibold">Verify</span>
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="mx-auto mb-5 mt-6 w-full max-w-xs"
            onClick={handleResend}
            disabled={isResending || !pendingEmail || resendSeconds > 0}
          >
            {isResending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            {resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : 'Resend code'}
          </Button>
        </motion.div>
        <Button
          type="button"
          variant="ghost"
          className="mt-8 w-full max-w-xs text-secondary"
          onClick={() => {
            sessionStorage.removeItem('pending_signup_email');
            onNavigate('signup');
          }}
          disabled={isLoading || isResending}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to signup
        </Button>
      </div>
    </div>
  );
}
