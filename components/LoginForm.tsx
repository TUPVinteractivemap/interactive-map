'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { LoginFormData, loginSchema } from '@/lib/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Image from 'next/image';

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginFormData) {
    try {
      setIsLoading(true);
      console.log('Attempting to sign in with:', data.email);
      await signIn(data);
      console.log('Sign in successful');
      toast.success('Successfully signed in');
      router.push('/map');
    } catch (error: unknown) {
      console.error('Sign in error:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An error occurred during sign in';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      setIsGoogleLoading(true);
      await signInWithGoogle();
      toast.success('Successfully signed in with Google');
      router.push('/map');
    } catch (error: unknown) {
      console.error('Google sign in error:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An error occurred during Google sign in';
      toast.error(errorMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-center mb-2">
        Welcome Back!
      </h1>

      <p className="text-gray-200 text-center mb-8 text-base">
        Sign in to continue exploring TUPV campus
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            {...form.register('email')}
            type="email"
            id="email"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            placeholder="Enter your email address"
            disabled={isLoading}
          />
          {form.formState.errors.email && (
            <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            {...form.register('password')}
            type="password"
            id="password"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            placeholder="Enter your password"
            disabled={isLoading}
          />
          {form.formState.errors.password && (
            <p className="text-red-500 text-sm">{form.formState.errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              className="w-4 h-4 rounded border-white/20 bg-white/10 text-red-500 focus:ring-red-500 focus:ring-offset-0"
            />
            <label htmlFor="remember" className="ml-2 text-white">
              Remember me
            </label>
          </div>
          <Link href="/forgot-password" className="text-red-400 hover:text-red-300">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading || isGoogleLoading}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-4 px-6 rounded-xl font-semibold transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-8 w-full">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/20"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 text-white/60 bg-black/20 backdrop-blur-sm">Or continue with</span>
        </div>
      </div>

      {/* Social Sign In */}
      <div className="flex gap-3 w-full">
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading || isGoogleLoading}
          className="flex-1 flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Image
            src="/images/google-icon.svg"
            alt="Google"
            width={24}
            height={24}
            className="group-hover:scale-110 transition-transform"
          />
          <span>{isGoogleLoading ? 'Signing in...' : 'Google'}</span>
        </button>
      </div>

      {/* Sign Up Link */}
      <p className="mt-8 text-center text-sm text-white">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-red-400 hover:text-red-300 font-medium">
          Sign up now
        </Link>
      </p>
    </>
  );
}