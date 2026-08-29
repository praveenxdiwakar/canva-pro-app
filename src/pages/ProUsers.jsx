import React, { useState, useEffect } from 'react';
import { fetchProList } from '../api/users';

export default function ProUsers() {
  const [proList, setProList] = useState([]);

  useEffect(() => {
    fetchProList().then(setProList);
  }, []);

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24 px-4 pt-4 space-y-4">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <h1 className="font-black text-xl text-gray-900 mb-1">👑 Canva Pro Members</h1>
        <p className="text-xs text-gray-500">Directory of users with active Canva Pro access</p>
      </div>

      <div className="space-y-3">
        {proList.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No pro members yet. Be the first to redeem!</div>
        ) : (
          proList.map(item => (
            <div key={item.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-100 flex items-center justify-center font-bold text-purple-700">
                  {item.users?.photo_url ? <img src={item.users.photo_url} alt="" className="w-full h-full object-cover" /> : "👤"}
                </div>
                <div>
                  <div className="font-bold text-sm text-gray-900">{item.users?.first_name || "User"}</div>
                  <div className="text-[10px] text-gray-400">{item.link_name}</div>
                </div>
              </div>
              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-full">Active</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}