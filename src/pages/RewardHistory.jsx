import React from 'react';

export default function RewardHistory() {
  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24 px-4 pt-4 space-y-4">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <h1 className="font-black text-xl text-gray-900 mb-1">📜 Reward History</h1>
        <p className="text-xs text-gray-500">Your past redemptions and claimed links</p>
      </div>
      <div className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm text-gray-400 text-sm">
        No redemption history found.
      </div>
    </div>
  );
}