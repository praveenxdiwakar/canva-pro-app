import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Tasks() {
  const navigate = useNavigate();
  // Permanent Local Storage Database for offline mode
  const [livePoints, setLivePoints] = useState(() => parseInt(localStorage.getItem('user_points') || '0'));

  const updatePoints = (earned) => {
    const newPoints = livePoints + earned;
    setLivePoints(newPoints);
    localStorage.setItem('user_points', newPoints.toString());
  };

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24">
      {/* Banner */}
      <div className="relative w-full h-40 overflow-hidden">
        <img src="/earn-points-banner.png" alt="Earn Points — Unlock Canva Pro" className="w-full h-full object-cover object-center" onError={(e) => e.target.style.display = 'none'} />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-gradient-to-br from-[#1e1b4b] to-[#000000]">
           <h1 className="text-3xl font-black text-white italic">EARN POINTS</h1>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3 flex items-center justify-between border-b border-gray-100">
        <h1 className="text-xl font-black text-gray-900">🎯 Earn Points</h1>
        <div className="flex items-center gap-2">
          <div className="bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1 text-xs font-bold text-yellow-700">
            ⭐ {livePoints} pts
          </div>
          <button onClick={() => navigate('/reward-history')} className="bg-purple-100 text-purple-600 text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer">
            History
          </button>
        </div>
      </div>

      <div className="px-4 pt-3 space-y-3">
        {/* Next Reward Progress */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-4 border shadow-sm border-purple-100">
          <div className="flex items-center justify-between mb-1.5">
            <div>
              <div className="font-black text-gray-900 text-sm">🏆 Next Canva Reward</div>
              <div className="text-xs text-gray-500 mt-0.5">Canva Pro · 7 Days</div>
            </div>
            <div className="text-xs font-bold tabular-nums px-2.5 py-1 rounded-full bg-purple-50 text-purple-700">
              {livePoints} / 20 pts
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1.5">
            <div className="h-full rounded-full bg-purple-500 transition-all" style={{ width: `${Math.min(100, (livePoints / 20) * 100)}%` }}></div>
          </div>
        </motion.div>

        {/* Spin & Earn */}
        <SpinEarnCard onWin={(pts) => updatePoints(pts)} />

        {/* Daily Check-in */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-black text-gray-900 text-sm">📅 Daily Check-in</div>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-3">
            {[1, 1, 1, 2, 2, 2, 3].map((pts, i) => (
              <div key={i} className={`flex flex-col items-center rounded-xl py-1.5 border text-center transition-all ${i === 0 ? "bg-purple-100 border-purple-400 text-purple-700" : "bg-gray-50 border-gray-200 text-gray-400"}`}>
                <div className="text-[9px] font-bold">D{i + 1}</div>
                <div className={`font-black text-[10px] ${i === 6 ? "text-yellow-400" : ""}`}>+{pts}</div>
              </div>
            ))}
          </div>
          <button onClick={() => { updatePoints(1); alert("✅ Checked in! +1 Point"); }} className="w-full bg-green-500 hover:bg-green-600 active:scale-[0.98] text-white font-bold text-sm py-2.5 rounded-xl transition-all">
            CHECK-IN — Today's Reward: +1 pt
          </button>
        </motion.div>

        {/* Ad & Social Tasks */}
        <TaskCard icon="📺" bg="bg-red-500" title="Watch Ads 01" pts="+1 Point / Ad" limit="0/5" btnColor="bg-red-500" btnText="WATCH ADS" onClick={() => { updatePoints(1); alert("Ad watched! +1 pt"); }} />
        <TaskCard icon="📺" bg="bg-orange-500" title="Watch Ads 02" pts="+1 Point / Ad" limit="0/5" btnColor="bg-orange-500" btnText="WATCH ADS" onClick={() => { updatePoints(1); alert("Ad watched! +1 pt"); }} />
        <TaskCard icon="📢" bg="bg-blue-500" title="Join Channel 01" pts="+2 pts · One time" limit="0/1000" btnColor="bg-blue-500" btnText="JOIN" onClick={() => { updatePoints(2); alert("Joined! +2 pts"); }} />
        <TaskCard icon="📢" bg="bg-cyan-500" title="Join Channel 02" pts="+2 pts · One time" limit="0/1000" btnColor="bg-cyan-500" btnText="JOIN" onClick={() => { updatePoints(2); alert("Joined! +2 pts"); }} />
        <TaskCard icon="👥" bg="bg-yellow-400" title="Invite Friends" pts="+5 pts / referral · Unlimited" limit="" btnColor="bg-cyan-500" btnText="COPY" onClick={() => alert("Link Copied!")} />
      </div>
    </div>
  );
}

// Reusable Task Card Component
function TaskCard({ icon, bg, title, pts, limit, btnColor, btnText, onClick }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center shrink-0`}>
          <span className="text-white text-lg">{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 text-sm">{title}</div>
          <div className="text-xs text-gray-500 mt-0.5">{pts} {limit && <span className="ml-2 font-semibold text-gray-400">{limit}</span>}</div>
        </div>
        <button onClick={onClick} className={`${btnColor} active:scale-95 text-white font-bold text-xs px-3 py-2 rounded-xl shrink-0 transition-all`}>
          {btnText}
        </button>
      </div>
    </motion.div>
  );
}

// Reusable Spin & Earn Component
function SpinEarnCard({ onWin }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    const winAmounts = [1, 2, 5, 20];
    const won = winAmounts[Math.floor(Math.random() * winAmounts.length)];
    setRotation(prev => prev + 1800 + Math.floor(Math.random() * 360));

    setTimeout(() => {
      setIsSpinning(false);
      onWin(won);
      alert(`🎉 You won +${won} points!`);
    }, 4000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-2xl border-2 border-pink-200 shadow-sm overflow-hidden">
      <button className="w-full px-4 py-3.5 flex items-center justify-between text-left" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-start gap-3">
          <span className="text-2xl drop-shadow-sm mt-0.5">🎡</span>
          <div>
            <div className="font-black text-gray-900 text-sm flex items-center gap-2">Spin & Earn</div>
            <div className="text-xs text-gray-500 mt-0.5">3/3 Spins Today</div>
          </div>
        </div>
        <div className="text-xs font-bold text-blue-500 transition-opacity">Tap to Spin →</div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 flex flex-col items-center">
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
              <button onClick={handleSpin} disabled={isSpinning} className="w-full bg-gray-900 disabled:bg-gray-300 text-white font-black text-sm py-3 rounded-xl active:scale-[0.98] transition-all">
                {isSpinning ? "Spinning..." : "SPIN"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}