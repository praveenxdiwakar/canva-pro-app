import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTelegram } from '../contexts/TelegramContext';
import { motion } from 'framer-motion';

const tiers = [
  { points: 20, days: 7, label: "Starter", color: "#7c3aed", bg: "#f5f3ff" },
  { points: 45, days: 15, label: "Quick Access", color: "#0284c7", bg: "#f0f9ff" },
  { points: 80, days: 30, label: "Most Popular", tag: "BEST VALUE", color: "#b45309", bg: "#fffbeb" }
];

export default function Redeem() {
  const { initData } = useTelegram();

  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch('/api/users/me', { headers: { 'x-init-data': initData } });
      return res.ok ? res.json() : null;
    },
    enabled: !!initData
  });

  const points = userData?.points ?? 0;

  return (
    <div className="min-h-[calc(100dvh-5rem)] pb-28 bg-[#f2f2f7]">
      <div className="bg-white px-5 pt-5 pb-5 border-b border-gray-100">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Redeem Canva Pro</div>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-2xl">🪙</span>
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">Your Balance</div>
            <div className="text-4xl font-black text-gray-900 leading-none">{points}</div>
            <div className="text-xs text-gray-400 mt-0.5">points</div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {tiers.map((tier, index) => {
          const isAvailable = points >= tier.points;
          return (
            <motion.div key={index} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className={`relative bg-white rounded-3xl overflow-hidden transition-all shadow-sm ring-1 ring-gray-100`}>
              <div className="pl-6 pr-4 py-4">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 bg-gray-50 border border-gray-200">
                    <span className="text-xl font-black text-gray-500">{tier.days}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">DAYS</span>
                  </div>
                  <div className="flex-1 pt-0.5">
                    <div className="text-base font-black text-gray-900">Canva Pro</div>
                    <div className="flex items-baseline gap-1 mt-1.5">
                      <span className="text-2xl font-black text-gray-700">{tier.points}</span>
                      <span className="text-xs text-gray-400 font-semibold">points</span>
                    </div>
                  </div>
                </div>
                {isAvailable ? (
                  <button className="w-full font-bold py-3 rounded-2xl text-white bg-purple-600">🎁 Redeem Now</button>
                ) : (
                  <div className="w-full border border-dashed border-gray-200 bg-gray-50 text-gray-400 font-semibold py-3 rounded-2xl flex items-center justify-center text-sm">
                    Need {tier.points - points} more points
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}