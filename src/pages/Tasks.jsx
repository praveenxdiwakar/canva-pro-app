import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelegram } from '../contexts/TelegramContext';
import { useTasks } from '../hooks/useTasks';
import { useNavigate } from 'react-router-dom';

export default function Tasks() {
  const { user, setUser } = useTelegram();
  const { updatePoints, processCheckIn } = useTasks();
  const navigate = useNavigate();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const rewards = [1, 1, 1, 2, 2, 2, 3];
  const todayStr = new Date().toDateString();
  const hasCheckedInToday = user?.last_checkin === todayStr;
  const currentStreak = user?.streak || 0;

  const handleCheckIn = async () => {
    if (hasCheckedInToday) {
      alert("✅ You already checked in today! Come back tomorrow.");
      return;
    }

    let newStreak = 1;
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);

    if (user?.last_checkin === yesterdayDate.toDateString()) {
      newStreak = Math.min(currentStreak + 1, 7);
    } else if (user?.last_checkin !== null && user?.last_checkin !== undefined) {
      alert("⚠️ You missed a day! Your streak has reset to Day 1.");
    }

    const pointsEarned = rewards[newStreak - 1];
    const newTotal = await processCheckIn({ newStreak, dateStr: todayStr, pointsEarned });
    setUser({ ...user, streak: newStreak, last_checkin: todayStr, points: newTotal });
    alert(`✅ Checked in for Day ${newStreak}! +${pointsEarned} Points`);
  };

  const handleSpin = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    const winAmounts = [1, 2, 5, 20];
    const won = winAmounts[Math.floor(Math.random() * winAmounts.length)];
    setRotation(prev => prev + 1800 + Math.floor(Math.random() * 360));

    setTimeout(async () => {
      setIsSpinning(false);
      const newTotal = (user?.points || 0) + won;
      await updatePoints(newTotal);
      setUser({ ...user, points: newTotal });
      alert(`🎉 You won +${won} points!`);
    }, 4000);
  };

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24 px-4 pt-4 space-y-4">
      <div className="bg-white rounded-2xl p-4 shadow-sm flex justify-between items-center border border-gray-100">
        <div>
          <h1 className="font-black text-xl text-gray-900">🎯 Earn Points</h1>
          <p className="text-xs text-gray-500">Complete tasks to claim Canva Pro</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 font-bold px-3 py-1.5 rounded-full text-xs">
          ⭐ {user?.points || 0} pts
        </div>
      </div>

      {/* Spin & Earn Card */}
      <div className="bg-white rounded-2xl p-4 border border-pink-200 shadow-sm text-center">
        <h3 className="font-black text-gray-900 text-sm mb-3">🎡 Spin & Earn Free Points</h3>
        <div className="relative w-36 h-36 mx-auto mb-4 flex items-center justify-center">
          <div className="absolute top-0 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[12px] border-l-transparent border-r-transparent border-b-gray-900 z-10 -translate-y-1" />
          <div 
            className="w-full h-full rounded-full border-4 border-purple-200 shadow-inner flex items-center justify-center relative overflow-hidden bg-gradient-to-tr from-pink-200 via-purple-200 to-yellow-100"
            style={{ transform: `rotate(${rotation}deg)`, transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none' }}
          >
            <span className="absolute text-[10px] font-black top-2 text-purple-900">+20</span>
            <span className="absolute text-[10px] font-black bottom-2 text-blue-900">+2</span>
          </div>
        </div>
        <button onClick={handleSpin} disabled={isSpinning} className="w-full bg-gray-900 disabled:bg-gray-400 text-white font-black text-xs py-3 rounded-xl shadow-md">
          {isSpinning ? "Spinning..." : "SPIN NOW"}
        </button>
      </div>

      {/* Daily Check-in Card */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <div className="font-black text-sm text-gray-900">📅 Daily Check-in</div>
          {hasCheckedInToday && <span className="bg-green-100 text-green-600 text-[10px] font-black px-2 py-0.5 rounded-full">✓ Done Today</span>}
        </div>
        <div className="grid grid-cols-7 gap-1 mb-3">
          {rewards.map((pts, i) => (
            <div key={i} className={`flex flex-col items-center rounded-xl py-2 border text-center ${i + 1 <= currentStreak ? "bg-green-500 border-green-400 text-white" : "bg-gray-50 border-gray-200 text-gray-400"}`}>
              <span className="text-[9px] font-bold">D{i + 1}</span>
              <span className="font-black text-[10px]">+{pts}</span>
            </div>
          ))}
        </div>
        <button onClick={handleCheckIn} disabled={hasCheckedInToday} className="w-full bg-green-500 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-xs py-3 rounded-xl shadow-md">
          {hasCheckedInToday ? "✅ Checked In Today" : "CHECK-IN NOW"}
        </button>
      </div>
    </div>
  );
}