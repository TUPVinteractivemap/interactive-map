import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/tupv-campus.jpg"
          alt="TUPV Campus"
          fill
          className="object-cover brightness-[0.3] blur-[2px]"
          priority
        />
      </div>

      {/* Main Content Panel */}
      <div className="backdrop-blur-sm rounded-2xl p-8 max-w-md w-full z-10">
        {/* Content */}
        <div className="flex flex-col items-center text-white">
          {/* Logo */}
          <div className="mb-6">
            <Image
              src="/images/tupv-logo.png"
              alt="TUPV Logo"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>

          <h1 className="text-3xl font-bold text-center mb-2">
            Welcome Back!
          </h1>

          <p className="text-gray-200 text-center mb-8 text-base">
            Sign in to continue exploring TUPV campus
          </p>

          {/* Login Form */}
          <form className="w-full space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
              />
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
              className="w-full bg-red-500 hover:bg-red-600 text-white py-4 px-6 rounded-xl font-semibold transition-all mt-6"
            >
              Sign In
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
            <button className="flex-1 flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl transition-all group">
              <Image
                src="/images/facebook-icon.svg"
                alt="Facebook"
                width={24}
                height={24}
                className="group-hover:scale-110 transition-transform"
              />
              <span>Facebook</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl transition-all group">
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
            Don't have an account?{' '}
            <Link href="/signup" className="text-red-400 hover:text-red-300 font-medium">
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
} 