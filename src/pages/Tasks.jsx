import React, { useState, useEffect } from 'react';
import { useTelegram } from '../contexts/TelegramContext';
import { useTasks } from '../hooks/useTasks';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';

export default function Tasks() {
  const { user, setUser } = useTelegram();
  const { updatePoints, processCheckIn } = useTasks();
  const navigate = useNavigate();
  
  // Wheel & Accordion State
  const [isSpinOpen, setIsSpinOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [adZone, setAdZone] = useState("");

  // Fetch Monetag Direct Link Zone ID
  useEffect(() => {
    supabase.from('app_settings').select('value').eq('key', 'MONETAG_ZONE_ID').maybeSingle().then(({data}) => {
      if (data) setAdZone(data.value);
    });
  }, []);

  // Wheel configuration matching your screenshot
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
    
    const prizeIndex = Math.floor(Math.random() * prizes.length);
    const won = prizes[prizeIndex];

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
      setIsSpinOpen(false); // Auto-close accordion after spinning
    }, 4000);
  };

  // Live Monetag Direct Link Ad Integration
  const handleWatchAd = () => {
    // Open Monetag Direct Link ad safely without breaking Telegram window
    const adUrl = adZone ? `https://go.oclasrv.com/afu.php?zoneid=${adZone}` : "https://monetag.com";
    window.open(adUrl, '_blank');
    
    // Simulate rewarding point after returning to app
    setTimeout(async () => {
      const newTotal = (user?.points || 0) + 1;
      await updatePoints(newTotal);
      setUser({ ...user, points: newTotal });
    }, 5000); // 5-second buffer to ensure they viewed the ad
  };

  const handleVerifyChannel = async () => {
     const newTotal = (user?.points || 0) + 2;
     await updatePoints(newTotal);
     setUser({ ...user, points: newTotal });
     alert("✅ Verified! +2 Points added.");
  };

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 shadow-sm relative z-10">
        <h1 className="text-[17px] font-black text-gray-900 flex items-center gap-2">
          <span className="text-red-500 text-xl">🎯</span> Earn Points
        </h1>
        <div className="flex gap-2">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 font-bold px-3 py-1.5 rounded-full text-xs flex items-center gap-1 shadow-sm">
            ⭐ {user?.points || 0} pts
          </div>
          <button onClick={() => navigate('/reward-history')} className="bg-purple-100 text-purple-700 font-black px-4 py-1.5 rounded-full text-xs shadow-sm active:scale-95 transition-transform">
            History
          </button>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-4">
        
        {/* Next Canva Reward Progress */}
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏆</span>
              <h2 className="font-black text-[15px] text-gray-900">Next Canva Reward</h2>
            </div>
            <span className="bg-purple-50 text-purple-600 font-black px-3 py-1 rounded-lg text-[11px] shadow-sm">
              {user?.points || 0} / 20 pts
            </span>
          </div>
          <p className="text-[12px] text-gray-500 font-medium mb-3">Canva Pro • 7 Days</p>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-2.5 overflow-hidden">
            <div className="bg-gray-200 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, ((user?.points || 0) / 20) * 100)}%` }}></div>
          </div>
          <p className="text-[11px] text-gray-400 font-medium">
            {Math.max(0, 20 - (user?.points || 0))} more points needed
          </p>
        </div>

        {/* Spin & Earn (Accordion) */}
        <div className={`bg-white rounded-[24px] p-5 shadow-sm border-2 transition-all ${isSpinOpen ? 'border-pink-100' : 'border-gray-100'} overflow-hidden`}>
          <div className="flex justify-between items-start cursor-pointer select-none" onClick={() => !isSpinning && setIsSpinOpen(!isSpinOpen)}>
            <div>
              <h2 className="font-black text-[15px] text-gray-900 flex items-center gap-2">🎡 Spin & Earn</h2>
              <div className="flex gap-1 text-yellow-400 text-[10px] my-1.5">⭐⭐⭐</div>
              <p className="text-[11px] text-gray-500 font-medium">3/3 Spins</p>
            </div>
            {!isSpinOpen ? (
              <span className="text-[#3B82F6] font-black text-[12px] mt-1">Tap to Spin ➔</span>
            ) : (
              <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-black hover:bg-gray-200 active:scale-95">✕</button>
            )}
          </div>

          {isSpinOpen && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="relative w-[220px] h-[220px] mx-auto my-8">
                {/* The Black Triangle Pointer */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[14px] border-r-[14px] border-b-[20px] border-l-transparent border-r-transparent border-b-gray-900 z-20 drop-shadow-md"></div>
                
                {/* The CSS Conic-Gradient Wheel */}
                <div 
                  className="w-full h-full rounded-full overflow-hidden border-[6px] border-white shadow-2xl relative"
                  style={{ 
                    background: 'conic-gradient(from -22.5deg, #FCD34D 0deg 45deg, #E5E7EB 45deg 90deg, #6EE7B7 90deg 135deg, #E5E7EB 135deg 180deg, #93C5FD 180deg 225deg, #FCA5A5 225deg 270deg, #FDBA74 270deg 315deg, #C4B5FD 315deg 360deg)',
                    transform: `rotate(${rotation}deg)`,
                    transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
                  }}
                >
                  {labels.map((lbl, i) => (
                    <div key={i} className="absolute w-full h-full text-center font-black text-[15px] pt-4 flex justify-center" style={{ transform: `rotate(${i * 45}deg)` }}>
                      <span className={`drop-shadow-sm ${lbl === '0' ? 'text-gray-400' : 'text-gray-800/80'}`}>{lbl}</span>
                    </div>
                  ))}
                  {/* Center Cutout Circle */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full border-[6px] border-purple-500 shadow-md z-10"></div>
                </div>
              </div>

              <button onClick={handleSpin} disabled={isSpinning} className="w-full bg-[#111827] disabled:bg-gray-400 text-white font-black py-4 rounded-2xl shadow-xl text-[14px] tracking-[0.2em] active:scale-95 transition-transform">
                {isSpinning ? "SPINNING..." : "SPIN"}
              </button>
            </div>
          )}
        </div>

        {/* Daily Check-in */}
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
          <h2 className="font-black text-[15px] text-gray-800 flex items-center gap-2 mb-4">📅 Daily Check-in</h2>
          <div className="flex justify-between gap-1 mb-5">
            {checkInRewards.map((pts, i) => {
              const day = i + 1;
              const isActive = day <= currentStreak;
              const isSpecial = day === 7;
              
              return (
                <div key={i} className={`flex flex-col items-center justify-center w-[42px] h-[42px] rounded-full border-2 shadow-sm
                  ${isActive ? 'border-purple-300 bg-purple-50' : 'border-gray-100 bg-white'}`}
                >
                  <span className={`text-[10px] font-bold ${isActive ? 'text-purple-600' : 'text-gray-400'}`}>D{day}</span>
                  <span className={`text-[10px] font-black mt-0.5 ${isActive ? 'text-purple-600' : (isSpecial ? 'text-yellow-500' : 'text-gray-300')}`}>+{pts}</span>
                </div>
              )
            })}
          </div>
          <button 
            onClick={handleCheckIn} 
            disabled={hasCheckedInToday} 
            className={`w-full font-bold py-4 rounded-xl shadow-md text-[13px] transition-colors ${hasCheckedInToday ? 'bg-gray-100 text-gray-400' : 'bg-[#10B981] text-white active:scale-95'}`}
          >
            {hasCheckedInToday ? "✅ Checked-in for today" : "CHECK-IN — Today's Reward: +1 pt"}
          </button>
        </div>

        {/* Watch Ads 01 */}
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-[50px] h-[50px] rounded-full bg-red-50 flex items-center justify-center text-2xl shadow-sm border border-red-100">📺</div>
            <div>
              <h3 className="font-black text-gray-900 text-[15px] mb-0.5">Watch Ads 01</h3>
              <p className="text-[11px] text-gray-500 font-medium">+1 Point / Ad</p>
              <div className="flex gap-1.5 mt-2 items-center">
                {[1,2,3,4,5].map(i => <div key={i} className="w-2 h-2 rounded-full bg-gray-200"></div>)}
                <span className="text-[9px] text-gray-400 font-bold ml-1">0/5</span>
              </div>
            </div>
          </div>
          <button onClick={handleWatchAd} className="bg-[#EF4444] text-white font-black px-4 py-2.5 rounded-xl text-[11px] shadow-sm active:scale-95 transition-transform">
            WATCH ADS
          </button>
        </div>

        {/* Watch Ads 02 */}
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-[50px] h-[50px] rounded-full bg-orange-50 flex items-center justify-center text-2xl shadow-sm border border-orange-100">📺</div>
            <div>
              <h3 className="font-black text-gray-900 text-[15px] mb-0.5">Watch Ads 02</h3>
              <p className="text-[11px] text-gray-500 font-medium">+1 Point / Ad</p>
              <div className="flex gap-1.5 mt-2 items-center">
                {[1,2,3,4,5].map(i => <div key={i} className="w-2 h-2 rounded-full bg-gray-200"></div>)}
                <span className="text-[9px] text-gray-400 font-bold ml-1">0/5</span>
              </div>
            </div>
          </div>
          <button onClick={handleWatchAd} className="bg-[#EF4444] text-white font-black px-4 py-2.5 rounded-xl text-[11px] shadow-sm active:scale-95 transition-transform">
            WATCH ADS
          </button>
        </div>

        {/* Join Channel 01 */}
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-[50px] h-[50px] rounded-full bg-blue-50 flex items-center justify-center text-2xl shadow-sm border border-blue-100">📢</div>
            <div>
              <h3 className="font-black text-gray-900 text-[15px] mb-0.5">Join Channel 01</h3>
              <p className="text-[11px] text-gray-500 font-medium">+2 pts · One time <span className="text-gray-400 font-bold ml-1">96 / 1000</span></p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.open('https://t.me/yourchannel', '_blank')} className="bg-[#3B82F6] text-white font-black px-4 py-2.5 rounded-xl text-[11px] shadow-sm active:scale-95">JOIN</button>
            <button onClick={handleVerifyChannel} className="bg-gray-50 text-gray-500 border border-gray-200 font-bold px-3 py-2.5 rounded-xl text-[11px] flex items-center gap-1 active:scale-95">
              ✓ Verify
            </button>
          </div>
        </div>

        {/* Join Channel 02 */}
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-[50px] h-[50px] rounded-full bg-cyan-50 flex items-center justify-center text-2xl shadow-sm border border-cyan-100">📢</div>
            <div>
              <h3 className="font-black text-gray-900 text-[15px] mb-0.5">Join Channel 02</h3>
              <p className="text-[11px] text-gray-500 font-medium">+2 pts · One time <span className="text-gray-400 font-bold ml-1">91 / 1000</span></p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.open('https://t.me/yourchannel2', '_blank')} className="bg-[#3B82F6] text-white font-black px-4 py-2.5 rounded-xl text-[11px] shadow-sm active:scale-95">JOIN</button>
            <button onClick={handleVerifyChannel} className="bg-gray-50 text-gray-500 border border-gray-200 font-bold px-3 py-2.5 rounded-xl text-[11px] flex items-center gap-1 active:scale-95">
              ✓ Verify
            </button>
          </div>
        </div>

        {/* Invite Friends */}
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-[50px] h-[50px] rounded-full bg-yellow-50 flex items-center justify-center text-2xl shadow-sm border border-yellow-100">👥</div>
            <div>
              <h3 className="font-black text-gray-900 text-[15px] mb-0.5">Invite Friends</h3>
              <p className="text-[11px] text-gray-500 font-medium">+5 pts / referral · Unlimited</p>
            </div>
          </div>
          <button onClick={() => {
            navigator.clipboard.writeText(`https://t.me/ShareCanvaProFree_Bot?startapp=${user?.telegramId}`);
            alert("✅ Invite link copied!");
          }} className="bg-[#06B6D4] text-white font-black px-4 py-2.5 rounded-xl text-[11px] shadow-sm flex items-center gap-1.5 active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            COPY
          </button>
        </div>

      </div>
    </div>
  );
}