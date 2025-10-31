import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';

const signupSchema = z
  .object({
    username: z.string().min(4, 'Username must be at least 4 characters long'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long')
      .refine((val) => /[A-Z]/.test(val), 'Password must contain at least one uppercase letter')
      .refine((val) => /[a-z]/.test(val), 'Password must contain at least one lowercase letter')
      .refine((val) => /\d/.test(val), 'Password must contain at least one number')
      .refine(
        (val) => /[@$!%*?&]/.test(val),
        'Password must contain at least one special character (@$!%*?&)'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

const SignupForm: React.FC = () => {
  const [backendError, setBackendError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });
  
  const navigate = useNavigate();
  const password = watch('password', '');

  // Calculate password strength
  React.useEffect(() => {
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[@$!%*?&]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  }, [password]);

  const getStrengthColor = (strength: number) => {
    if (strength <= 25) return 'bg-red-500';
    if (strength <= 50) return 'bg-orange-500';
    if (strength <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const onSubmit = async (data: SignupFormData) => {
    setBackendError('');
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        navigate("/login");
      } else {
        setBackendError(result.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setBackendError('Something went wrong. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-8 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🚀</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Join SlotSwapper</h1>
            <p className="text-cyan-100 mt-2">Create your account and start managing your schedule</p>
          </div>

          {/* Form */}
          <div className="p-8">
            {backendError && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-center backdrop-blur-sm">
                {backendError}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Username Field */}
              <div className="group">
                <label htmlFor="username" className="block text-cyan-300 font-semibold mb-3 text-lg">
                  Full Name
                </label>
                <input
                  type="text"
                  {...register('username')}
                  id="username"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 group-hover:bg-white/10"
                  placeholder="Enter your full name"
                />
                {errors.username && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="group">
                <label htmlFor="email" className="block text-cyan-300 font-semibold mb-3 text-lg">
                  Email Address
                </label>
                <input
                  type="email"
                  {...register('email')}
                  id="email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 group-hover:bg-white/10"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="group">
                <label htmlFor="password" className="block text-cyan-300 font-semibold mb-3 text-lg">
                  Password
                </label>
                <input
                  type="password"
                  {...register('password')}
                  id="password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 group-hover:bg-white/10"
                  placeholder="Create a strong password"
                />
                
                {/* Password Strength Meter */}
                {password && (
                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Password strength</span>
                      <span>{passwordStrength}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${getStrengthColor(passwordStrength)}`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {errors.password && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="group">
                <label htmlFor="confirmPassword" className="block text-cyan-300 font-semibold mb-3 text-lg">
                  Confirm Password
                </label>
                <input
                  type="password"
                  {...register('confirmPassword')}
                  id="confirmPassword"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 group-hover:bg-white/10"
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                  isLoading 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-2xl shadow-cyan-500/25'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Create Account
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-cyan-300 hover:text-cyan-200 font-semibold transition-colors duration-300 hover:underline"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          {[
            { icon: '🔄', text: 'Easy Slot Swapping' },
            { icon: '📊', text: 'Smart Scheduling' },
            { icon: '⚡', text: 'Real-time Updates' }
          ].map((feature, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <div className="text-2xl mb-2">{feature.icon}</div>
              <div className="text-gray-300 text-sm">{feature.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
