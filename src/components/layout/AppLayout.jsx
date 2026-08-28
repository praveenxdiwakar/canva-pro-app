import React from 'react';
import { useTelegram } from '../../contexts/TelegramContext';

export default function AppLayout({ children }) {
  const { isLoading, error } = useTelegram();

  // Check if the user is actually inside the Telegram App (blocks regular browsers)
  const isTelegramApp = window.Telegram?.WebApp?.initData;

  // 1. Loading State (Shows the Canva gradient logo while authenticating)
  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-white p-6">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-5 shadow-lg" style={{ background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #a78bfa 100%)" }}>
          <span className="text-white font-black text-3xl italic select-none" style={{ fontFamily: "Georgia, serif" }}>Canva</span>
        </div>
        <p className="text-purple-600 font-bold animate-pulse text-base">Loading…</p>
      </div>
    );
  }

  // 2. Connection Error State (Exact match to your screenshot)
  // This triggers if there is an auth error OR if opened in a standard web browser
  if (error || !isTelegramApp) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#fafafa] p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <span className="text-red-500 font-black text-2xl mt-0.5">!</span>
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-1.5 tracking-tight">
          Connection Error
        </h2>
        <p className="text-[13px] text-gray-500 font-medium leading-relaxed max-w-[280px]">
          Unable to authenticate with Telegram. Please try reopening the app.
        </p>
      </div>
    );
  }

  // 3. Normal App Content (Only shows if securely inside Telegram)
  return (
    <div className="min-h-[100dvh] w-full mx-auto">
      {children}
    </div>
  );
}