import React, { createContext, useContext, useEffect, useState } from 'react';

const TelegramContext = createContext({});

export function TelegramProvider({ children }) {
  const [initData, setInitData] = useState("");
  const [referralCode, setReferralCode] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
      }

      // Check if we are inside Telegram
      const data = tg?.initData || "";
      const unsafeData = tg?.initDataUnsafe || {};
      const startParam = unsafeData?.start_param || new URLSearchParams(window.location.search).get("startapp") || null;

      setInitData(data);
      setReferralCode(startParam);

      // If there is no initData, it means they opened it in Chrome/Safari
      if (!data) {
        setError(true);
        setIsLoading(false);
        return;
      }

      // 1. Instantly load user data natively from Telegram (No waiting for backend!)
      let tgUser = unsafeData?.user;
      if (tgUser) {
        setUser({
          telegramId: tgUser.id?.toString() || "",
          firstName: tgUser.first_name || "User",
          lastName: tgUser.last_name || "",
          username: tgUser.username || "",
          photoUrl: tgUser.photo_url || "",
          points: 0,
        });
      }

      // 2. Sync with Backend silently
      fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: data, referralCode: startParam })
      })
      .then(res => res.ok ? res.json() : null)
      .then(apiUser => {
        if (apiUser) setUser(prev => ({ ...prev, ...apiUser })); // Merge backend data (points, etc.)
      })
      .catch(err => console.warn("Backend sync delayed", err))
      .finally(() => setIsLoading(false));

    } catch (err) {
      setError(true);
      setIsLoading(false);
    }
  }, []);

  return (
    <TelegramContext.Provider value={{ initData, user, isLoading, error, referralCode }}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  return useContext(TelegramContext);
}