import { MailCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../../components/ui/button';
import { useEffect, useRef, useState } from 'react';

interface VerifyEmailPageProps {
  onNavigate: (page: string) => void;
  onContinue?: () => void;
}

export function VerifyEmailPage({ onContinue }: VerifyEmailPageProps) {
  const [otpArr, setOtpArr] = useState<string[]>(() => Array(6).fill(''));
  const [error, setError] = useState('');
  const inputsRef = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

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

  const handleContinue = () => {
    if (!isValid) {
      setError('Please enter the 6-digit verification code');
      const firstInvalid = otpArr.findIndex((d) => d === '' || !/\d/.test(d));
      inputsRef.current[firstInvalid >= 0 ? firstInvalid : 0]?.focus();
      return;
    }
    onContinue?.();
  };

  return (
    <div className="min-h-screen w-full bg-background px-4 py-10 sm:px-6 flex items-center">
      <div className="mx-auto flex w-full max-w-xl items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full rounded-2xl border border-border bg-card p-8 text-center shadow-xl"
        >
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/20"
            role="img"
            aria-hidden="true"
          >
            <MailCheck className="h-8 w-8" />
          </div>

          <h1 className="gradient-text mb-3">Verify your email</h1>
          <p className="mx-auto mb-4 max-w-md text-secondary">
            Enter the 6-digit verification code sent to your email.
          </p>

          <div className="mx-auto mb-6 w-full max-w-sm">
            <div className="flex items-center justify-center gap-2">
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
                  className="h-12 w-12 rounded-md border border-input bg-input-background text-center text-lg font-medium focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                />
              ))}
            </div>
            <p id="otp-error" className={`mt-2 text-sm ${error ? 'text-destructive' : 'text-secondary'}`}>
              {error || 'We sent a 6-digit code to your email.'}
            </p>
          </div>

          <Button className="mx-auto w-full max-w-xs" size="lg" onClick={handleContinue} disabled={!isValid || !onContinue} aria-disabled={!isValid || !onContinue}>
            <span className="text-base font-semibold">Verify</span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
