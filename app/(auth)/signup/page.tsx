import Image from 'next/image';
import RegisterForm from '@/components/RegisterForm';
export const dynamic = 'force-dynamic';

export default function SignUpPage() {
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

          <RegisterForm />
        </div>
      </div>
    </main>
  );
} 