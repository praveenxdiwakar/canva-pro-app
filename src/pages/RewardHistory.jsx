import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useTelegram } from '../contexts/TelegramContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Helper functions for matching colors and icons to task types
function getTaskIcon(type) {
  if (type === "watch_ad" || type === "home_ad_step") return "📺";
  if (type === "lucky_wheel") return "🎡";
  if (type === "mystery_gift") return "🎁";
  if (type === "join_channel" || type === "join_zer0costedu") return "📢";
  if (type === "invite_friend") return "👥";
  if (type === "daily_checkin") return "🗓️";
  return "⭐";
}

function getTaskBg(type) {
  if (type === "watch_ad" || type === "home_ad_step") return "bg-red-100 text-red-500";
  if (type === "lucky_wheel") return "bg-yellow-100 text-yellow-600";
  if (type === "mystery_gift") return "bg-amber-100 text-amber-500";
  if (type === "join_channel" || type === "join_zer0costedu") return "bg-blue-100 text-blue-500";
  if (type === "invite_friend") return "bg-orange-100 text-orange-500";
  if (type === "daily_checkin") return "bg-green-100 text-green-500";
  return "bg-purple-100 text-purple-500";
}

export default function RewardHistory() {
  const { initData } = useTelegram();
  const navigate = useNavigate();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: ["reward-history"],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(`/api/reward-history?page=${pageParam}&limit=20`, {
        headers: { "x-init-data": initData }
      });
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
    enabled: !!initData,
    staleTime: 30000
  });

  const records = data?.pages.flatMap(page => page.records) ?? [];
  
  // Group records by formatted date string
  const groupedRecords = {};
  for (const record of records) {
    const dateStr = new Date(record.createdAt).toLocaleDateString();
    if (!groupedRecords[dateStr]) groupedRecords[dateStr] = [];
    groupedRecords[dateStr].push(record);
  }

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24">
      {/* Header (Exact match to screenshot) */}
      <div className="bg-white h-14 px-4 flex items-center gap-3 shadow-sm relative z-10 border-b border-gray-100">
        <button 
          onClick={() => navigate("/profile")} 
          className="p-1.5 -ml-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="text-[17px] font-black text-gray-900 flex items-center gap-1.5">
          📋 Reward History
        </h1>
      </div>

      <div className="px-4 pt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
          </div>
        ) : records.length === 0 ? (
          
          /* Empty State Card (Exact match to screenshot) */
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl py-8 px-4 flex flex-col items-center justify-center border border-gray-100 shadow-sm">
            <div className="text-3xl mb-2">📬</div>
            <div className="text-[15px] font-bold text-gray-800 mb-1">No rewards yet</div>
            <div className="text-[12px] text-gray-400">Complete tasks to start earning points!</div>
          </motion.div>
          
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedRecords).map(([dateLabel, dayRecords]) => (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} key={dateLabel}>
                <div className="text-[11px] font-bold text-gray-400 mb-2 px-1 uppercase tracking-widest">{dateLabel}</div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {dayRecords.map((record, index) => (
                    <div key={record.id} className={`flex items-center gap-3 px-4 py-3 ${index < dayRecords.length - 1 ? "border-b border-gray-50" : ""}`}>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${getTaskBg(record.type)}`}>
                        <span className="text-base">{getTaskIcon(record.type)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-gray-800 truncate">{record.description}</div>
                        <div className="text-[10px] font-medium text-gray-400 mt-0.5">
                          {new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div className="font-black text-green-500 text-sm shrink-0">
                        +{record.points}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}

            {hasNextPage && (
              <button 
                onClick={() => fetchNextPage()} 
                disabled={isFetchingNextPage}
                className="w-full bg-white border border-gray-200 text-gray-600 font-bold text-sm py-3.5 rounded-2xl transition-all hover:bg-gray-50 active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
              >
                {isFetchingNextPage ? "Loading..." : "Load More"}
              </button>
            )}

            {!hasNextPage && records.length > 0 && (
              <div className="text-center text-xs font-bold text-gray-400 py-3">
                All rewards loaded ✓
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}