'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { registerSchema, RegisterFormData } from '@/lib/auth';
import { toast } from 'sonner';
import Image from 'next/image';

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: RegisterFormData) {
    try {
      setIsLoading(true);
      await signUp(values);
      toast.success('Account created successfully!');
      router.push('/login');
  } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create account';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      toast.success('Successfully signed in with Google!');
      router.push('/');
  } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to sign in with Google';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-center mb-2">
        Create an Account
      </h1>

      <p className="text-gray-200 text-center mb-8 text-base">
        Join us to explore TUPV campus with ease
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium">
            Full Name
          </label>
          <input
            {...form.register('name')}
            type="text"
            id="name"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            placeholder="Enter your full name"
          />
          {form.formState.errors.name && (
            <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
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
            placeholder="Enter your email"
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
            placeholder="Create a password"
          />
          {form.formState.errors.password && (
            <p className="text-red-500 text-sm">{form.formState.errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-medium">
            Confirm Password
          </label>
          <input
            {...form.register('confirmPassword')}
            type="password"
            id="confirmPassword"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            placeholder="Confirm your password"
          />
          {form.formState.errors.confirmPassword && (
            <p className="text-red-500 text-sm">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex items-start space-x-2 text-sm">
          <input
            type="checkbox"
            id="terms"
            required
            className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-red-500 focus:ring-red-500 focus:ring-offset-0"
          />
          <label htmlFor="terms">
            I agree to the{' '}
            <Link href="/terms" className="text-red-400 hover:text-red-300">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-red-400 hover:text-red-300">
              Privacy Policy
            </Link>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-4 px-6 rounded-xl font-semibold transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
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

      {/* Social Sign Up */}
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

      {/* Login Link */}
      <p className="mt-8 text-center text-sm">
        Already have an account?{' '}
        <Link href="/login" className="text-red-400 hover:text-red-300 font-medium">
          Sign in
        </Link>
      </p>
    </>
  );
}