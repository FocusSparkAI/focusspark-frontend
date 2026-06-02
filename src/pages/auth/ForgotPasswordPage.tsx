import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, Mail, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { BACKEND_ROUTES, buildBackendUrl } from '../../config/backend';
import { getErrorMessage } from '../../utils/apiTypes';
import { makeFloatingParticles } from '../../utils/stableParticles';

interface ForgotPasswordPageProps {
  onNavigate: (page: string) => void;
}

type ResetStep = 'email' | 'otp' | 'password';

const backgroundParticles = makeFloatingParticles(15, 73);
const passwordRequirementsText = 'Use at least 8 characters, including a letter and a number';
const passwordMeetsRequirements = (password: string) =>
  password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);

export function ForgotPasswordPage({ onNavigate }: ForgotPasswordPageProps) {
  const [step, setStep] = useState<ResetStep>('email');
  const [email, setEmail] = useState('');
  const [otpArr, setOtpArr] = useState<string[]>(() => Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [error, setError] = useState('');
  const inputsRef = useRef<HTMLInputElement[]>([]);

  const normalizedEmail = email.trim().toLowerCase();
  const otp = otpArr.join('');
  const isOtpValid = otpArr.every((d) => d.length === 1 && /\d/.test(d));
  const isPasswordInvalid = newPassword.length > 0 && !passwordMeetsRequirements(newPassword);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timerId = window.setTimeout(() => setResendSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timerId);
  }, [resendSeconds]);

  const validateEmail = () => {
    if (!normalizedEmail) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(normalizedEmail)) {
      setError('Invalid email format');
      return false;
    }
    setError('');
    return true;
  };

  const setDigit = (idx: number, val: string) => {
    setOtpArr((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const handleChangeDigit = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 1);
    setDigit(idx, value);
    if (value) inputsRef.current[idx + 1]?.focus();
    if (error) setError('');
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      void handleVerifyOtp();
      return;
    }
    if (e.key === 'Backspace') {
      if (e.currentTarget.value === '') {
        if (idx > 0) {
          setDigit(idx - 1, '');
          inputsRef.current[idx - 1]?.focus();
        }
      } else {
        setDigit(idx, '');
      }
    } else if (e.key === 'ArrowLeft') {
      inputsRef.current[idx - 1]?.focus();
    } else if (e.key === 'ArrowRight') {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleOtpPaste = (idx: number, e: React.ClipboardEvent<HTMLInputElement>) => {
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
    inputsRef.current[Math.min(5, idx + chars.length - 1)]?.focus();
  };

  const requestResetOtp = async () => {
    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      await axios.post(buildBackendUrl(BACKEND_ROUTES.auth.forgotPassword), {
        email: normalizedEmail,
      });
      setEmail(normalizedEmail);
      setOtpArr(Array(6).fill(''));
      setResendSeconds(60);
      setStep('otp');
      window.setTimeout(() => inputsRef.current[0]?.focus(), 0);
      toast.success('Password reset code sent');
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Could not send reset code');
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!isOtpValid) {
      setError('Please enter the 6-digit reset code');
      const firstInvalid = otpArr.findIndex((d) => d === '' || !/\d/.test(d));
      inputsRef.current[firstInvalid >= 0 ? firstInvalid : 0]?.focus();
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await axios.post(buildBackendUrl(BACKEND_ROUTES.auth.verifyPasswordResetOtp), {
        email: normalizedEmail,
        otp,
      });
      setStep('password');
      toast.success('Code verified');
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Invalid reset code');
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!passwordMeetsRequirements(newPassword)) {
      setError(passwordRequirementsText);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await axios.post(buildBackendUrl(BACKEND_ROUTES.auth.resetPassword), {
        email: normalizedEmail,
        otp,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      toast.success('Password changed successfully. Please sign in.');
      onNavigate('signin');
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Could not change password');
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'email') void requestResetOtp();
    if (step === 'otp') void handleVerifyOtp();
    if (step === 'password') void handleResetPassword();
  };

  const goBack = () => {
    if (step === 'password') {
      setError('');
      setStep('otp');
      return;
    }
    if (step === 'otp') {
      setError('');
      setStep('email');
      return;
    }
    onNavigate('signin');
  };

  const title = step === 'email' ? 'Reset Your Password' : step === 'otp' ? 'Enter Reset Code' : 'Create New Password';
  const description =
    step === 'email'
      ? "Don't worry, it happens. Enter your account email."
      : step === 'otp'
        ? `Enter the 6-digit code sent to ${normalizedEmail}.`
        : 'Choose a new password for your account.';

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 gradient-wave relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {backgroundParticles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-blue-500/20 rounded-full"
            style={{ left: particle.left, top: particle.top }}
            animate={{ y: [0, -30, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3 + particle.duration / 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card rounded-2xl p-5 shadow-2xl sm:p-8 md:p-10">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="inline-flex items-center gap-2 mb-4"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center glow-blue-purple">
                {step === 'otp' ? <ShieldCheck className="w-7 h-7 text-white" /> : <Sparkles className="w-7 h-7 text-white" />}
              </div>
              <span className="text-2xl">FocusSpark</span>
            </motion.div>

            <h2 className="text-2xl mb-2">{title}</h2>
            <motion.p
              key={step}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground"
            >
              {description}
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 'email' && (
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="your.email@example.com"
                    className={`pl-10 bg-background/50 border-border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${
                      error ? 'border-red-500 shake' : ''
                    }`}
                  />
                </div>
              </div>
            )}

            {step === 'otp' && (
              <div>
                <Label>Reset Code</Label>
                <div className="mt-3 flex items-center justify-center gap-2 sm:gap-3">
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
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onPaste={(e) => handleOtpPaste(i, e)}
                      aria-label={`Digit ${i + 1}`}
                      className="h-11 w-10 rounded-md border border-input bg-input-background text-center text-lg font-medium focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] sm:h-12 sm:w-12"
                    />
                  ))}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="mx-auto mt-3 flex"
                  onClick={requestResetOtp}
                  disabled={isLoading || resendSeconds > 0}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : 'Resend code'}
                </Button>
              </div>
            )}

            {step === 'password' && (
              <>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="Create a strong password"
                      className={`pl-10 pr-10 bg-background/50 border-border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${
                        error || isPasswordInvalid ? 'border-red-500 shake' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className={`mt-1 text-xs ${isPasswordInvalid ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {passwordRequirementsText}
                  </p>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="Confirm your password"
                      className={`pl-10 pr-10 bg-background/50 border-border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${
                        error ? 'border-red-500 shake' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm"
              >
                {error}
              </motion.p>
            )}

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={isLoading || (step === 'otp' && !isOtpValid)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition-all py-6 glow-blue-purple relative overflow-hidden"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {step === 'email' ? 'Sending code...' : step === 'otp' ? 'Verifying...' : 'Changing password...'}
                  </>
                ) : step === 'email' ? (
                  'Send Code'
                ) : step === 'otp' ? (
                  'Verify Code'
                ) : (
                  'Update Password'
                )}
              </Button>
            </motion.div>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={goBack}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {step === 'email' ? 'Back to Sign In' : 'Back'}
            </button>
          </div>
        </div>

        <p className="text-center text-muted-foreground text-xs mt-6 opacity-60">
          © 2026 FocusSpark. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
