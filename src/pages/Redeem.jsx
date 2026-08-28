import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTelegram } from '../contexts/TelegramContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const tiers = [
  { points: 20, days: 7, label: "Starter", color: "#7c3aed", bg: "#f5f3ff" },
  { points: 45, days: 15, label: "Quick Access", color: "#0284c7", bg: "#f0f9ff" },
  { points: 80, days: 30, label: "Most Popular", tag: "BEST VALUE", color: "#b45309", bg: "#fffbeb" }
];

export default function Redeem() {
  const { initData } = useTelegram();
  const navigate = useNavigate();

  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch('/api/users/me', { headers: { 'x-init-data': initData } });
      return res.ok ? res.json() : null;
    },
    enabled: !!initData
  });

  const points = userData?.points ?? 0;
  const nextTier = tiers.find(t => points < t.points) ?? tiers[0];
  const hasEnoughForAny = points >= tiers[0].points;
  const progressPct = Math.min(100, Math.round((points / nextTier.points) * 100));

  return (
    <div className="min-h-[calc(100dvh-5rem)] pb-28 bg-[#f2f2f7]">
      {/* Header Section */}
      <div className="bg-white px-5 pt-5 pb-5 border-b border-gray-100">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Redeem Canva Pro</div>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-200 flex-shrink-0">
            <span className="text-2xl">🪙</span>
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">Your Balance</div>
            <div className="text-4xl font-black text-gray-900 leading-none">{points}</div>
            <div className="text-xs text-gray-400 mt-0.5">points</div>
          </div>
          
          {/* Top 'Earn' Button -> Routes to /tasks */}
          <button 
            onClick={() => navigate('/tasks')} 
            className="ml-auto flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 active:scale-[0.97] border border-purple-200 text-purple-700 text-xs font-bold px-3.5 py-2 rounded-xl transition-all"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg> Earn
          </button>
        </div>

        {!hasEnoughForAny && (
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-500 font-medium">{nextTier.points - points} pts to first reward</span>
              <span className="font-bold text-purple-600">{progressPct}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-2 rounded-full bg-purple-500" />
            </div>
          </div>
        )}
        
        {hasEnoughForAny && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-2xl px-3.5 py-2.5">
            <span className="text-green-500 text-sm">✅</span>
            <span className="text-sm text-green-700 font-semibold">You can redeem a plan below!</span>
          </div>
        )}
      </div>

      <div className="px-4 pt-4 space-y-3">
        {/* Tier Cards */}
        {tiers.map((tier, index) => {
          const isAvailable = points >= tier.points;
          const pointsNeeded = tier.points - points;
          
          return (
            <motion.div key={index} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} className={`relative bg-white rounded-3xl overflow-hidden transition-all shadow-sm ring-1 ring-gray-100`}>
              {tier.tag && (
                <div className="absolute top-3 right-3 text-[10px] font-black px-2.5 py-1 rounded-full text-orange-600 bg-orange-50">
                  🔥 {tier.tag}
                </div>
              )}
              <div className="pl-6 pr-4 py-4">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 bg-gray-50 border border-gray-200">
                    <span className="text-xl font-black text-gray-500">{tier.days}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">DAYS</span>
                  </div>
                  <div className="flex-1 pt-0.5">
                    <div className="text-base font-black text-gray-900">Canva Pro</div>
                    <div className="text-xs text-gray-400 font-medium">{tier.days} Days Full Access</div>
                    <div className="flex items-baseline gap-1 mt-1.5">
                      <span className="text-2xl font-black text-gray-700">{tier.points}</span>
                      <span className="text-xs text-gray-400 font-semibold">points</span>
                      <span className="ml-auto text-[11px] text-gray-300 font-medium">{tier.label}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-semibold" style={{ color: isAvailable ? "#16a34a" : "#6b7280" }}>
                      {isAvailable ? "✓ Ready to redeem" : `${points} / ${tier.points} pts`}
                    </span>
                    {!isAvailable && <span className="text-[11px] text-gray-400">Need {pointsNeeded} more</span>}
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.round((points / tier.points) * 100))}%` }} className="h-2 rounded-full bg-purple-500" />
                  </div>
                </div>

                {isAvailable ? (
                  <button className="w-full font-bold py-3 rounded-2xl text-white bg-purple-600">🎁 Redeem Now</button>
                ) : (
                  <div className="w-full border border-dashed border-gray-200 bg-gray-50 text-gray-400 font-semibold py-3 rounded-2xl flex items-center justify-center text-sm">
                    🔒 Need {pointsNeeded} more points
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Keep Earning Card -> Routes to /tasks */}
        {!hasEnoughForAny && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="bg-white rounded-3xl p-4 shadow-sm ring-1 ring-gray-100 mt-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-xl">
                🎯
              </div>
              <div>
                <div className="font-bold text-gray-800 text-sm">Keep earning!</div>
                <div className="text-xs text-gray-400">Watch ads · Complete tasks</div>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/tasks')} 
              className="w-full bg-[#a855f7] hover:bg-[#9333ea] active:scale-[0.98] text-white font-bold text-sm py-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-200"
            >
              Earn More Points
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"></path>
              </svg>
            </button>
          </motion.div>
        )}

        <div className="text-center py-4">
          <button className="text-xs text-gray-400 hover:text-purple-500 font-medium transition-colors">
            Need help? 🎧 Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}