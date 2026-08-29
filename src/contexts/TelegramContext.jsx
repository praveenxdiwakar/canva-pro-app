import React, { createContext, useContext, useState, useEffect } from 'react';

const TelegramContext = createContext({});

export function TelegramProvider({ children }) {
  const [initData, setInitData] = useState("");
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Safely load Telegram WebApp
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }

    const rawInitData = tg?.initData || "dev_mode";
    setInitData(rawInitData);

    // Extract user natively to prevent crashes
    let tgUser = tg?.initDataUnsafe?.user;

    // Developer Fallback: Uses your Admin ID if you test outside of Telegram
    if (!tgUser) {
      tgUser = {
        id: "5589713552", 
        first_name: "Master",
        last_name: "Admin"
      };
    }

    setUser({
      telegramId: tgUser.id.toString(),
      firstName: tgUser.first_name,
      lastName: tgUser.last_name,
    });

    setIsLoading(false);
  }, []);

  return (
    <TelegramContext.Provider value={{ initData, user, isLoading }}>
      {!isLoading ? children : (
        <div className="flex h-screen items-center justify-center bg-[#f5f5f5]">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
        </div>
      )}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  const context = useContext(TelegramContext);
  if (context === undefined) throw new Error("useTelegram must be used within a TelegramProvider");
  return context;
}