import { useState, type CSSProperties } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Mail, Lock, Eye, EyeOff, User, GraduationCap, Loader2, PartyPopper, Rocket } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { toast } from 'sonner';
import axios from 'axios';
import { BACKEND_ROUTES, buildBackendUrl } from '../../config/backend';
import { getErrorMessage } from '../../utils/apiTypes';
import { makeFloatingParticles } from '../../utils/stableParticles';
import { getDeviceTimeZone, setUserTimeZone } from '../../utils/timezone';

interface SignUpPageProps {
  onNavigate: (page: string) => void;
}

const academicFocusOptions = [
  'Computer Science',
  'Medicine',
  'Engineering',
  'Business',
  'Law',
  'Psychology',
  'Biology',
  'Mathematics',
  'Physics',
  'Other',
];

const backgroundParticles = makeFloatingParticles(25, 31);
const confettiParticles = makeFloatingParticles(50, 47);
const emailPattern = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
const passwordMeetsRequirements = (password: string) =>
  password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
const passwordRequirementsText = 'Use at least 8 characters, including a letter and a number';
const authZoomStyle: CSSProperties & { zoom: number } = { zoom: 0.9 };

const isValidEmail = (email: string) => {
  const normalizedEmail = email.trim();
  if (!emailPattern.test(normalizedEmail)) return false;

  const [localPart, domain] = normalizedEmail.split('@');
  return Boolean(
    localPart &&
    domain &&
    !localPart.startsWith('.') &&
    !localPart.endsWith('.') &&
    !domain.startsWith('.') &&
    !domain.endsWith('.') &&
    !domain.includes('..'),
  );
};

