import React, { useState, useEffect } from 'react';
import { useTelegram } from '../contexts/TelegramContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';

export default function Admin() {
  const { user } = useTelegram();
  const navigate = useNavigate();
  
  const [links, setLinks] = useState([]);
  const [adZone, setAdZone] = useState("");
  const [stats, setStats] = useState({ users: 0, redemptions: 0 });
  const [loading, setLoading] = useState(true);
  
  // Inline Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLink, setNewLink] = useState({ name: '', url: '', slots: 100 });

  // Security Check: Only allow the configured Admin ID
  const adminIdStr = String(import.meta.env.VITE_ADMIN_TELEGRAM_ID).trim();
  const userIdStr = String(user?.telegramId).trim();
  const isAdmin = adminIdStr === userIdStr;

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Links
      const { data: linksData } = await supabase.from('canva_links').select('*').order('id', { ascending: false });
      setLinks(linksData || []);

      // 2. Fetch Ad Settings
      const { data: adData } = await supabase.from('app_settings').select('*').eq('key', 'MONETAG_ZONE_ID').maybeSingle();
      if (adData) setAdZone(adData.value);

      // 3. Fetch Quick Stats
      const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
      const { count: redemptionsCount } = await supabase.from('redemptions').select('*', { count: 'exact', head: true });
      
      setStats({ users: usersCount || 0, redemptions: redemptionsCount || 0 });
    } catch (error) {
      console.error("Admin fetch error:", error);
    }
    setLoading(false);
  };

  // --- LINK MANAGEMENT ---
  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!newLink.name || !newLink.url) return alert("Please fill all fields!");
    
    // Safely insert and catch any database errors
    const { error } = await supabase.from('canva_links').insert([{
      name: newLink.name,
      url: newLink.url,
      total_slots: parseInt(newLink.slots),
      used_slots: 0
    }]);

    if (error) {
      alert("❌ Error saving link: " + error.message);
      return;
    }
    
    setNewLink({ name: '', url: '', slots: 100 });
    setShowAddForm(false);
    alert("✅ Link added successfully!");
    loadDashboardData(); // Refresh UI in real-time
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this link? Active users will keep their access, but no new users can join.")) {
      const { error } = await supabase.from('canva_links').delete().eq('id', id);
      if (error) {
        alert("❌ Error deleting link: " + error.message);
        return;
      }
      alert("🗑️ Link deleted.");
      loadDashboardData();
    }
  };

  // --- AD MANAGEMENT ---
  const handleSaveAd = async () => {
    if (!adZone) return alert("Please enter an Ad Zone ID first.");

    const { error } = await supabase.from('app_settings').upsert({ key: 'MONETAG_ZONE_ID', value: adZone });
    
    if (error) {
      alert("❌ Error saving Ad Zone: " + error.message);
      return;
    }
    
    alert("✅ Monetag Ad Zone saved securely to database! Ads will now work on the Earn Points tab.");
  };

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="bg-[#f5f5f5] min-h-screen flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-red-100 text-center max-w-sm w-full">
          <span className="text-5xl mb-4 block">⛔</span>
          <h1 className="text-xl font-black text-gray-900 mb-2">Access Denied</h1>
          <p className="text-xs text-gray-500 font-medium">You do not have master admin privileges to view this dashboard.</p>
          <button onClick={() => navigate('/profile')} className="mt-6 w-full bg-gray-900 text-white font-bold py-3 rounded-xl text-sm">
            Return to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24">
      {/* Top Bar */}
      <div className="bg-white px-4 py-3 flex items-center shadow-sm border-b border-gray-100 relative">
        <button onClick={() => navigate('/profile')} className="text-gray-400 p-1 mr-2 hover:bg-gray-50 rounded-lg transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="text-[15px] font-black text-gray-900">⚙️ Master Admin</h1>
      </div>

      <div className="px-4 pt-4 space-y-4">
        
        {/* Platform Statistics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Users</span>
            <span className="text-2xl font-black text-purple-600 leading-none">{loading ? '...' : stats.users}</span>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Redemptions</span>
            <span className="text-2xl font-black text-orange-500 leading-none">{loading ? '...' : stats.redemptions}</span>
          </div>
        </div>

        {/* Monetag Ads Control */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-black text-sm text-gray-800 flex items-center gap-2 mb-4">📡 Monetag Ad Settings</h2>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={adZone} 
              onChange={e => setAdZone(e.target.value)} 
              placeholder="Enter Zone ID (e.g. 11525410)" 
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-700 outline-none focus:border-purple-400 transition-colors" 
            />
            <button onClick={handleSaveAd} className="bg-orange-500 text-white font-bold px-4 rounded-xl text-xs shadow-sm active:scale-95 transition-transform">
              Save
            </button>
          </div>
          <p className="text-[9px] text-gray-400 font-medium mt-2">This Zone ID activates the ads on the Tasks page.</p>
        </div>

        {/* Canva Links Manager */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-black text-sm text-gray-800 flex items-center gap-2">🔗 Canva Pro Links</h2>
            <button onClick={() => setShowAddForm(!showAddForm)} className="bg-purple-100 text-purple-700 font-bold px-3 py-1.5 rounded-lg text-[10px]">
              {showAddForm ? 'Cancel' : '+ Add Link'}
            </button>
          </div>

          {/* Add Link Form */}
          {showAddForm && (
            <form onSubmit={handleAddLink} className="bg-purple-50 rounded-2xl p-4 mb-4 border border-purple-100 space-y-3">
              <input type="text" placeholder="Link Name (e.g. Team Alpha)" required
                value={newLink.name} onChange={e => setNewLink({...newLink, name: e.target.value})}
                className="w-full bg-white border border-purple-100 rounded-xl px-3 py-2.5 text-xs outline-none" />
              <input type="url" placeholder="https://canva.com/brand/join?..." required
                value={newLink.url} onChange={e => setNewLink({...newLink, url: e.target.value})}
                className="w-full bg-white border border-purple-100 rounded-xl px-3 py-2.5 text-xs outline-none" />
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-[9px] font-bold text-purple-400 pl-1">Max Slots</label>
                  <input type="number" min="1" required
                    value={newLink.slots} onChange={e => setNewLink({...newLink, slots: e.target.value})}
                    className="w-full bg-white border border-purple-100 rounded-xl px-3 py-2 text-xs outline-none mt-0.5" />
                </div>
                <button type="submit" className="flex-1 bg-purple-600 text-white font-bold py-2.5 rounded-xl text-xs mt-3.5 shadow-sm">
                  Save Link
                </button>
              </div>
            </form>
          )}

          {/* Active Links List */}
          <div className="space-y-3">
            {loading && !showAddForm ? (
              <div className="text-center text-xs text-gray-400 py-4">Loading links...</div>
            ) : links.length === 0 ? (
              <div className="text-center text-xs text-gray-400 py-4 border-2 border-dashed border-gray-100 rounded-xl">No active links found.</div>
            ) : (
              links.map(link => {
                const isFull = link.used_slots >= link.total_slots;
                const percentage = Math.min(100, Math.round((link.used_slots / link.total_slots) * 100));
                
                return (
                  <div key={link.id} className={`rounded-2xl p-4 border ${isFull ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'} flex flex-col relative overflow-hidden`}>
                    <div className="flex justify-between items-start mb-2 relative z-10">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm leading-tight">{link.name}</h3>
                        <div className="text-[9px] text-gray-500 mt-0.5 max-w-[200px] truncate">{link.url}</div>
                      </div>
                      <button onClick={() => handleDelete(link.id)} className="bg-white border border-gray-200 text-red-500 p-1.5 rounded-lg shadow-sm hover:bg-red-50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-end mt-2 relative z-10">
                      <span className={`text-[10px] font-bold ${isFull ? 'text-red-500' : 'text-purple-600'}`}>
                        {link.used_slots} / {link.total_slots} slots used
                      </span>
                      <span className="text-[9px] text-gray-400 font-bold">{percentage}%</span>
                    </div>
                    
                    {/* Progress Bar inside the card */}
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-1.5 relative z-10 overflow-hidden">
                      <div className={`${isFull ? 'bg-red-500' : 'bg-purple-500'} h-1 rounded-full`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}