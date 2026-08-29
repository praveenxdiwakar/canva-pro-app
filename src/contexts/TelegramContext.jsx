import React, { createContext, useContext, useState, useEffect } from 'react';
import { syncUser } from '../api/tasks';

const TelegramContext = createContext({});

export function TelegramProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initData, setInitData] = useState('');

  useEffect(() => {
    // Safely initialize Telegram WebApp SDK
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }

    const rawInitData = tg?.initData || '';
    setInitData(rawInitData);

    // Extract user natively from Telegram environment
    let tgUser = tg?.initDataUnsafe?.user;

    // Developer Fallback (Strictly utilizes Vercel Environment Variables - NO hardcoded IDs)
    if (!tgUser) {
      tgUser = {
        id: import.meta.env.VITE_ADMIN_TELEGRAM_ID,
        first_name: import.meta.env.VITE_ADMIN_FIRST_NAME || "Master Admin",
        photo_url: import.meta.env.VITE_ADMIN_PHOTO_URL || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
      };
    }

    const userData = {
      telegramId: tgUser.id ? tgUser.id.toString() : "",
      firstName: tgUser.first_name || "User",
      photoUrl: tgUser.photo_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
    };

    if (userData.telegramId) {
      syncUser(userData).then(dbUser => {
        setUser({ ...userData, ...dbUser });
        setIsLoading(false);
      }).catch(err => {
        console.error("Failed to sync user with Supabase:", err);
        setUser({ ...userData, points: 0, streak: 0 });
        setIsLoading(false);
      });
    } else {
      console.error("🚨 Authentication Error: No Telegram user detected and VITE_ADMIN_TELEGRAM_ID is missing.");
      setIsLoading(false);
    }
  }, []);

  return (
    <TelegramContext.Provider value={{ user, setUser, isLoading, initData }}>
      {!isLoading ? children : (
        <div className="flex h-screen items-center justify-center bg-[#f5f5f5]">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
        </div>
      )}
    </TelegramContext.Provider>
  );
}

// Export useTelegram directly from context to prevent import mismatches
export function useTelegram() {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
}

export { TelegramContext };