export function SignUpPage({ onNavigate }: SignUpPageProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    academicFocus: '',
    agreedToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfetti, setShowConfetti] = useState(false);
  const isCreateAccountDisabled = isLoading || !formData.agreedToTerms;
  const hasStartedPassword = formData.password.length > 0;
  const isPasswordInvalid = hasStartedPassword && !passwordMeetsRequirements(formData.password);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordMeetsRequirements(formData.password)) {
      newErrors.password = passwordRequirementsText;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.academicFocus) {
      newErrors.academicFocus = 'Please select your academic focus';
    }

    if (!formData.agreedToTerms) {
      newErrors.agreedToTerms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const url = buildBackendUrl(BACKEND_ROUTES.auth.signup);
      const payload = {
        full_name: formData.fullName,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirm_password: formData.confirmPassword,
        academic_focus: formData.academicFocus,
        accepted_terms: formData.agreedToTerms,
        timezone: getDeviceTimeZone(),
      };

      const resp = await axios.post(url, payload);

      localStorage.removeItem('auth_token');
      sessionStorage.setItem('pending_signup_email', resp?.data?.email || payload.email);
      setUserTimeZone(payload.timezone);

      setShowConfetti(true);
      toast.success('Verification code sent!', {
        icon: <PartyPopper className="w-4 h-4" />,
      });

      setTimeout(() => {
        onNavigate('verify-email');
      }, 1200);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Signup failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    toast.info('Google Sign Up coming soon!');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 sm:px-6 py-10 sm:py-12 bg-background relative overflow-x-hidden">
      {/* Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {backgroundParticles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-purple-500/20 rounded-full"
            style={{
              left: particle.left,
              top: particle.top,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, particle.smallX, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 4 + particle.duration / 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {confettiParticles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 confetti"
              style={{
                left: particle.left,
                top: '-10%',
                backgroundColor: particle.color,
                animationDelay: particle.delay,
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm relative z-10 mx-auto mt-6"
        style={authZoomStyle}
      >
        <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-lg w-full">
          {/* Header */}
          <div className="text-center mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="inline-flex items-center gap-2 mb-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg">FocusSpark</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-muted-foreground"
            >
              You're one step away from smarter learning.
              <span className="flex items-center justify-center gap-2 mt-1">
                Let's personalize your FocusSpark journey
                <Rocket className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              </span>
            </motion.p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value });
                    setErrors({ ...errors, fullName: '' });
                  }}
                  placeholder="John Doe"
                  className={`pl-10 bg-input-background border-border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.fullName ? 'border-red-500 shake' : ''
                    }`}
                />
              </div>
              {errors.fullName && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-1"
                >
                  {errors.fullName}
                </motion.p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setErrors({ ...errors, email: '' });
                  }}
                  placeholder="your.email@example.com"
                  className={`pl-10 bg-input-background border-border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.email ? 'border-red-500 shake' : ''
                    }`}
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-1"
                >
                  {errors.email}
                </motion.p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    setErrors({ ...errors, password: '' });
                  }}
                  placeholder="Create a strong password"
                  aria-invalid={Boolean(errors.password) || isPasswordInvalid}
                  aria-describedby="password-requirements"
                  className={`pl-10 pr-10 bg-input-background border-border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.password || isPasswordInvalid ? 'border-red-500 shake' : ''
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p
                id="password-requirements"
                className={`text-xs leading-relaxed transition-colors ${
                  errors.password || isPasswordInvalid ? 'text-red-500' : 'text-muted-foreground'
                }`}
              >
                {passwordRequirementsText}
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                    setErrors({ ...errors, confirmPassword: '' });
                  }}
                  placeholder="Confirm your password"
                  className={`pl-10 pr-10 bg-input-background border-border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.confirmPassword ? 'border-red-500 shake' : ''
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-1"
                >
                  {errors.confirmPassword}
                </motion.p>
              )}
            </div>

            {/* Academic Focus */}
            <div className="space-y-2">
              <Label htmlFor="academicFocus">Academic Focus</Label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                <Select
                  value={formData.academicFocus}
                  onValueChange={(value) => {
                    setFormData({ ...formData, academicFocus: value });
                    setErrors({ ...errors, academicFocus: '' });
                  }}
                >
                  <SelectTrigger
                    className={`pl-10 bg-input-background border-border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${errors.academicFocus ? 'border-red-500 shake' : ''
                      }`}
                  >
                    <SelectValue placeholder="Select your field" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicFocusOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.academicFocus && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-1"
                >
                  {errors.academicFocus}
                </motion.p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={formData.agreedToTerms}
                  onCheckedChange={(checked) => {
                    setFormData({ ...formData, agreedToTerms: checked as boolean });
                    setErrors({ ...errors, agreedToTerms: '' });
                  }}
                  className={`mt-0.5 border-border bg-input-background dark:bg-input/30 ${errors.agreedToTerms ? 'border-red-500' : ''
                    }`}
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground leading-snug cursor-pointer">
                  I agree to the{' '}
                  <a
                    href="/privacy"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('privacy');
                    }}
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    privacy policy
                  </a>{' '}
                  and{' '}
                  <a
                    href="/terms"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('terms');
                    }}
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    terms
                  </a>
                  .
                </label>
              </div>
              {errors.agreedToTerms && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm"
                >
                  {errors.agreedToTerms}
                </motion.p>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-2">
              {/* Create Account Button */}
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  type="submit"
                  disabled={isCreateAccountDisabled}
                  className="w-full h-10 bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition-all disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </motion.div>

              {/* Divider */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                <span className="whitespace-nowrap leading-none">Or continue with</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Google Sign Up */}
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  type="button"
                  onClick={handleGoogleSignUp}
                  variant="outline"
                  className="w-full h-10 bg-white text-black hover:bg-gray-100 border-2 dark:bg-white dark:text-black dark:hover:bg-gray-100"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign up with Google
                </Button>
              </motion.div>
            </div>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 pt-4 border-t border-border text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <button
              onClick={() => onNavigate('signin')}
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Sign in
            </button>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-3 mb-6">
          <button
            onClick={() => onNavigate('home')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </button>
        </div>
        
      </motion.div>
    </div>
  );
}
