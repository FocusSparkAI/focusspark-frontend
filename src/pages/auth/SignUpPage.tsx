import { useState } from 'react';
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

interface SignUpPageProps {
  onNavigate: (page: string) => void;
  onAuthSuccess?: (isNew?: boolean) => void;
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

export function SignUpPage({ onNavigate, onAuthSuccess }: SignUpPageProps) {
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
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
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        academic_focus: formData.academicFocus,
        accepted_terms: formData.agreedToTerms,
      };

      const resp = await axios.post(url, payload);

      // If backend returns an access token, store it
      const token = resp?.data?.access_token || resp?.data?.token;
      if (token) {
        localStorage.setItem('auth_token', token);
      }

      setShowConfetti(true);
      toast.success('Account created successfully!', {
        icon: <PartyPopper className="w-4 h-4" />,
      });

      setTimeout(() => {
        onAuthSuccess?.(true);
      }, 1200);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Signup failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    toast.info('Google Sign Up coming soon!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 bg-background relative overflow-hidden">
      {/* Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-500/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10%',
                backgroundColor: ['#3b82f6', '#8b5cf6', '#14b8a6', '#f59e0b'][
                  Math.floor(Math.random() * 4)
                ],
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Glass Card */}
        <div className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="inline-flex items-center gap-2 mb-4"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center glow-blue-purple">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl">FocusSpark</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-base"
            >
              You're one step away from smarter learning.
              <br />
              <span className="flex items-center justify-center gap-2 mt-2">
                Let's personalize your FocusSpark journey
                <Rocket className="w-5 h-5 text-blue-400" />
              </span>
            </motion.p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative mt-2">
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
                  className={`pl-10 bg-input-background border-border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${
                    errors.fullName ? 'border-red-500 shake' : ''
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
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-2">
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
                  className={`pl-10 bg-input-background border-border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${
                    errors.email ? 'border-red-500 shake' : ''
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
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-2">
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
                  className={`pl-10 pr-10 bg-input-background border-border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${
                    errors.password ? 'border-red-500 shake' : ''
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
              <p className="text-xs text-muted-foreground mt-1">
                Use at least 8 characters with one number
              </p>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-1"
                >
                  {errors.password}
                </motion.p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative mt-2">
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
                  className={`pl-10 pr-10 bg-input-background border-border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${
                    errors.confirmPassword ? 'border-red-500 shake' : ''
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
            <div>
              <Label htmlFor="academicFocus">Academic Focus</Label>
              <div className="relative mt-2">
                <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                <Select
                  value={formData.academicFocus}
                  onValueChange={(value) => {
                    setFormData({ ...formData, academicFocus: value });
                    setErrors({ ...errors, academicFocus: '' });
                  }}
                >
                  <SelectTrigger
                    className={`pl-10 bg-input-background border-border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
                      errors.academicFocus ? 'border-red-500 shake' : ''
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
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={formData.agreedToTerms}
                onCheckedChange={(checked) => {
                  setFormData({ ...formData, agreedToTerms: checked as boolean });
                  setErrors({ ...errors, agreedToTerms: '' });
                }}
                className={errors.agreedToTerms ? 'border-red-500' : ''}
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                I agree to the{' '}
                <a href="#" className="text-blue-400 hover:text-blue-300">
                  privacy policy
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-400 hover:text-blue-300">
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

            {/* Create Account Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={isCreateAccountDisabled}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition-all py-6 glow-blue-purple mt-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:opacity-50"
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
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground">or</span>
              </div>
            </div>

            {/* Google Sign Up */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="button"
                onClick={handleGoogleSignUp}
                variant="outline"
                className="w-full bg-white text-black hover:bg-gray-100 border-2 py-6"
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
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <button
              onClick={() => onNavigate('signin')}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Sign in
            </button>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <button
            onClick={() => onNavigate('home')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-muted-foreground text-xs mt-6 opacity-60">
          © 2025 FocusSpark. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
