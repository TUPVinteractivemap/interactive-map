'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface InactivityWarningProps {
  timeout: number; // in milliseconds
  onLogout: () => void;
}

export default function InactivityWarning({ timeout, onLogout }: InactivityWarningProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds warning

  useEffect(() => {
    const warningTime = timeout - (60 * 1000); // Show warning 1 minute before logout
    
    const inactivityTimer = setTimeout(() => {
      setShowWarning(true);
      toast.warning('You will be logged out due to inactivity in 1 minute', {
        duration: 5000,
      });
    }, warningTime);

    const logoutTimer = setTimeout(() => {
      onLogout();
    }, timeout);

    return () => {
      clearTimeout(inactivityTimer);
      clearTimeout(logoutTimer);
    };
  }, [timeout, onLogout]);

  useEffect(() => {
    if (showWarning) {
      const countdown = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(countdown);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdown);
    }
  }, [showWarning]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Session Timeout Warning
        </h3>
        <p className="text-gray-600 mb-4">
          You will be automatically logged out due to inactivity in{' '}
          <span className="font-bold text-red-600">{timeLeft}</span> seconds.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowWarning(false);
              setTimeLeft(60);
              // Reset the timer by triggering a user activity
              window.dispatchEvent(new Event('click'));
            }}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Stay Logged In
          </button>
          <button
            onClick={onLogout}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Logout Now
          </button>
        </div>
      </div>
    </div>
  );
}
