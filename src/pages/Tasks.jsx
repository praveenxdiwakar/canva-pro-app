import React, { useState } from 'react';
import { useTelegram } from '../contexts/TelegramContext';
import { useTasks } from '../hooks/useTasks';
import { useNavigate } from 'react-router-dom';

export default function Tasks() {
  const { user, setUser } = useTelegram();
  const { updatePoints, processCheckIn } = useTasks();
  const navigate = useNavigate();
  
  // Wheel State
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  // Wheel configuration matching your exact screenshot
  const prizes = [20, 0, 1, 0, 2, 0, 5, 1];
  const labels = ['+20', '0', '+1', '0', '+2', '0', '+5', '+1'];
  
  // Check-in logic
  const checkInRewards = [1, 1, 1, 2, 2, 2, 3];
  const todayStr = new Date().toDateString();
  const hasCheckedInToday = user?.last_checkin === todayStr;
  const currentStreak = user?.streak || 0;

  const handleCheckIn = async () => {
    if (hasCheckedInToday) return alert("✅ You already checked in today! Come back tomorrow.");

    let newStreak = 1;
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);

    if (user?.last_checkin === yesterdayDate.toDateString()) {
      newStreak = Math.min(currentStreak + 1, 7);
    } else if (user?.last_checkin) {
      alert("⚠️ You missed a day! Your streak has reset to Day 1.");
    }

    const pointsEarned = checkInRewards[newStreak - 1];
    const newTotal = await processCheckIn({ newStreak, dateStr: todayStr, pointsEarned });
    setUser({ ...user, streak: newStreak, last_checkin: todayStr, points: newTotal });
    alert(`✅ Checked in for Day ${newStreak}! +${pointsEarned} Points`);
  };

  const handleSpin = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    
    // Pick a random prize index (0 to 7)
    const prizeIndex = Math.floor(Math.random() * prizes.length);
    const won = prizes[prizeIndex];

    // Calculate rotation to perfectly land the slice at the TOP (12 o'clock)
    // 360 * 5 ensures 5 full spins before stopping
    const newRotation = rotation + (360 * 5) + (360 - (prizeIndex * 45)) - (rotation % 360);
    setRotation(newRotation);

    setTimeout(async () => {
      setIsSpinning(false);
      const newTotal = (user?.points || 0) + won;
      await updatePoints(newTotal);
      setUser({ ...user, points: newTotal });
      
      if (won > 0) {
        alert(`🎉 Congratulations! You won +${won} points!`);
      } else {
        alert(`😢 Oh no! You got 0 points. Try again next time.`);
      }
    }, 4000);
  };

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 shadow-sm">
        <h1 className="text-[17px] font-black text-gray-900 flex items-center gap-2">🎯 Earn Points</h1>
        <div className="flex gap-2">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 font-bold px-3 py-1 rounded-full text-xs flex items-center">
            ⭐ {user?.points || 0} pts
          </div>
          <button onClick={() => navigate('/reward-history')} className="bg-purple-50 text-purple-600 font-bold px-3 py-1 rounded-full text-xs">
            History
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        
        {/* Next Canva Reward Progress */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span>🏆</span>
              <h2 className="font-bold text-sm text-gray-800">Next Canva Reward</h2>
            </div>
            <span className="bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-md text-xs">0 / 20 pts</span>
          </div>
          <p className="text-[11px] text-gray-500 mb-3">Canva Pro • 7 Days</p>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
            <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '0%' }}></div>
          </div>
          <p className="text-[10px] text-gray-400">20 more points needed</p>
        </div>

        {/* EXACT SPIN & EARN WHEEL */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border-2 border-pink-100">
          <div>
            <h2 className="font-black text-sm text-gray-900 flex items-center gap-2">🎡 Spin & Earn</h2>
            <div className="flex gap-1 text-yellow-400 text-[10px] my-1">⭐⭐⭐</div>
            <p className="text-[10px] text-gray-500 font-medium">3/3 Spins</p>
          </div>

          <div className="relative w-[200px] h-[200px] mx-auto my-6">
            {/* The Black Triangle Pointer */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-b-[18px] border-l-transparent border-r-transparent border-b-gray-900 z-20 drop-shadow-md"></div>
            
            {/* The CSS Conic-Gradient Wheel */}
            <div 
              className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-xl relative"
              style={{ 
                /* Shifted by -22.5deg so the Yellow slice perfectly straddles the 12 o'clock pointer line */
                background: 'conic-gradient(from -22.5deg, #FCD34D 0deg 45deg, #F3F4F6 45deg 90deg, #6EE7B7 90deg 135deg, #F3F4F6 135deg 180deg, #93C5FD 180deg 225deg, #FCA5A5 225deg 270deg, #FDBA74 270deg 315deg, #C4B5FD 315deg 360deg)',
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
              }}
            >
              {/* Perfectly rotated text labels */}
              {labels.map((lbl, i) => (
                <div 
                  key={i}
                  className="absolute w-full h-full text-center font-black text-sm pt-3 flex justify-center"
                  style={{ transform: `rotate(${i * 45}deg)` }}
                >
                  <span className={`drop-shadow-sm ${lbl === '0' ? 'text-gray-400' : 'text-gray-800/80'}`}>{lbl}</span>
                </div>
              ))}

              {/* Center Cutout Circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full border-[5px] border-purple-500 shadow-md z-10"></div>
            </div>
          </div>

          {/* Bold Black Spin Button */}
          <button 
            onClick={handleSpin} 
            disabled={isSpinning} 
            className="w-full bg-[#111827] disabled:bg-gray-400 text-white font-black py-4 rounded-2xl shadow-md text-sm tracking-widest active:scale-95 transition-transform"
          >
            {isSpinning ? "SPINNING..." : "SPIN"}
          </button>
        </div>

        {/* Daily Check-in */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-black text-sm text-gray-800 flex items-center gap-2 mb-4">📅 Daily Check-in</h2>
          <div className="flex justify-between gap-1 mb-5">
            {checkInRewards.map((pts, i) => {
              const day = i + 1;
              const isActive = day <= currentStreak;
              const isSpecial = day === 7;
              
              return (
                <div key={i} className={`flex flex-col items-center justify-center w-11 h-11 rounded-full border-2 shadow-sm
                  ${isActive ? 'border-purple-300 bg-purple-50' : 'border-gray-100 bg-white'}`}
                >
                  <span className={`text-[10px] font-bold ${isActive ? 'text-purple-600' : 'text-gray-400'}`}>D{day}</span>
                  <span className={`text-[9px] font-black ${isActive ? 'text-purple-600' : (isSpecial ? 'text-yellow-500' : 'text-gray-300')}`}>+{pts}</span>
                </div>
              )
            })}
          </div>
          <button 
            onClick={handleCheckIn} 
            disabled={hasCheckedInToday} 
            className={`w-full font-bold py-3.5 rounded-xl shadow-md text-xs transition-colors ${hasCheckedInToday ? 'bg-gray-100 text-gray-400' : 'bg-[#10B981] text-white active:scale-95'}`}
          >
            {hasCheckedInToday ? "✅ Checked-in for today" : "CHECK-IN — Today's Reward: +1 pt"}
          </button>
        </div>

      </div>
    </div>
  );
}