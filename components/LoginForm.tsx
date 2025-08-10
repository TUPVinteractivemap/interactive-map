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
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      studentId: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(value: LoginFormData) {
    try {
      setIsLoading(true);
      await signIn(value);
      toast.success('Successfully signed in');
      router.push('/');
    } catch (error: unknown) {
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
      setIsLoading(true);
      await signInWithGoogle();
      toast.success('Successfully signed in with Google');
      router.push('/');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An error occurred during sign in';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
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
          <label htmlFor="studentId" className="block text-sm font-medium">
            Student ID
          </label>
          <input
            {...form.register('studentId')}
            type="text"
            id="studentId"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            placeholder="TUPV-00-0000"
            maxLength={12}
          />
          <p className="text-xs text-white/60">
            Format: TUPV-YY-XXXX (e.g., TUPV-24-1234)
          </p>
          {form.formState.errors.studentId && (
            <p className="text-red-500 text-sm">{form.formState.errors.studentId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            {...form.register('email')}
            type="email"
            id="email"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            placeholder="yourname@tup.edu.ph"
          />
          <p className="text-xs text-white/60">
            Only @tup.edu.ph email addresses are accepted
          </p>
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
            <label htmlFor="remember" className="ml-2">
              Remember me
            </label>
          </div>
          <Link href="/forgot-password" className="text-red-400 hover:text-red-300">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
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

      {/* Social Login */}
      <div className="flex gap-3 w-full">
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Image
            src="/images/google-icon.svg"
            alt="Google"
            width={24}
            height={24}
            className="group-hover:scale-110 transition-transform"
          />
          <span>Google</span>
        </button>
      </div>

      {/* Sign Up Link */}
      <p className="mt-8 text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-red-400 hover:text-red-300 font-medium">
          Sign up now
        </Link>
      </p>
    </>
  );
}
