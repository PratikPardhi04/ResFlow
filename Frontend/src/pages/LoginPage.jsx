import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Rocket, Mail, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import LoadingSpinner from '../components/LoadingSpinner';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const from = location.state?.from?.pathname || '/';

  const onSubmit = async (data) => {
    const success = await login(data.email, data.password);
    if (success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex bg-dark">
      {/* Left side - Branding */}
      <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden bg-dark-100">
        <div className="absolute inset-0 bg-gradient-mesh opacity-40 mix-blend-screen pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex flex-col items-center text-center"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-500 to-violet-500 shadow-glow-cyan flex items-center justify-center mb-8">
            <Rocket className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-black text-white mb-6 tracking-tight">
            Elevate Your <span className="text-gradient">Career</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-md leading-relaxed">
            AI-powered resume optimization, precise job matching, and intelligent career coaching.
          </p>
        </motion.div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">ResFlow</span>
          </div>

          <div className="glass-panel p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-gray-400">Sign in to continue your journey</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start gap-3">
                <span>{error}</span>
                <button onClick={clearError} className="ml-auto hover:text-rose-300">×</button>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    {...register('email', { required: 'Email is required' })}
                    className="input-dark pl-11"
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-sm text-rose-400">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="password"
                    {...register('password', { required: 'Password is required' })}
                    className="input-dark pl-11"
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="mt-1.5 text-sm text-rose-400">{errors.password.message}</p>}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary flex items-center justify-center gap-2 group"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default LoginPage;
