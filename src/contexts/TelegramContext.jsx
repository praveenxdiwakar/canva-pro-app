import React, { createContext, useContext, useEffect, useState } from 'react';
export const TelegramContext = createContext({});
export const TelegramProvider = ({ children }) => {
  const [initData, setInitData] = useState('');
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      setInitData(window.Telegram.WebApp.initData || 'dev_mode');
    }
  }, []);
  return <TelegramContext.Provider value={{ initData }}>{children}</TelegramContext.Provider>;
};