import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelegram } from '../contexts/TelegramContext';
import { supabase } from '../api/supabase';

export default function RewardHistory() {
  const { user } = useTelegram();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.telegramId) {
      fetchHistory();
    }
  }, [user?.telegramId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('task_history')
        .select('*')
        .eq('telegram_id', String(user.telegramId))
        .order('created_at', { ascending: false });

      if (data && !error) {
        setHistory(data);
      }
    } catch (err) {
      console.error("Error fetching history", err);
    }
    setLoading(false);
  };

  // Group history items by Date string (e.g., "08/29/2026")
  const groupedHistory = history.reduce((acc, item) => {
    const dateObj = new Date(item.created_at);
    // Format Date: MM/DD/YYYY
    const dateKey = `${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getDate()).padStart(2, '0')}/${dateObj.getFullYear()}`;
    
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {});

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
      {/* 📍 HISTORY HEADER BAR (Header Bottom)                     */}
      {/* ========================================================= */}
      <div className="bg-white px-4 py-4 flex items-center gap-3 shadow-sm border-b border-gray-100 relative z-30">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:bg-gray-100 p-1.5 rounded-lg active:scale-95 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <div>
          <h1 className="text-[16px] font-black text-gray-900 flex items-center gap-2">
            <span className="text-[18px]">📋</span> Reward History
          </h1>
          {history.length > 0 && (
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">{history.length} total rewards earned</p>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 pt-5 pb-8 relative z-30">
        {loading ? (
          <div className="text-center py-10 flex flex-col items-center">
            <span className="text-3xl animate-spin mb-3">⏳</span>
            <span className="text-xs text-gray-400 font-bold">Loading records...</span>
          </div>
        ) : history.length === 0 ? (
          
          /* Empty State */
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[24px] p-8 text-center shadow-sm border border-gray-100 mt-2">
            <div className="text-5xl mb-3 opacity-80">📬</div>
            <h2 className="text-[15px] font-black text-gray-900 mb-1">No rewards yet</h2>
            <p className="text-[12px] text-gray-400 font-medium">Complete tasks to start earning points!</p>
          </motion.div>

        ) : (
          
          /* Populated History */
          <div className="space-y-6">
            <AnimatePresence>
              {Object.keys(groupedHistory).map((dateStr, groupIndex) => (
                <motion.div 
                  key={dateStr}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: groupIndex * 0.1 }}
                >
                  <h3 className="text-[12px] font-bold text-gray-500 mb-3 ml-1 tracking-wide uppercase">{dateStr}</h3>
                  
                  <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                    {groupedHistory[dateStr].map((task, index) => {
                      const timeStr = new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const isLast = index === groupedHistory[dateStr].length - 1;
                      
                      return (
                        <div key={task.id} className={`p-4 flex items-center justify-between ${!isLast ? 'border-b border-gray-50' : ''}`}>
                          
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-lg shadow-sm border border-gray-100">
                              {task.icon}
                            </div>
                            <div>
                              <div className="font-bold text-[14px] text-gray-900 mb-0.5">{task.task_name}</div>
                              <div className="text-[10px] text-gray-400 font-medium">{timeStr}</div>
                            </div>
                          </div>

                          <div className={`font-black text-[15px] ${task.points_earned > 0 ? 'text-[#10B981]' : 'text-gray-400'}`}>
                            {task.points_earned > 0 ? `+${task.points_earned}` : task.points_earned}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            <div className="text-center pt-4 pb-2">
              <span className="text-[11px] text-gray-400 font-medium">All rewards loaded ✓</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}