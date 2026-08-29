import React, { createContext, useContext, useState, useEffect } from 'react';
import { syncUser } from '../api/tasks';

const TelegramContext = createContext({});

export function TelegramProvider({ children }) {
  // Extract Telegram WebApp data synchronously on initial load
  const tg = window.Telegram?.WebApp;
  const tgUser = tg?.initDataUnsafe?.user;

  const initialUser = {
    telegramId: tgUser?.id ? tgUser.id.toString() : (import.meta.env.VITE_ADMIN_TELEGRAM_ID || "5589713552"),
    firstName: tgUser?.first_name || "User",
    photoUrl: tgUser?.photo_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    points: 0,
    streak: 0,
    last_checkin: null
  };

  const [user, setUser] = useState(initialUser);
  const [isLoading, setIsLoading] = useState(false); // Never block rendering!

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }

    // Sync with Supabase cloud database in the background silently
    syncUser(initialUser).then(dbUser => {
      if (dbUser) {
        setUser(prev => ({ ...prev, ...dbUser }));
      }
    }).catch(err => {
      console.warn("Background cloud sync warning:", err);
    });
  }, []);

  return (
    <TelegramContext.Provider value={{ user, setUser, isLoading }}>
      {children}
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

export { TelegramContext };