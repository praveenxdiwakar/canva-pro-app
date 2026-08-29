import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const livePoints = parseInt(localStorage.getItem('user_points') || '0');

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24 relative">
      <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100 flex justify-between shadow-sm">
        <h1 className="text-xl font-black text-gray-900">👤 Profile</h1>
        <button onClick={() => navigate('/admin')} className="bg-orange-100 text-orange-600 text-xs font-bold px-3.5 py-1.5 rounded-full">
          ⚙️ Admin
        </button>
      </div>

      <div className="px-4 pt-4">
        <div className="bg-white rounded-3xl p-6 shadow-sm text-center">
          <div className="w-20 h-20 rounded-full mx-auto mb-3 bg-purple-100 flex items-center justify-center text-3xl">
            🧑‍💻
          </div>
          <h2 className="text-lg font-black text-gray-900">App User</h2>
          <div className="bg-yellow-50 text-yellow-700 font-black px-6 py-2 rounded-full text-sm inline-block mt-3 shadow-sm">
            ⭐ {livePoints} Points
          </div>
        </div>
      </div>
    </div>
  );
}