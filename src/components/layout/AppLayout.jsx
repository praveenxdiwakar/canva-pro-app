import React, { useEffect, useState } from 'react';
import { useTelegram } from '../../hooks/useTelegram';
import BottomNav from './BottomNav';

export default function AppLayout({ children }) {
  const { initData } = useTelegram();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Simulate a brief loading state while Telegram initializes
    const timer = setTimeout(() => {
      if (initData) {
        setIsLoading(false);
      } else if (initData === '') {
        // Still waiting
      } else {
        setError(true);
        setIsLoading(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [initData]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-white p-6">
        <div 
          className="w-24 h-24 rounded-full flex items-center justify-center mb-5 shadow-lg"
          style={{ background: "linear-gradient(135deg,#38bdf8 0%,#818cf8 50%,#a78bfa 100%)" }}
        >
          <span className="text-white font-black text-3xl italic select-none" style={{ fontFamily: "Georgia,serif" }}>Canva</span>
        </div>
        <p className="text-purple-600 font-bold animate-pulse text-base">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#f5f5f5] p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <span className="text-red-500 font-bold text-2xl">!</span>
        </div>
        <h2 className="text-xl font-bold mb-2">Connection Error</h2>
        <p className="text-gray-500">Unable to authenticate with Telegram. Please try reopening the app.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#f5f5f5] text-gray-900 pb-20">
      <main className="w-full max-w-md mx-auto min-h-[calc(100dvh-5rem)]">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}