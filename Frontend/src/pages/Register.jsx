import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Register() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });
  const navigate = useNavigate();
  const setToken = useAuthStore(state => state.setToken);
  const [serverError, setServerError] = React.useState('');

  const onSubmit = async (data) => {
    try {
      setServerError('');
      const response = await registerApi(data);
      setToken(response.token);
      navigate('/dashboard');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full space-y-8 bg-surface p-8 rounded-xl border border-zinc-800 shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-display font-bold text-white">Join ResFlow</h2>
          <p className="mt-2 text-sm text-zinc-400">Weaponize your career trajectory</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {serverError && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded">
              {serverError}
            </div>
          )}
          
          <div className="space-y-4 text-sm font-mono">
            <div>
              <label className="block text-zinc-300 mb-2">Full Name</label>
              <input
                {...register('name')}
                className="w-full bg-background border border-zinc-700 rounded-md py-2 px-3 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
                placeholder="Ada Lovelace"
              />
              {errors.name && <p className="text-red-400 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-zinc-300 mb-2">Email Address</label>
              <input
                {...register('email')}
                className="w-full bg-background border border-zinc-700 rounded-md py-2 px-3 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
                placeholder="ada@orbit.com"
              />
              {errors.email && <p className="text-red-400 mt-1">{errors.email.message}</p>}
            </div>
            
            <div>
              <label className="block text-zinc-300 mb-2">Password</label>
              <input
                type="password"
                {...register('password')}
                className="w-full bg-background border border-zinc-700 rounded-md py-2 px-3 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-400 mt-1">{errors.password.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-background bg-accent hover:bg-accent/90 focus:outline-none disabled:opacity-50 transition"
          >
            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <p className="text-center text-sm text-zinc-400">
          Already have an account? <Link to="/login" className="text-accent hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
