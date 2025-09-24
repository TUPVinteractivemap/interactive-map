'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface InactivityWarningProps {
  timeout: number; // in milliseconds
  onLogout: () => void;
}

export default function InactivityWarning({ timeout, onLogout }: InactivityWarningProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
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

  const handleStayLoggedIn = () => {
    setShowWarning(false);
    setTimeLeft(60);
    // Reset the timer by triggering a user activity
    window.dispatchEvent(new Event('click'));
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    setShowWarning(false);
    onLogout();
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  if (!showWarning && !showLogoutConfirm) return null;

  return (
    <>
      {/* Main Warning Dialog */}
      {showWarning && !showLogoutConfirm && (
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
                onClick={handleStayLoggedIn}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Stay Logged In
              </button>
              <button
                onClick={handleLogoutClick}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Logout Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirm Logout
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to log out now?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelLogout}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
