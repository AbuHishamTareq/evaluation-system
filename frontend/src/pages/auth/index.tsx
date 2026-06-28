import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../layouts/AuthLayout';
import { Input } from '../../components/ui/forms/Input';
import { Button } from '../../components/ui/buttons/Button';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../../components/ui/toast';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const clearError = useAuthStore((s) => s.clearError);
  const forgotPassword = useAuthStore((s) => s.forgotPassword);
  const forgotPasswordSuccess = useAuthStore((s) => s.forgotPasswordSuccess);
  const forgotPasswordError = useAuthStore((s) => s.forgotPasswordError);
  const resetForgotPasswordState = useAuthStore((s) => s.resetForgotPasswordState);
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordValidation, setForgotPasswordValidation] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      const success = await login(formData.email, formData.password, formData.rememberMe);
      if (success) {
        addToast('Login successful! Welcome back.', 'success');
        navigate('/dashboard');
      } else {
        addToast(useAuthStore.getState().error || 'Login failed', 'error');
      }
    } catch (err) {
      addToast('An error occurred. Please try again.', 'error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear validation error when user starts typing
    if (name === 'email' && validationErrors.email) {
      setValidationErrors((prev) => ({ ...prev, email: undefined }));
    }
    if (name === 'password' && validationErrors.password) {
      setValidationErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordValidation(null);

    if (!forgotPasswordEmail.trim()) {
      setForgotPasswordValidation('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotPasswordEmail)) {
      setForgotPasswordValidation('Please enter a valid email address');
      return;
    }

    const success = await forgotPassword(forgotPasswordEmail);
    if (success) {
      addToast('Password reset link sent to your email.', 'success');
    } else {
      addToast(forgotPasswordError || 'Failed to send reset link', 'error');
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setForgotPasswordEmail('');
    setForgotPasswordValidation(null);
    resetForgotPasswordState();
  };

  // Show forgot password form
  if (showForgotPassword) {
    return (
      <AuthLayout
        title="Reset Password"
        subtitle="Enter your email to receive reset instructions"
      >
        {/* Success Message */}
        {forgotPasswordSuccess && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-100 mb-6">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-700">Reset Link Sent</p>
              <p className="text-sm text-green-600">Check your email for reset instructions</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {(forgotPasswordError || forgotPasswordValidation) && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-100 mb-6">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-700">Reset Failed</p>
              <p className="text-sm text-red-600">{forgotPasswordError || forgotPasswordValidation}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleForgotPasswordSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="forgotEmail" className="block text-sm font-semibold text-slate-700">
              Email Address
            </label>
            <Input
              id="forgotEmail"
              name="forgotEmail"
              type="email"
              placeholder="Enter your email"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
              error={forgotPasswordValidation || undefined}
              autoComplete="email"
              leftIcon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
              className="bg-white/80 backdrop-blur-sm border-slate-200/80 focus:bg-white focus:border-cyan-500 focus:ring-cyan-500 transition-all duration-200"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="gradient"
            gradient="from-cyan-500 to-teal-500"
            className="w-full py-3.5 text-base font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all duration-300"
          >
            Send Reset Link
          </Button>

          {/* Back to Login */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleBackToLogin}
              className="text-sm font-medium text-cyan-600 hover:text-cyan-700 transition-colors hover:underline"
            >
              Back to Login
            </button>
          </div>
        </form>
      </AuthLayout>
    );
  }

  // Login form
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue to PHC Evaluation System"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
            Email Address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            error={validationErrors.email}
            autoComplete="email"
            leftIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            }
            className="bg-white/80 backdrop-blur-sm border-slate-200/80 focus:bg-white focus:border-cyan-500 focus:ring-cyan-500 transition-all duration-200"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            error={validationErrors.password}
            autoComplete="current-password"
            leftIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-cyan-600 transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            }
            className="bg-white/80 backdrop-blur-sm border-slate-200/80 focus:bg-white focus:border-cyan-500 focus:ring-cyan-500 transition-all duration-200"
          />
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-5 h-5 border-2 border-slate-300 rounded-md peer-checked:bg-cyan-500 peer-checked:border-cyan-500 transition-all duration-200 group-hover:border-cyan-400">
                {formData.rememberMe && (
                  <svg className="w-full h-full text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-slate-600 group-hover:text-slate-700 transition-colors">Remember me</span>
          </label>
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-sm font-medium text-cyan-600 hover:text-cyan-700 transition-colors hover:underline"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="gradient"
          gradient="from-cyan-500 to-teal-500"
          className="w-full py-3.5 text-base font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all duration-300"
        >
          Sign In
        </Button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;