import React, { createContext, useContext, useState, useEffect } from 'react';
import { syncUser } from '../api/tasks';

const TelegramContext = createContext({});

export function TelegramProvider({ children }) {
  const tg = window.Telegram?.WebApp;
  const tgUser = tg?.initDataUnsafe?.user;
  
  // Get Referral ID from the invite link (e.g. ?startapp=12345)
  const startParam = tg?.initDataUnsafe?.start_param || null; 

  const initialUser = {
    telegramId: tgUser?.id ? tgUser.id.toString() : (import.meta.env.VITE_ADMIN_TELEGRAM_ID || "5589713552"),
    firstName: tgUser?.first_name || "User",
    photoUrl: tgUser?.photo_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    points: 0, 
    streak: 0,
    last_checkin: null
  };

  const [user, setUser] = useState(initialUser);
  const [isReady, setIsReady] = useState(false); // Track DB Loading

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }

    // Sync with database and load REAL points BEFORE showing the app
    syncUser(initialUser, startParam).then(dbUser => {
      if (dbUser) {
        setUser(prev => ({ 
          ...prev, 
          points: dbUser.points !== undefined ? dbUser.points : 0,
          streak: dbUser.streak !== undefined ? dbUser.streak : 0,
          last_checkin: dbUser.last_checkin !== undefined ? dbUser.last_checkin : null
        }));
      }
      setIsReady(true); // Database is loaded, show the app!
    });
  }, []);

  return (
    <TelegramContext.Provider value={{ user, setUser }}>
      {!isReady ? (
        // Beautiful Loading Screen to hide the "0 points" delay
        <div className="min-h-[100dvh] bg-[#f5f5f5] flex flex-col items-center justify-center text-gray-400 font-bold">
           <span className="text-4xl mb-4 animate-spin">⏳</span>
           Loading your profile...
        </div>
      ) : (
        children
      )}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
}