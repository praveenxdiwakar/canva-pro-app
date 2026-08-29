import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../contexts/TelegramContext';
import { fetchUserHistory } from '../api/users';

export default function RewardHistory() {
  const navigate = useNavigate();
  const { user } = useTelegram();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.telegramId) {
      fetchUserHistory(user.telegramId).then(data => {
        setHistory(data);
        setLoading(false);
      });
    }
  }, [user]);

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24">
      <div className="bg-white px-4 py-4 flex items-center shadow-sm border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="text-gray-600 mr-4 p-1">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="text-[17px] font-black text-gray-900 flex items-center gap-2">📋 Reward History</h1>
      </div>

      <div className="px-4 pt-6">
        {loading ? (
          <div className="text-center text-gray-400 text-sm mt-10">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center">
            <span className="text-4xl mb-3">📬</span>
            <h2 className="font-black text-gray-800 text-[15px] mb-1">No rewards yet</h2>
            <p className="text-[11px] text-gray-400 font-medium">Complete tasks to start earning points!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map(item => {
              const isActive = new Date(item.expires_at) > new Date();
              return (
                <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 text-sm">Canva Pro Access</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
                      {isActive ? 'Active' : 'Expired'}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 mb-2">Link: {item.link_name}</div>
                  <div className="text-[10px] text-gray-400 mt-2 border-t border-gray-50 pt-2 flex justify-between">
                    <span>Redeemed: {new Date(item.created_at).toLocaleDateString()}</span>
                    <span>Expires: {new Date(item.expires_at).toLocaleDateString()}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}