import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useTelegram } from '../contexts/TelegramContext';

export default function Tasks() {
  const navigate = useNavigate();
  const { initData } = useTelegram();
  const queryClient = useQueryClient();

  // Fetch Live Points from Database
  const { data: userData } = useQuery({
    queryKey: ['user-me'],
    queryFn: async () => {
      const res = await fetch('/api/users/me', { headers: { 'x-init-data': initData } });
      return res.ok ? res.json() : { points: 0 };
    },
    enabled: !!initData
  });

  const livePoints = userData?.points ?? 0;

  const handleCheckin = async () => {
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'x-init-data': initData, 'content-type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ " + data.message);
        queryClient.invalidateQueries({ queryKey: ['user-me'] });
      } else {
        alert("❌ Error: " + (data.error || "Check-in failed on backend"));
      }
    } catch (e) {
      alert("❌ Error: Could not connect to Database");
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100dvh-5rem)] bg-[#f5f5f5] pb-24">
      <div className="relative w-full h-44 overflow-hidden bg-gray-900">
        <img src="/earn-points-banner.png" alt="Earn Points" className="absolute inset-0 w-full h-full object-cover z-10" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-gradient-to-br from-[#1e1b4b] to-[#000000]">
           <h1 className="text-3xl font-black text-white italic">EARN POINTS</h1>
        </div>
      </div>

      <div className="bg-white px-4 pt-4 pb-3 flex items-center justify-between shadow-sm z-10">
        <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">🎯 Earn Points</h1>
        <div className="flex items-center gap-2">
          <div className="bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1 text-xs font-bold text-yellow-700 shadow-sm">
            ⭐ {livePoints} pts
          </div>
          <button onClick={() => navigate('/reward-history')} className="bg-purple-50 text-purple-600 text-xs font-bold px-3 py-1.5 rounded-full">History</button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        <SpinEarnCard initData={initData} onWin={() => queryClient.invalidateQueries({ queryKey: ['user-me'] })} />

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2"><span>🗓️</span> Daily Check-in</div>
          <button onClick={handleCheckin} className="w-full bg-[#10b981] active:scale-[0.98] text-white font-black py-3.5 rounded-xl text-sm shadow-md">
            CHECK-IN — +1 pt
          </button>
        </div>
      </div>
    </div>
  );
}

function SpinEarnCard({ initData, onWin }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const handleSpin = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    
    try {
      // Connects to Database for true spin logic
      const res = await fetch('/api/tasks/spin', {
        method: 'POST',
        headers: { 'x-init-data': initData, 'content-type': 'application/json' }
      });
      const data = await res.json();

      if (!res.ok) {
        alert(`❌ Error: ${data.message || 'Spin failed in database'}`);
        setIsSpinning(false);
        return;
      }

      setRotation(prev => prev + 1800 + Math.floor(Math.random() * 360));

      setTimeout(() => {
        setIsSpinning(false);
        onWin();
        alert(`🎉 You won +${data.pointsWon || 1} points permanently!`);
      }, 4000);

    } catch (e) {
      alert("❌ Error: Could not connect to Database");
      setIsSpinning(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full p-4 flex justify-between items-center text-left hover:bg-gray-50 transition-colors">
        <div className="flex items-start gap-3">
          <span className="text-2xl drop-shadow-sm mt-0.5">🎡</span>
          <div>
            <div className="font-bold text-gray-900 text-sm">Spin & Earn</div>
          </div>
        </div>
        <div className="text-sm font-bold text-blue-500 flex items-center gap-1">{isOpen ? "Close ▲" : "Tap to Spin →"}</div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-gray-100">
            <div className="p-4 flex flex-col items-center">
              <div className="relative w-44 h-44 mb-4">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[16px] border-l-transparent border-r-transparent border-b-gray-900" />
                <div 
                  className="w-full h-full rounded-full border-4 border-purple-200 shadow-inner flex items-center justify-center relative overflow-hidden bg-gradient-to-tr from-pink-200 via-purple-200 to-yellow-100"
                  style={{ transform: `rotate(${rotation}deg)`, transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none' }}
                >
                  <div className="absolute text-xs font-black text-purple-900 top-2">+20</div>
                  <div className="absolute text-xs font-black text-pink-900 right-2">+5</div>
                  <div className="absolute text-xs font-black text-blue-900 bottom-2">+2</div>
                  <div className="absolute text-xs font-black text-green-900 left-2">+1</div>
                  <div className="w-6 h-6 bg-white rounded-full shadow-md z-10" />
                </div>
              </div>
              <button onClick={handleSpin} disabled={isSpinning} className="w-full bg-gray-900 text-white font-black text-sm py-3.5 rounded-xl shadow-md active:scale-95 transition-all">
                {isSpinning ? "Connecting to Database..." : "SPIN"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}