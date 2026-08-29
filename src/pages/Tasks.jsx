import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Tasks() {
  const navigate = useNavigate();
  const [livePoints, setLivePoints] = useState(() => parseInt(localStorage.getItem('user_points') || '0'));

  const [checkinData, setCheckinData] = useState(() => {
    const stored = localStorage.getItem('user_checkin');
    return stored ? JSON.parse(stored) : { lastDate: null, streak: 0 };
  });

  const updatePoints = (earned) => {
    const newPoints = livePoints + earned;
    setLivePoints(newPoints);
    localStorage.setItem('user_points', newPoints.toString());
  };

  // --- 24-Hour Check-in Logic ---
  const rewards = [1, 1, 1, 2, 2, 2, 3];
  const todayStr = new Date().toDateString(); 
  const hasCheckedInToday = checkinData.lastDate === todayStr;
  const currentStreak = checkinData.streak;
  
  const nextStreakDay = hasCheckedInToday ? currentStreak : Math.min(currentStreak + 1, 7);
  const nextReward = rewards[nextStreakDay - 1];

  const handleCheckIn = () => {
    if (hasCheckedInToday) {
      alert("✅ You already checked in today! Come back tomorrow.");
      return;
    }

    let newStreak = 1;
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);

    if (checkinData.lastDate === yesterdayDate.toDateString()) {
      newStreak = Math.min(checkinData.streak + 1, 7);
    } else if (checkinData.lastDate !== null) {
      alert("⚠️ You missed a day! Your streak has reset to Day 1.");
    }

    const pointsEarned = rewards[newStreak - 1];
    const newData = { lastDate: todayStr, streak: newStreak };
    
    setCheckinData(newData);
    localStorage.setItem('user_checkin', JSON.stringify(newData));
    updatePoints(pointsEarned);
    alert(`✅ Checked in for Day ${newStreak}! +${pointsEarned} Points`);
  };

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24">
      <div className="relative w-full h-40 overflow-hidden bg-gray-900">
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1e1b4b] to-[#000000]">
           <h1 className="text-3xl font-black text-white italic">EARN POINTS</h1>
        </div>
      </div>

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
        <SpinEarnCard onWin={(pts) => updatePoints(pts)} />

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="font-black text-gray-900 text-sm">📅 Daily Check-in</div>
            {hasCheckedInToday && <div className="bg-green-100 text-green-600 text-[10px] font-black px-2.5 py-1 rounded-full">✓ Done</div>}
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-4">
            {rewards.map((pts, i) => {
              const day = i + 1;
              const isCompleted = day <= currentStreak;
              const isTodayTarget = day === nextStreakDay && !hasCheckedInToday;
              
              let blockClass = "bg-gray-50 border-gray-200 text-gray-400";
              if (isCompleted) blockClass = "bg-green-500 border-green-400 text-white";
              else if (isTodayTarget) blockClass = "bg-purple-100 border-purple-300 text-purple-700";

              return (
                <div key={i} className={`flex flex-col items-center rounded-xl py-1.5 border text-center ${blockClass}`}>
                  <div className="text-[9px] font-bold">D{day}</div>
                  <div className="font-black text-[10px]">+{pts}</div>
                </div>
              );
            })}
          </div>

          {hasCheckedInToday ? (
            <div className="w-full bg-gray-50 border border-dashed border-gray-200 text-gray-400 font-bold text-sm py-3 rounded-xl text-center">
              ✅ Come back tomorrow
            </div>
          ) : (
            <button onClick={handleCheckIn} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-sm py-3 rounded-xl active:scale-[0.98] transition-all">
              CHECK-IN — Reward: +{nextReward} pt
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SpinEarnCard({ onWin }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    const won = [1, 2, 5, 20][Math.floor(Math.random() * 4)];
    setRotation(prev => prev + 1800 + Math.floor(Math.random() * 360));

    setTimeout(() => {
      setIsSpinning(false);
      onWin(won);
      alert(`🎉 You won +${won} points!`);
    }, 4000);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-pink-200 shadow-sm overflow-hidden">
      <button className="w-full px-4 py-3.5 flex items-center justify-between text-left" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">🎡</span>
          <div className="font-black text-gray-900 text-sm">Spin & Earn</div>
        </div>
        <div className="text-xs font-bold text-blue-500">{isOpen ? "Close ▲" : "Tap to Spin →"}</div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-2 flex flex-col items-center">
          <div className="relative w-44 h-44 mb-5 mt-2">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[16px] border-l-transparent border-r-transparent border-b-gray-900" />
            <div 
              className="w-full h-full rounded-full border-4 border-purple-200 shadow-inner flex items-center justify-center relative overflow-hidden bg-gradient-to-tr from-pink-200 via-purple-200 to-yellow-100"
              style={{ transform: `rotate(${rotation}deg)`, transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none' }}
            >
              <div className="absolute text-xs font-black text-purple-900 top-2">+20</div>
              <div className="absolute text-xs font-black text-blue-900 bottom-2">+2</div>
              <div className="w-6 h-6 bg-white rounded-full shadow-md z-10" />
            </div>
          </div>
          <button onClick={handleSpin} disabled={isSpinning} className="w-full bg-gray-900 disabled:bg-gray-400 text-white font-black text-sm py-3.5 rounded-xl active:scale-[0.98] transition-all">
            {isSpinning ? "Spinning..." : "SPIN NOW"}
          </button>
        </div>
      )}
    </div>
  );
}