import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24">
      
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-3 border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:bg-gray-50 p-1 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <div>
          <h1 className="text-[17px] font-black text-[#1F2937] flex items-center gap-2">
            📋 Reward History
          </h1>
          {history.length > 0 && (
            <p className="text-[11px] text-gray-400 font-medium">{history.length} total rewards earned</p>
          )}
        </div>
      </div>

      <div className="px-4 pt-5 pb-8">
        {loading ? (
          <div className="text-center py-10 flex flex-col items-center">
            <span className="text-3xl animate-spin mb-3">⏳</span>
            <span className="text-xs text-gray-400 font-bold">Loading records...</span>
          </div>
        ) : history.length === 0 ? (
          
          /* Empty State (Matches Screenshot 1) */
          <div className="bg-white rounded-[24px] p-8 text-center shadow-sm border border-gray-100">
            <div className="text-5xl mb-3">📬</div>
            <h2 className="text-[15px] font-black text-[#1F2937] mb-1">No rewards yet</h2>
            <p className="text-[12px] text-gray-400 font-medium">Complete tasks to start earning points!</p>
          </div>

        ) : (
          
          /* Populated History (Matches Screenshot 2) */
          <div className="space-y-6">
            {Object.keys(groupedHistory).map(dateStr => (
              <div key={dateStr}>
                <h3 className="text-[12px] font-bold text-gray-600 mb-3 ml-1">{dateStr}</h3>
                
                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                  {groupedHistory[dateStr].map((task, index) => {
                    const timeStr = new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const isLast = index === groupedHistory[dateStr].length - 1;
                    
                    return (
                      <div key={task.id} className={`p-4 flex items-center justify-between ${!isLast ? 'border-b border-gray-50' : ''}`}>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center text-lg shadow-sm border border-gray-100">
                            {task.icon}
                          </div>
                          <div>
                            <div className="font-bold text-[14px] text-[#1F2937] mb-0.5">{task.task_name}</div>
                            <div className="text-[10px] text-gray-400 font-medium">{timeStr}</div>
                          </div>
                        </div>

                        <div className={`font-black text-[15px] ${task.points_earned > 0 ? 'text-[#10B981]' : 'text-gray-400'}`}>
                          {task.points_earned > 0 ? `+${task.points_earned}` : '0'}
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            
            <div className="text-center pt-4 pb-2">
              <span className="text-[11px] text-gray-400 font-medium">All rewards loaded ✓</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}