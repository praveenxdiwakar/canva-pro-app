import React, { createContext, useContext, useState, useEffect } from 'react';

const TelegramContext = createContext({});

export function TelegramProvider({ children }) {
  const [initData, setInitData] = useState("");
  const [user, setUser] = useState(null);
  const [referralCode, setReferralCode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Initialize Telegram WebApp natively
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }

    // 2. Extract safe initData string
    const rawInitData = tg?.initData || "dev_mode";
    setInitData(rawInitData);

    // 3. Extract referral code (if someone was invited)
    const startParam = tg?.initDataUnsafe?.start_param || new URLSearchParams(window.location.search).get("startapp") || null;
    setReferralCode(startParam);

    // 4. Extract User natively WITHOUT the backend API!
    let tgUser = tg?.initDataUnsafe?.user;

    // DEV MODE FALLBACK: 
    // If testing in a normal web browser instead of Telegram, use your Admin ID to prevent crashes!
    if (!tgUser) {
      tgUser = {
        id: "5589713552", // Your Master Telegram ID
        first_name: "Master",
        last_name: "Admin",
        username: "admin_user"
      };
    }

    // 5. Instantly set the user so the React app doesn't crash
    setUser({
      telegramId: tgUser.id.toString(),
      firstName: tgUser.first_name,
      lastName: tgUser.last_name,
      username: tgUser.username,
      points: parseInt(localStorage.getItem('user_points') || '0') // Sync points offline
    });

    // App is ready to render!
    setIsLoading(false);
  }, []);

  return (
    <TelegramContext.Provider value={{ initData, user, isLoading, referralCode }}>
      {/* Only render the app once the user is successfully loaded to prevent white screens */}
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
  if (context === undefined) {
    throw new Error("useTelegram must be used within a TelegramProvider");
  }
  return context;
}