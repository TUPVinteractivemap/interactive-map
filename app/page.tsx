import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
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
          <div className="mb-8">
            <Image
              src="/images/tupv-logo.png"
              alt="TUPV Logo"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>

          <h1 className="text-4xl font-bold text-center mb-4">
            Explore TUPV like never before!
          </h1>

          <p className="text-gray-200 text-center mb-10 text-lg">
            TUPV 2D Interactive Map mobile app is designed to help students, faculty, and visitors navigate the Technological University of the Philippines Visayas (TUPV) campus with ease.
          </p>

          {/* Action Buttons */}
          <div className="w-full space-y-3">
            {/* Sign Up Button */}
            <Link
              href="/signup"
              className="w-full bg-red-500 hover:bg-red-600 text-white py-4 px-6 rounded-xl text-center font-semibold transition-all inline-block"
            >
              Proceed to Sign-up
            </Link>

            {/* Login Button */}
            <Link
              href="/login"
              className="w-full bg-white/10 hover:bg-white/20 text-white py-4 px-6 rounded-xl text-center font-semibold transition-all inline-block"
            >
              Login
            </Link>

            {/* Guest Button */}
            <Link
              href="/guest"
              className="w-full bg-white/5 hover:bg-white/10 text-white py-4 px-6 rounded-xl text-center font-semibold transition-all inline-block"
            >
              Proceed as Guest
            </Link>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-white/60 bg-black/20 backdrop-blur-sm">Or continue with</span>
              </div>
            </div>

            {/* Social Login Options */}
            <div className="flex gap-3">
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
          </div>
        </div>
      </div>
    </main>
  );
}
