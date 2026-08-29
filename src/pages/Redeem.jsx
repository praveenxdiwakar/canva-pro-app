import React, { useState, useEffect } from 'react';
import { useTelegram } from '../contexts/TelegramContext';
import { fetchRedeemTiers, redeemPoints } from '../api/redeem';

export default function Redeem() {
  const { user, setUser } = useTelegram();
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRedeemTiers().then(setTiers);
  }, []);

  const handleRedeem = async (tierId, cost) => {
    if (user.points < cost) {
      alert("❌ You do not have enough points for this reward!");
      return;
    }
    if (!window.confirm("Are you sure you want to redeem this reward?")) return;

    try {
      setLoading(true);
      const res = await redeemPoints(user.telegramId, tierId);
      setUser({ ...user, points: res.newPoints });
      alert(`🎉 Success! Your Canva Pro Link: ${res.inviteLink}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24 px-4 pt-4 space-y-4">
      <div className="bg-white rounded-2xl p-4 shadow-sm flex justify-between items-center border border-gray-100">
        <h1 className="font-black text-xl text-gray-900">🎁 Redeem Rewards</h1>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 font-bold px-3 py-1.5 rounded-full text-xs">
          ⭐ {user?.points || 0} pts
        </div>
      </div>

      <div className="space-y-3">
        {tiers.map(tier => (
          <div key={tier.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex justify-between items-center">
            <div>
              <div className="font-black text-sm text-gray-900">{tier.name}</div>
              <div className="text-xs text-purple-600 font-bold mt-1">Cost: {tier.pointsCost} Points</div>
            </div>
            <button 
              onClick={() => handleRedeem(tier.id, tier.pointsCost)} 
              disabled={loading || user.points < tier.pointsCost}
              className="bg-purple-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm"
            >
              Redeem
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}