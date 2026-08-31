import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTelegram } from '../contexts/TelegramContext';
import { useTasks } from '../hooks/useTasks';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';

export default function Tasks() {
  const { user, setUser } = useTelegram();
  const { updatePoints, processCheckIn } = useTasks();
  const navigate = useNavigate();
  
  // States
  const [isSpinOpen, setIsSpinOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [adZone, setAdZone] = useState("");
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [checkInTimer, setCheckInTimer] = useState("");
  const [mathA, setMathA] = useState(0);
  const [mathB, setMathB] = useState(0);
  const [mathOp, setMathOp] = useState('+');
  const [mathAns, setMathAns] = useState('');
  
  // Dynamic Admin Tasks State
  const [dynamicTasks, setDynamicTasks] = useState([]);

  // Task Completion Tracker
  const [taskState, setTaskState] = useState({
    ads1: 0, ads2: 0, spins: 0, math: 0,
    channel1: false, channel2: false,
    lastDate: new Date().toDateString()
  });
  const [verifying, setVerifying] = useState(null);

  const generateMath = () => {
    const ops = ['+', '-'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a = Math.floor(Math.random() * 20) + 1;
    let b = Math.floor(Math.random() * 20) + 1;
    if (op === '-' && a < b) { let temp = a; a = b; b = temp; }
    setMathA(a); setMathB(b); setMathOp(op); setMathAns('');
  };

  useEffect(() => {
    generateMath();

    // Fetch Dynamic Tasks
    supabase.from('dynamic_tasks').select('*').order('created_at', { ascending: true }).then(({data}) => {
      if(data) setDynamicTasks(data);
    });

    supabase.from('app_settings').select('value').eq('key', 'MONETAG_ZONE_ID').maybeSingle().then(({data}) => {
      if (data && data.value) {
        const zoneId = data.value;
        setAdZone(zoneId);
        if (!document.getElementById(`monetag-sdk-${zoneId}`)) {
          const script = document.createElement('script');
          script.id = `monetag-sdk-${zoneId}`;
          script.src = '//libtl.com/sdk.js';
          script.setAttribute('data-zone', zoneId);
          script.setAttribute('data-sdk', `show_${zoneId}`);
          script.defer = true;
          document.head.appendChild(script);
        }
      }
    });

    if (user?.telegramId) {
      const savedTasks = localStorage.getItem(`tasks_${user.telegramId}`);
      if (savedTasks) {
        const parsed = JSON.parse(savedTasks);
        if (parsed.lastDate !== new Date().toDateString()) {
          // Smart Reset: Reset all integers (daily tasks) to 0, keep booleans (one-time tasks)
          Object.keys(parsed).forEach(key => {
            if (key === 'lastDate' || typeof parsed[key] === 'boolean') return;
            parsed[key] = 0; 
          });
          parsed.lastDate = new Date().toDateString();
        }
        if (parsed.math === undefined) parsed.math = 0;
        setTaskState(parsed);
      }
    }
  }, [user?.telegramId]);

  // Strict 24-Hour Timer
  useEffect(() => {
    if (!user?.last_checkin) { setCanCheckIn(true); return; }
    const interval = setInterval(() => {
      const diff = (new Date(user.last_checkin).getTime() + (24 * 60 * 60 * 1000)) - new Date().getTime();
      if (diff <= 0) { setCanCheckIn(true); setCheckInTimer(""); clearInterval(interval); } 
      else {
        setCanCheckIn(false);
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setCheckInTimer(`${h}h ${m}m ${s}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [user?.last_checkin]);

  useEffect(() => { if (user?.telegramId) localStorage.setItem(`tasks_${user.telegramId}`, JSON.stringify(taskState)); }, [taskState, user?.telegramId]);

  const prizes = [10, 0, 1, 0, 2, 0, 5, 1];
  const labels = ['+10', '0', '+1', '0', '+2', '0', '+5', '+1'];
  const currentStreak = user?.streak || 0;

  const openExternalLink = (url) => {
    const tg = window.Telegram?.WebApp;
    // tg.openTelegramLink is better for t.me links if available
    if (url.includes('t.me') && tg && tg.openTelegramLink) {
      tg.openTelegramLink(url);
    } else if (tg && tg.openLink) { 
      tg.openLink(url); 
    } else { 
      const a = document.createElement('a'); 
      a.href = url; 
      a.target = '_blank'; 
      a.rel = 'noopener noreferrer'; 
      document.body.appendChild(a); 
      a.click(); 
      document.body.removeChild(a); 
    }
  };

  const triggerAd = (onSuccess, onFail) => {
    const adFunctionName = `show_${adZone}`;
    if (adZone && typeof window[adFunctionName] === "function") {
      window[adFunctionName]().then(() => onSuccess()).catch(() => { alert("⚠️ Ad failed to load."); if (onFail) onFail(); });
    } else {
      const adUrl = adZone ? `https://go.oclasrv.com/afu.php?zoneid=${adZone}` : "https://monetag.com";
      openExternalLink(adUrl);
      setTimeout(() => onSuccess(), 6000); 
    }
  };

  // --- STANDARD HANDLERS ---
  const handleCheckIn = () => {
    if (!canCheckIn) return alert(`⏳ Please wait ${checkInTimer} before checking in again!`);
    triggerAd(async () => {
      let newStreak = 1;
      const now = new Date().getTime();
      const lastTime = new Date(user?.last_checkin || 0).getTime();
      if (user?.last_checkin && now - lastTime <= 48 * 60 * 60 * 1000) { newStreak = Math.min(currentStreak + 1, 7); } 
      else if (user?.last_checkin) { alert("⚠️ You missed the 48-hour window! Your streak has reset to Day 1."); }
      const todayIso = new Date().toISOString();
      const pointsEarned = [1, 1, 1, 2, 2, 2, 3][newStreak - 1];
      const newTotal = await processCheckIn({ newStreak, dateStr: todayIso, pointsEarned });
      setUser({ ...user, streak: newStreak, last_checkin: todayIso, points: newTotal });
      alert(`✅ Checked in for Day ${newStreak}! +${pointsEarned} Points`);
    });
  };

  const handleMathSubmit = () => {
    if (taskState.math >= 5) return alert("✅ Daily math limit reached! Come back tomorrow.");
    const correctAns = mathOp === '+' ? mathA + mathB : mathA - mathB;
    if (parseInt(mathAns) !== correctAns) return alert("❌ Incorrect answer! Please try again.");
    triggerAd(async () => {
      const newTotal = (user?.points || 0) + 1;
      await updatePoints(newTotal, 'Solve & Earn', 1, '🧮');
      setUser({ ...user, points: newTotal });
      setTaskState(prev => ({ ...prev, math: (prev.math || 0) + 1 }));
      generateMath();
      alert("✅ Correct! +1 Point added.");
    });
  };

  const handleSpin = () => {
    if (isSpinning) return;
    if (taskState.spins >= 3) return alert("✅ Daily spin limit reached! Come back tomorrow.");
    triggerAd(() => {
      setIsSpinning(true);
      const prizeIndex = Math.floor(Math.random() * prizes.length);
      const won = prizes[prizeIndex];
      setRotation(rotation + (360 * 5) + (360 - (prizeIndex * 45)) - (rotation % 360));
      setTimeout(async () => {
        setIsSpinning(false);
        const newTotal = (user?.points || 0) + won;
        await updatePoints(newTotal, 'Spin & Earn', won, '🎡');
        setUser({ ...user, points: newTotal });
        setTaskState(prev => ({ ...prev, spins: (prev.spins || 0) + 1 }));
        alert(won > 0 ? `🎉 Congratulations! You won +${won} points!` : `😢 Oh no! You got 0 points. Try again next time.`);
      }, 4000);
    });
  };

  const handleWatchAd = (taskKey, maxCount) => {
    if (taskState[taskKey] >= maxCount) return alert("✅ Daily limit reached for this task!");
    triggerAd(async () => {
      const newTotal = (user?.points || 0) + 1;
      const taskName = taskKey === 'ads1' ? 'Watch Ads 01' : 'Watch Ads 02';
      await updatePoints(newTotal, taskName, 1, '📺');
      setUser({ ...user, points: newTotal });
      setTaskState(prev => ({ ...prev, [taskKey]: prev[taskKey] + 1 }));
      alert("✅ Ad completed! +1 Point added.");
    });
  };

  const handleVerifyChannel = (channelKey, points) => {
    if (taskState[channelKey]) return alert("✅ You have already verified this channel!");
    setVerifying(channelKey);
    triggerAd(async () => {
      const newTotal = (user?.points || 0) + points;
      const channelName = channelKey === 'channel1' ? 'Join Channel 01' : 'Join Channel 02';
      await updatePoints(newTotal, channelName, points, '📢');
      setUser({ ...user, points: newTotal });
      setTaskState(prev => ({ ...prev, [channelKey]: true }));
      setVerifying(null);
      alert(`✅ Channel Verified! +${points} Points added.`);
    }, () => setVerifying(null));
  };

  // --- DYNAMIC TASK HANDLER ---
  const handleDynamicTask = (task) => {
    const taskKey = `custom_${task.id}`;
    
    // Check Limits
    if (!task.is_daily && taskState[taskKey] === true) return alert("✅ You have already completed this one-time task!");
    if (task.is_daily && taskState[taskKey] >= 1) return alert("✅ You have already completed this daily task today! Come back tomorrow.");

    setVerifying(taskKey);

    const runTaskLogic = () => {
      openExternalLink(task.action_url); 
      
      setTimeout(async () => {
        const newTotal = (user?.points || 0) + task.points_reward;
        
        await updatePoints(newTotal, task.title, task.points_reward, task.icon);
        setUser({ ...user, points: newTotal });
        
        setTaskState(prev => ({ ...prev, [taskKey]: task.is_daily ? 1 : true }));
        setVerifying(null);
        alert(`✅ Task Verified! +${task.points_reward} Points added.`);
      }, 8000);
    };

    if (task.requires_ad) {
      triggerAd(runTaskLogic, () => setVerifying(null));
    } else {
      runTaskLogic();
    }
  };

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24 relative overflow-x-hidden">
      
      {/* ========================================================= */}
      {/* 🌟 UPGRADED PREMIUM HEADER BANNER 🌟                        */}
      {/* ========================================================= */}
      <div className="relative w-full h-[150px] bg-gradient-to-br from-[#00C4CC] via-[#7B2CBF] to-[#6200EA] flex items-center justify-center overflow-hidden">
        
        {/* Ambient Glows */}
        <div className="absolute top-[-20px] left-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none z-0"></div>
        <div className="absolute bottom-[-30px] right-[-10px] w-40 h-40 bg-[#00E5FF]/20 rounded-full blur-[40px] pointer-events-none z-0"></div>
        
        {/* Animated Floating Particles */}
        <motion.div animate={{ y: [0, -10, 0], opacity: [0.3, 0.8, 0.3] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="absolute top-6 left-10 text-white/50 text-[10px] select-none z-10">✨</motion.div>
        <motion.div animate={{ y: [0, 10, 0], opacity: [0.2, 0.6, 0.2] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }} className="absolute bottom-8 right-12 text-white/40 text-[14px] select-none z-10">✦</motion.div>

        {/* Canva Logo + PRO Badge */}
        <div className="relative z-20 flex items-center justify-center gap-1.5 drop-shadow-xl mt-2">
          <h1 className="text-[52px] font-bold text-white tracking-tighter" style={{ fontFamily: 'Georgia, serif' }}>
            Canva
          </h1>
          <motion.div 
            initial={{ scale: 0.8, rotate: 0 }}
            animate={{ scale: 1, rotate: 3 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
            className="bg-gradient-to-tr from-[#FFD700] via-[#F59E0B] to-[#FFD700] text-[#5B3A00] font-black text-[11px] px-2 py-0.5 rounded-[6px] uppercase tracking-widest shadow-[0_4px_10px_rgba(245,158,11,0.4)] -mt-8 border border-yellow-200/50"
          >
            Pro
          </motion.div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 📍 POINTS & HISTORY BAR (Moved to Header Bottom)          */}
      {/* ========================================================= */}
      <div className="bg-white px-4 py-3.5 flex items-center justify-between shadow-sm border-b border-gray-100 relative z-30">
        <h1 className="text-[16px] font-black text-gray-900 flex items-center gap-2">
          <span className="text-[18px]">🎯</span> Earn Points
        </h1>
        <div className="flex gap-2">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 font-bold px-3 py-1.5 rounded-full text-xs shadow-sm flex items-center gap-1">
            ⭐ {user?.points || 0} pts
          </div>
          <button onClick={() => navigate('/reward-history')} className="bg-purple-50 text-[#6200EA] font-black px-4 py-1.5 rounded-full text-xs shadow-[0_2px_10px_rgba(98,0,234,0.05)] active:scale-95 transition-transform border border-purple-100">
            History
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 pt-5 space-y-4 relative z-30">
        
        {/* Next Canva Reward Progress */}
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 mt-2">
          <div className="flex justify-between items-center mb-2.5">
            <div className="flex items-center gap-2"><span className="text-xl">🏆</span><h2 className="font-black text-[15px] text-gray-900">Next Canva Reward</h2></div>
            <span className="bg-purple-50 text-purple-600 font-black px-3 py-1 rounded-lg text-[11px] shadow-sm">{user?.points || 0} / 49 pts</span>
          </div>
          <p className="text-[12px] text-gray-500 font-medium mb-3">Canva Pro • 7 Days</p>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-2.5 overflow-hidden"><div className="bg-gray-200 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, ((user?.points || 0) / 49) * 100)}%` }}></div></div>
          <p className="text-[11px] text-gray-400 font-medium">{Math.max(0, 49 - (user?.points || 0))} more points needed</p>
        </div>

        {/* ================================================= */}
        {/* 🚀 NEW: DYNAMIC ADMIN TASKS SECTIONS              */}
        {/* ================================================= */}
        {dynamicTasks.length > 0 && (
          <>
            <div className="flex items-center gap-2 my-6">
              <div className="h-[1px] bg-gray-200 flex-1"></div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Premium Tasks</span>
              <div className="h-[1px] bg-gray-200 flex-1"></div>
            </div>

            {dynamicTasks.map((task) => {
              const taskKey = `custom_${task.id}`;
              const isCompleted = !task.is_daily ? taskState[taskKey] === true : taskState[taskKey] >= 1;
              const isVerifying = verifying === taskKey;

              return (
                <div key={task.id} className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex justify-between items-center relative overflow-hidden">
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-[50px] h-[50px] rounded-full bg-blue-50 flex items-center justify-center text-2xl shadow-sm border border-blue-100">{task.icon}</div>
                    <div>
                      <h3 className="font-black text-gray-900 text-[15px] mb-0.5">{task.title}</h3>
                      <p className="text-[11px] text-gray-500 font-medium">{task.description}</p>
                      <div className="mt-1.5 flex gap-1.5">
                        <span className="bg-yellow-100 text-yellow-700 text-[9px] font-black px-2 py-0.5 rounded uppercase">+{task.points_reward} pts</span>
                        {task.is_daily && <span className="bg-gray-100 text-gray-600 text-[9px] font-black px-2 py-0.5 rounded uppercase">Daily</span>}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDynamicTask(task)}
                    disabled={isCompleted || isVerifying}
                    className={`relative z-10 font-black px-4 py-2.5 rounded-xl text-[11px] shadow-sm flex items-center gap-1 transition-all ${
                      isCompleted ? 'bg-green-50 text-green-500 border border-green-200 shadow-none' : 
                      isVerifying ? 'bg-gray-100 text-gray-500 border border-gray-200 shadow-none' : 
                      'bg-blue-600 text-white active:scale-95'
                    }`}
                  >
                    {isCompleted ? '✅ DONE' : isVerifying ? '⏳ WAIT...' : 'DO TASK'}
                  </button>
                </div>
              );
            })}

            <div className="flex items-center gap-2 my-6">
              <div className="h-[1px] bg-gray-200 flex-1"></div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Standard Tasks</span>
              <div className="h-[1px] bg-gray-200 flex-1"></div>
            </div>
          </>
        )}

        {/* --- STANDARD TASKS BELOW --- */}

        {/* Spin & Earn */}
        <div className={`bg-white rounded-[24px] p-5 shadow-sm border-2 transition-all ${isSpinOpen ? 'border-pink-100' : 'border-gray-100'} overflow-hidden`}>
          <div className="flex justify-between items-start cursor-pointer select-none" onClick={() => !isSpinning && setIsSpinOpen(!isSpinOpen)}>
            <div><h2 className="font-black text-[15px] text-gray-900 flex items-center gap-2">🎡 Spin & Earn</h2><div className="flex gap-1 text-yellow-400 text-[10px] my-1.5">⭐⭐⭐</div><p className="text-[11px] text-gray-500 font-medium">{Math.max(0, 3 - (taskState.spins || 0))}/3 Spins Left</p></div>
            {!isSpinOpen ? <span className="text-[#3B82F6] font-black text-[12px] mt-1">Tap to Spin ➔</span> : <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-black hover:bg-gray-200">✕</button>}
          </div>
          {isSpinOpen && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="relative w-[220px] h-[220px] mx-auto my-8">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[14px] border-r-[14px] border-b-[20px] border-l-transparent border-r-transparent border-b-gray-900 z-20"></div>
                <div className="w-full h-full rounded-full overflow-hidden border-[6px] border-white shadow-2xl relative" style={{ background: 'conic-gradient(from -22.5deg, #FCD34D 0deg 45deg, #E5E7EB 45deg 90deg, #6EE7B7 90deg 135deg, #E5E7EB 135deg 180deg, #93C5FD 180deg 225deg, #FCA5A5 225deg 270deg, #FDBA74 270deg 315deg, #C4B5FD 315deg 360deg)', transform: `rotate(${rotation}deg)`, transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none' }}>
                  {labels.map((lbl, i) => (<div key={i} className="absolute w-full h-full text-center font-black text-[15px] pt-4 flex justify-center" style={{ transform: `rotate(${i * 45}deg)` }}><span className={`drop-shadow-sm ${lbl === '0' ? 'text-gray-400' : 'text-gray-800/80'}`}>{lbl}</span></div>))}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full border-[6px] border-purple-500 shadow-md z-10"></div>
                </div>
              </div>
              <button onClick={handleSpin} disabled={isSpinning || taskState.spins >= 3} className="w-full bg-[#111827] disabled:bg-gray-400 text-white font-black py-4 rounded-2xl shadow-xl text-[14px] tracking-[0.2em] active:scale-95 transition-transform">
                {taskState.spins >= 3 ? "COME BACK TOMORROW" : isSpinning ? "SPINNING..." : "WATCH AD TO SPIN"}
              </button>
            </div>
          )}
        </div>

        {/* 24-Hour Strict Daily Check-in */}
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
          <h2 className="font-black text-[15px] text-gray-800 flex items-center gap-2 mb-4">📅 Daily Check-in</h2>
          <div className="flex justify-between gap-1 mb-5">
            {[1,1,1,2,2,2,3].map((pts, i) => {
              const day = i + 1;
              const isActive = day <= currentStreak;
              return (
                <div key={i} className={`flex flex-col items-center justify-center w-[42px] h-[42px] rounded-full border-2 shadow-sm ${isActive ? 'border-purple-300 bg-purple-50' : 'border-gray-100 bg-white'}`}>
                  <span className={`text-[10px] font-bold ${isActive ? 'text-purple-600' : 'text-gray-400'}`}>D{day}</span>
                  <span className={`text-[10px] font-black mt-0.5 ${isActive ? 'text-purple-600' : (day === 7 ? 'text-yellow-500' : 'text-gray-300')}`}>+{pts}</span>
                </div>
              )
            })}
          </div>
          <button onClick={handleCheckIn} disabled={!canCheckIn} className={`w-full font-bold py-4 rounded-xl shadow-md text-[13px] transition-colors ${!canCheckIn ? 'bg-gray-100 text-gray-500' : 'bg-[#10B981] text-white active:scale-95'}`}>
            {!canCheckIn ? `⏳ Wait ${checkInTimer}` : "WATCH AD TO CHECK-IN"}
          </button>
        </div>

        {/* Solve & Earn (Math Task) */}
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4"><div className="w-[50px] h-[50px] rounded-full bg-indigo-50 flex items-center justify-center text-2xl shadow-sm border border-indigo-100">🧮</div><div><h3 className="font-black text-gray-900 text-[15px] mb-0.5">Solve & Earn</h3><p className="text-[11px] text-gray-500 font-medium">+1 Point / Correct Answer</p></div></div>
            <div className="flex gap-1.5 items-center">{[1,2,3,4,5].map(i => <div key={i} className={`w-2 h-2 rounded-full ${i <= (taskState.math || 0) ? 'bg-indigo-400' : 'bg-gray-200'}`}></div>)}</div>
          </div>
          <div className="flex gap-2 items-center">
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-black text-gray-800 text-[18px] tracking-widest text-center flex-1 shadow-inner">{mathA} {mathOp} {mathB} = ?</div>
            <input type="number" value={mathAns} onChange={(e) => setMathAns(e.target.value)} placeholder="Ans" className="w-16 bg-white border border-gray-200 rounded-xl px-2 py-3 font-bold text-center outline-none focus:border-indigo-400"/>
            <button onClick={handleMathSubmit} className="bg-[#6366F1] text-white font-black px-4 py-3 rounded-xl text-[12px] shadow-sm active:scale-95">SOLVE</button>
          </div>
        </div>

        {/* Watch Ads 01 */}
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-4"><div className="w-[50px] h-[50px] rounded-full bg-red-50 flex items-center justify-center text-2xl shadow-sm border border-red-100">📺</div><div><h3 className="font-black text-gray-900 text-[15px] mb-0.5">Watch Ads 01</h3><p className="text-[11px] text-gray-500 font-medium">+1 Point / Ad</p><div className="flex gap-1.5 mt-2 items-center">{[1,2,3,4,5].map(i => <div key={i} className={`w-2 h-2 rounded-full ${i <= taskState.ads1 ? 'bg-red-400' : 'bg-gray-200'}`}></div>)}<span className="text-[9px] text-gray-400 font-bold ml-1">{taskState.ads1}/5</span></div></div></div>
          <button onClick={() => handleWatchAd('ads1', 5)} className="bg-[#EF4444] text-white font-black px-4 py-2.5 rounded-xl text-[11px] shadow-sm active:scale-95">WATCH ADS</button>
        </div>

        {/* Watch Ads 02 */}
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-4"><div className="w-[50px] h-[50px] rounded-full bg-orange-50 flex items-center justify-center text-2xl shadow-sm border border-orange-100">📺</div><div><h3 className="font-black text-gray-900 text-[15px] mb-0.5">Watch Ads 02</h3><p className="text-[11px] text-gray-500 font-medium">+1 Point / Ad</p><div className="flex gap-1.5 mt-2 items-center">{[1,2,3,4,5].map(i => <div key={i} className={`w-2 h-2 rounded-full ${i <= taskState.ads2 ? 'bg-orange-400' : 'bg-gray-200'}`}></div>)}<span className="text-[9px] text-gray-400 font-bold ml-1">{taskState.ads2}/5</span></div></div></div>
          <button onClick={() => handleWatchAd('ads2', 5)} className="bg-[#EF4444] text-white font-black px-4 py-2.5 rounded-xl text-[11px] shadow-sm active:scale-95">WATCH ADS</button>
        </div>

        {/* Join Channel 01 */}
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-4"><div className="w-[50px] h-[50px] rounded-full bg-blue-50 flex items-center justify-center text-2xl shadow-sm border border-blue-100">📢</div><div><h3 className="font-black text-gray-900 text-[15px] mb-0.5">Join Channel 01</h3><p className="text-[11px] text-gray-500 font-medium">+2 pts · One time</p></div></div>
          <div className="flex gap-2">
            <button onClick={() => openExternalLink('https://t.me/CanvaProMiniApp')} className="bg-[#3B82F6] text-white font-black px-4 py-2.5 rounded-xl text-[11px] shadow-sm active:scale-95">JOIN</button>
            <button onClick={() => handleVerifyChannel('channel1', 2)} disabled={taskState.channel1 || verifying === 'channel1'} className={`font-bold px-3 py-2.5 rounded-xl text-[11px] flex items-center gap-1 border ${taskState.channel1 ? 'bg-green-50 text-green-500 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200 active:scale-95'}`}>{taskState.channel1 ? '✅ Verified' : verifying === 'channel1' ? '⏳ Wait...' : '✓ Verify'}</button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 🎁 UPGRADED: PREMIUM INVITE FRIENDS CARD                  */}
        {/* ========================================================= */}
        <div className="bg-gradient-to-br from-[#EEF2FF] to-[#F3E8FF] rounded-[24px] p-6 shadow-sm border border-[#E0E7FF] relative overflow-hidden mt-2">
          {/* Decorative Blur Background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C7D2FE] rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none opacity-60"></div>
          
          <div className="relative z-10 flex flex-col gap-4">
            
            {/* Header section */}
            <div className="flex items-center gap-4">
              <div className="w-[54px] h-[54px] rounded-[16px] bg-white flex items-center justify-center text-3xl shadow-sm border border-white">
                🎁
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-[17px] mb-0.5 tracking-tight">Invite & Earn Big!</h3>
                <p className="text-[12px] text-gray-600 font-medium">Get <span className="font-black text-[#6200EA]">+5 Points</span> for every friend who joins.</p>
              </div>
            </div>

            {/* Beautiful Link Display Box */}
            <div className="bg-white/70 backdrop-blur-md border border-white rounded-xl p-1.5 flex items-center gap-2 shadow-inner">
              <div className="flex-1 truncate px-3 text-[11px] font-bold text-gray-500 select-none">
                https://t.me/CanvaProMiniAppBot?startapp={user?.telegramId || '123'}
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`https://t.me/CanvaProMiniAppBot?startapp=${user?.telegramId}`);
                  alert("✅ Invite link copied! Share it to earn +5 pts automatically when they join.");
                }} 
                className="bg-white hover:bg-gray-50 text-[#6200EA] font-black px-4 py-2.5 rounded-lg text-[10px] shadow-sm transition-colors border border-gray-100 active:scale-95 flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                COPY
              </button>
            </div>

            {/* Giant Share Button */}
            <button 
              onClick={() => {
                const inviteLink = `https://t.me/CanvaProMiniAppBot?startapp=${user?.telegramId}`;
                // This payload directly injects the link into the exact location
                const shareText = `🌟 Unlock Canva Pro for FREE! 🎨✨\n\nI just got premium access, and you can too! Complete simple tasks, spin the wheel, and claim your Canva Pro invite link instantly. 🎁\n\n👇 Click my link below to start earning:\n${inviteLink}\n\nLet's earn together! 🚀`;
                
                openExternalLink(`https://t.me/share/url?text=${encodeURIComponent(shareText)}`);
              }} 
              className="w-full bg-gradient-to-r from-[#24A1DE] to-[#1C8ACB] text-white font-black py-3.5 rounded-xl text-[14px] shadow-[0_4px_15px_rgba(36,161,222,0.3)] active:scale-95 transition-transform flex justify-center items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              SHARE TO TELEGRAM
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}