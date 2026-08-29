import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function RewardHistory() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24">
      {/* Top Header */}
      <div className="bg-white px-4 py-4 flex items-center shadow-sm border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="text-gray-600 mr-4 p-1">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="text-[17px] font-black text-gray-900 flex items-center gap-2">📋 Reward History</h1>
      </div>

      <div className="px-4 pt-6">
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center">
          <span className="text-4xl mb-3">📬</span>
          <h2 className="font-black text-gray-800 text-[15px] mb-1">No rewards yet</h2>
          <p className="text-[11px] text-gray-400 font-medium">Complete tasks to start earning points!</p>
        </div>
      </div>
    </div>
  );
}