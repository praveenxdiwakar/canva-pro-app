import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../contexts/TelegramContext';
import { fetchRedeemTiers, redeemPoints } from '../api/redeem';

export default function Redeem() {
  const { user, setUser } = useTelegram();
  const navigate = useNavigate();
  
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingTiers, setFetchingTiers] = useState(true);

  // Fallback labels to perfectly match the screenshot design
  const tierLabels = {
    1: { title: "Starter", subtitle: "7 Days Full Access" },
    2: { title: "Quick Access", subtitle: "15 Days Full Access" },
    3: { title: "Most Popular", subtitle: "30 Days Full Access", badge: "🔥 BEST VALUE" }
  };

  useEffect(() => {
    fetchRedeemTiers().then(data => {
      setTiers(data);
      setFetchingTiers(false);
    });
  }, []);

  const handleRedeem = async (tierId, cost) => {
    if (user.points < cost) return;
    if (!window.confirm("Are you sure you want to redeem this reward?")) return;

    try {
      setLoading(true);
      const res = await redeemPoints(user.telegramId, tierId);
      setUser({ ...user, points: res.newPoints });
      alert(`🎉 Success! Your Canva Pro Link: ${res.inviteLink}`);
      // Optionally navigate to history after success
      // navigate('/reward-history');
    } catch (err) {
      alert(err.message || "Failed to redeem reward.");
    } finally {
      setLoading(false);
    }
  };

  const currentPoints = user?.points || 0;
  
  // Calculate progress to the first reward (Assuming 20 is the lowest tier)
  const firstRewardCost = tiers.length > 0 ? Math.min(...tiers.map(t => t.pointsCost)) : 20;
  const mainProgress = Math.min(100, Math.round((currentPoints / firstRewardCost) * 100));

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24">
      {/* Header / Balance Section */}
      <div className="bg-white px-5 py-6 shadow-sm border-b border-gray-100 rounded-b-3xl">
        <h1 className="text-[11px] font-black text-gray-400 tracking-[0.1em] mb-5 uppercase">Redeem Canva Pro</h1>
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            {/* Purple Coin Icon */}
            <div className="w-[60px] h-[60px] bg-[#8B5CF6] rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-purple-200 border-2 border-purple-400">
              🪙
            </div>
            <div>
              <p className="text-[11px] text-gray-500 font-bold mb-0.5">Your Balance</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[40px] font-black text-gray-900 leading-none tracking-tighter">{currentPoints}</span>
                <span className="text-[11px] font-bold text-gray-400">points</span>
              </div>
            </div>
          </div>
          
          {/* Top Earn Button -> Navigates to Tasks */}
          <button 
            onClick={() => navigate('/tasks')}
            className="border border-purple-200 text-purple-700 bg-white font-bold px-4 py-2 rounded-full text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            Earn
          </button>
        </div>

        {/* Global Progress to First Reward */}
        <div className="flex justify-between items-end mb-1.5">
          <span className="text-[11px] text-gray-500 font-medium">
            {currentPoints >= firstRewardCost ? 'First reward unlocked! 🎉' : `${firstRewardCost} pts to first reward`}
          </span>
          <span className="text-[11px] font-black text-[#8B5CF6]">{mainProgress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div className="bg-[#8B5CF6] h-2 rounded-full transition-all duration-500" style={{ width: `${mainProgress}%` }}></div>
        </div>
      </div>

      {/* Tiers List */}
      <div className="px-4 pt-5 space-y-4">
        {fetchingTiers ? (
          <div className="text-center text-gray-400 text-sm font-bold py-10">Loading Rewards...</div>
        ) : (
          tiers.map(tier => {
            const ui = tierLabels[tier.id] || { title: "Reward", subtitle: "Full Access" };
            const progress = Math.min(100, Math.round((currentPoints / tier.pointsCost) * 100));
            const missing = Math.max(0, tier.pointsCost - currentPoints);
            const canRedeem = missing === 0;

            return (
              <div key={tier.id} className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 relative overflow-hidden">
                {/* Best Value Badge */}
                {ui.badge && (
                  <div className="absolute top-5 right-5 bg-orange-50 text-orange-600 font-black text-[9px] px-2.5 py-1.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                    {ui.badge}
                  </div>
                )}

                <div className="flex justify-between items-start mb-5">
                  <div className="flex gap-3.5">
                    {/* Days Box */}
                    <div className="w-[52px] h-[52px] rounded-2xl border-2 border-gray-100 flex flex-col items-center justify-center text-gray-400">
                      <span className="text-xl font-black leading-none text-gray-700">{tier.durationDays}</span>
                      <span className="text-[7px] font-bold uppercase tracking-widest mt-0.5">Days</span>
                    </div>
                    
                    {/* Text Details */}
                    <div>
                      <h3 className="font-black text-gray-900 text-[17px] leading-tight mb-0.5">Canva Pro</h3>
                      <p className="text-[11px] text-gray-500 font-medium mb-1.5">{ui.subtitle}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-[22px] font-black text-gray-900 leading-none">{tier.pointsCost}</span>
                        <span className="text-[10px] font-bold text-gray-500">points</span>
                      </div>
                    </div>
                  </div>
                  {!ui.badge && (
                    <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider mt-1">{ui.title}</span>
                  )}
                  {ui.badge && (
                    <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider mt-1 mr-24">{ui.title}</span>
                  )}
                </div>
                
                {/* Progress Bar & Stats */}
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[11px] font-bold text-gray-700">{currentPoints} / {tier.pointsCost} pts</span>
                  <span className="text-[10px] font-medium text-gray-400">
                    {canRedeem ? 'Ready to claim!' : `Need ${missing} more`}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-5 overflow-hidden">
                  <div className="bg-gray-300 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>

                {/* Redeem Action Button */}
                {canRedeem ? (
                  <button 
                    onClick={() => handleRedeem(tier.id, tier.pointsCost)}
                    disabled={loading}
                    className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] active:scale-[0.98] text-white font-bold py-3.5 rounded-xl text-[13px] shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? 'Processing...' : '🎁 Unlock Now'}
                  </button>
                ) : (
                  <button 
                    disabled
                    className="w-full border-2 border-dashed border-gray-200 text-gray-400 font-bold py-3.5 rounded-xl text-[12px] flex items-center justify-center gap-1.5 bg-gray-50/50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    Need {missing} more points
                  </button>
                )}
              </div>
            );
          })
        )}

        {/* Keep Earning CTA -> Navigates to Tasks */}
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 mt-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-xl">🎯</div>
            <div>
              <h3 className="font-black text-gray-900 text-[15px]">Keep earning!</h3>
              <p className="text-[11px] text-gray-500 font-medium">Watch ads · Complete tasks</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/tasks')}
            className="w-full bg-[#9333EA] hover:bg-purple-700 active:scale-[0.98] text-white font-black py-4 rounded-2xl shadow-md text-[13px] transition-all"
          >
            Earn More Points &gt;
          </button>
        </div>

        <p className="text-center text-[11px] text-gray-400 font-medium mt-6 pb-2">
          Need help? 🎧 <span className="underline cursor-pointer">Contact Support</span>
        </p>

      </div>
    </div>
  );
}