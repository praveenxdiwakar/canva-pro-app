import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useTelegram } from '../contexts/TelegramContext';
import SpinEarnCard from '../components/SpinEarnCard';

export default function Tasks() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { initData } = useTelegram();

  return (
    <div className="flex flex-col min-h-[calc(100dvh-5rem)] bg-[#f5f5f5] pb-24">
      {/* Banner Area */}
      <div className="relative w-full h-44 overflow-hidden bg-gray-900">
        <img 
          src="/earn-points-banner.png" 
          alt="Earn Points" 
          className="absolute inset-0 w-full h-full object-cover object-center z-10" 
          onError={(e) => e.target.style.display = 'none'}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #3b0764 50%, #000000 100%)' }}>
           <h1 className="text-3xl font-black text-white tracking-tight italic">EARN POINTS</h1>
           <p className="text-xs text-purple-300 font-bold mt-1 uppercase tracking-widest">Complete Tasks • Get Canva Pro</p>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3 flex items-center justify-between border-b border-gray-100 shadow-sm z-10">
        <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
          🎯 Earn Points
        </h1>
        <div className="flex items-center gap-2">
          <div className="bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1 text-xs font-bold text-yellow-700 shadow-sm">
            ⭐ 0 pts
          </div>
          <button 
            onClick={() => navigate('/reward-history')}
            className="bg-purple-50 hover:bg-purple-100 text-purple-600 text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
          >
            History
          </button>
        </div>
      </div>

      {/* Main Content / Cards */}
      <div className="px-4 pt-4 space-y-3">
        
        {/* Next Canva Reward */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2.5">
            <div>
              <div className="font-black text-gray-900 text-sm flex items-center gap-1.5">
                🏆 Next Canva Reward
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Canva Pro · 7 Days</div>
            </div>
            <div className="text-[11px] font-bold bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full">
              0 / 20 pts
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1.5">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: '0%' }}></div>
          </div>
          <div className="text-[11px] text-gray-400 font-medium">20 more points needed</div>
        </motion.div>

        {/* Spin & Earn Accordion Component */}
        <SpinEarnCard onWin={() => queryClient.invalidateQueries({ queryKey: ['user'] })} />

        {/* Daily Check-in */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
            <span>🗓️</span> Daily Check-in
          </div>
          <div className="flex justify-between mb-4">
            {['D1|+1', 'D2|+1', 'D3|+1', 'D4|+2', 'D5|+2', 'D6|+2', 'D7|+3'].map((day, i) => {
              const [d, pts] = day.split('|');
              const isFirst = i === 0;
              const isLast = i === 6;
              return (
                <div key={i} className={`flex flex-col items-center justify-center w-10 h-10 rounded-full border ${isFirst ? 'border-purple-300 bg-purple-50 text-purple-700 shadow-sm' : 'border-gray-100 text-gray-400'} text-[10px] font-bold leading-tight`}>
                  {d}<br/><span className={isFirst ? 'text-purple-600' : isLast ? 'text-yellow-500' : 'text-gray-400'}>{pts}</span>
                </div>
              )
            })}
          </div>
          <button className="w-full bg-[#10b981] hover:bg-[#059669] active:scale-[0.98] transition-transform text-white font-black py-3.5 rounded-xl text-sm shadow-md shadow-green-100">
            CHECK-IN — Today's Reward: +1 pt
          </button>
        </motion.div>

        {/* Task Cards */}
        <TaskCard icon="📺" iconBg="bg-red-500" title="Watch Ads 01" subtitle="+1 Point / Ad" limit="0/5" btnText="WATCH ADS" btnColor="bg-[#ef4444]" />
        <TaskCard icon="📺" iconBg="bg-orange-500" title="Watch Ads 02" subtitle="+1 Point / Ad" limit="0/5" btnText="WATCH ADS" btnColor="bg-[#ef4444]" />
        <TaskCard icon="📢" iconBg="bg-blue-500" title="Join Channel 01" subtitle="+2 pts · One time" limit="91/1000" btnText="JOIN" btnColor="bg-[#3b82f6]" />
        <TaskCard icon="📢" iconBg="bg-cyan-500" title="Join Channel 02" subtitle="+2 pts · One time" limit="86/1000" btnText="JOIN" btnColor="bg-[#3b82f6]" />
        <TaskCard icon="👥" iconBg="bg-yellow-400" title="Invite Friends" subtitle="+5 pts / referral · Unlimited" btnText="COPY" btnColor="bg-[#06b6d4]" />
      </div>
    </div>
  );
}

function TaskCard({ icon, iconBg, title, subtitle, limit, btnText, btnColor }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
      <div className={`w-11 h-11 rounded-full ${iconBg} flex items-center justify-center shrink-0 text-white text-xl shadow-inner`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-gray-900 text-sm">{title}</div>
        <div className="text-[11px] text-gray-500 mt-0.5">{subtitle} <span className="text-gray-300 mx-1">{limit ? '·' : ''}</span> {limit}</div>
        {limit && (
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>)}
            </div>
          </div>
        )}
      </div>
      <button className={`${btnColor} hover:opacity-90 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shrink-0 transition-all shadow-sm`}>
        {btnText}
      </button>
    </motion.div>
  );
}