import React from 'react';
import { useTelegram } from '../contexts/TelegramContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user } = useTelegram();
  const navigate = useNavigate();
  const isAdmin = user?.telegramId === import.meta.env.VITE_ADMIN_TELEGRAM_ID;

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24 px-4 pt-4 space-y-4">
      <div className="bg-white rounded-3xl p-6 shadow-sm text-center relative border border-gray-100">
        {isAdmin && (
          <button onClick={() => navigate('/admin')} className="absolute top-4 right-4 bg-orange-100 hover:bg-orange-200 text-orange-600 text-xs font-bold px-3.5 py-1.5 rounded-full transition-colors">
            ⚙️ Admin
          </button>
        )}

        <div className="w-24 h-24 rounded-full mx-auto mb-3 overflow-hidden border-4 border-purple-100 shadow-md bg-purple-50 flex items-center justify-center">
          {user?.photoUrl ? (
            <img src={user.photoUrl} alt="Telegram Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl">🧑‍💻</span>
          )}
        </div>

        <h2 className="text-xl font-black text-gray-900">{user?.firstName || "User"}</h2>
        <div className="text-xs font-bold text-gray-400 mt-1">ID: {user?.telegramId}</div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 font-black px-6 py-2 rounded-full text-sm inline-block mt-4 shadow-sm">
          ⭐ {user?.points || 0} Points
        </div>
      </div>
    </div>
  );
}