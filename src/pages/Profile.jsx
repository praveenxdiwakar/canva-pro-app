import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const livePoints = parseInt(localStorage.getItem('user_points') || '0');

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24 relative">
      <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between shadow-sm relative">
        <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">👤 Profile</h1>
        <button onClick={() => navigate('/admin')} className="bg-orange-100 text-orange-600 text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
          <span>⚙️</span> Admin
        </button>
      </div>

      <div className="px-4 pt-4 space-y-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 shadow-sm text-center">
          <div className="w-20 h-20 rounded-full mx-auto mb-3 bg-purple-100 flex items-center justify-center border-4 border-white shadow-md">
            <span className="text-3xl">🧑‍💻</span>
          </div>
          <h2 className="text-lg font-black text-gray-900">App User</h2>
          <div className="inline-block bg-purple-100 text-purple-600 text-xs font-bold px-3 py-1 rounded-full mb-4 mt-2">
            ID: 5589713552
          </div>

          <div className="flex justify-center mb-5">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 font-black px-6 py-2 rounded-full text-sm shadow-sm flex items-center gap-1.5">
              ⭐ {livePoints} Points
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}