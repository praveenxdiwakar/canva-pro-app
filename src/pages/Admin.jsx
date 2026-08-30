import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';

export default function Admin() {
  const navigate = useNavigate();
  
  // Stats State
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRedemptions, setTotalRedemptions] = useState(0);
  
  // Settings & Links State
  const [zoneId, setZoneId] = useState("");
  const [links, setLinks] = useState([]);
  const [savingZone, setSavingZone] = useState(false);
  
  // New Link Form State
  const [newLink, setNewLink] = useState({ name: '', url: '', totalSlots: 100 });
  const [addingLink, setAddingLink] = useState(false);

  useEffect(() => {
    fetchInitialData();

    // ==========================================
    // REAL-TIME DATABASE SUBSCRIPTIONS
    // ==========================================
    
    // 1. Listen for new Users joining
    const usersSubscription = supabase.channel('users-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'users' }, () => {
        setTotalUsers(prev => prev + 1);
      })
      .subscribe();

    // 2. Listen for new Redemptions
    const redemptionsSubscription = supabase.channel('redemptions-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'redemptions' }, () => {
        setTotalRedemptions(prev => prev + 1);
        fetchLinks(); // Refresh links to show updated used_slots
      })
      .subscribe();

    // 3. Listen for Canva Links updates
    const linksSubscription = supabase.channel('links-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'canva_links' }, () => {
        fetchLinks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(usersSubscription);
      supabase.removeChannel(redemptionsSubscription);
      supabase.removeChannel(linksSubscription);
    };
  }, []);

  const fetchInitialData = async () => {
    // Get exact count of users
    const { count: uCount } = await supabase.from('users').select('id', { count: 'exact', head: true });
    if (uCount !== null) setTotalUsers(uCount);

    // Get exact count of redemptions
    const { count: rCount } = await supabase.from('redemptions').select('id', { count: 'exact', head: true });
    if (rCount !== null) setTotalRedemptions(rCount);

    // Get Ad Zone Setting
    const { data: adData } = await supabase.from('app_settings').select('value').eq('key', 'MONETAG_ZONE_ID').maybeSingle();
    if (adData) setZoneId(adData.value);

    fetchLinks();
  };

  const fetchLinks = async () => {
    const { data } = await supabase.from('canva_links').select('*').order('id', { ascending: false });
    if (data) setLinks(data);
  };

  // --- ACTIONS ---

  const handleSaveZone = async () => {
    setSavingZone(true);
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({ key: 'MONETAG_ZONE_ID', value: zoneId });
      
      if (error) throw error;
      alert("✅ Monetag Ad Zone saved successfully!");
    } catch (err) {
      alert(`❌ Error saving Ad Zone: ${err.message}`);
    }
    setSavingZone(false);
  };

  const handleAddLink = async () => {
    if (!newLink.name || !newLink.url) return alert("Please fill out both Name and URL.");
    setAddingLink(true);
    try {
      const { error } = await supabase.from('canva_links').insert([{
        name: newLink.name,
        url: newLink.url,
        invitelink: newLink.url, // Keep in sync for older code versions
        total_slots: parseInt(newLink.totalSlots) || 100,
        used_slots: 0
      }]);
      
      if (error) throw error;
      
      setNewLink({ name: '', url: '', totalSlots: 100 }); // Reset form
      // No need to fetchLinks manually; the real-time subscription will update the list!
    } catch (err) {
      alert(`❌ Error saving link: ${err.message}`);
    }
    setAddingLink(false);
  };

  const handleDeleteLink = async (id) => {
    if (!window.confirm("Are you sure you want to delete this link?")) return;
    try {
      await supabase.from('canva_links').delete().eq('id', id);
    } catch (err) {
      alert("Error deleting link.");
    }
  };

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24">
      
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-3 border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <button onClick={() => navigate('/profile')} className="text-gray-500 hover:bg-gray-50 p-1 rounded-lg transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="text-[17px] font-black text-[#1F2937] flex items-center gap-2">
          ⚙️ Master Admin
        </h1>
      </div>

      <div className="px-4 pt-5 space-y-4">
        
        {/* Real-time Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-50 rounded-full blur-2xl -mr-6 -mt-6"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 relative z-10">Total Users</p>
            <div className="text-3xl font-black text-[#6200EA] relative z-10">{totalUsers.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-50 rounded-full blur-2xl -mr-6 -mt-6"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 relative z-10">Redemptions</p>
            <div className="text-3xl font-black text-[#E65100] relative z-10">{totalRedemptions.toLocaleString()}</div>
          </div>
        </div>

        {/* Monetag Settings */}
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
          <h2 className="font-black text-[14px] text-gray-800 flex items-center gap-2 mb-4">📡 Monetag Ad Settings</h2>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              placeholder="Enter Zone ID (e.g. 9773650)" 
              className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-xl px-4 py-3 outline-none focus:border-purple-400 transition-colors"
            />
            <button 
              onClick={handleSaveZone}
              disabled={savingZone}
              className="bg-[#E65100] text-white font-black px-5 py-3 rounded-xl shadow-sm active:scale-95 transition-transform"
            >
              {savingZone ? '...' : 'Save'}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 font-medium mt-2 ml-1">This Zone ID activates the ads across the entire app dynamically.</p>
        </div>

        {/* Canva Links Management */}
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
          <h2 className="font-black text-[14px] text-gray-800 flex items-center gap-2 mb-4">🔗 Manage Canva Links</h2>
          
          {/* Add Link Form */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-5 space-y-3">
            <input 
              type="text" 
              placeholder="Link Name (e.g. Team Alpha - August)" 
              value={newLink.name}
              onChange={(e) => setNewLink({...newLink, name: e.target.value})}
              className="w-full bg-white border border-gray-200 text-gray-900 text-sm font-bold rounded-xl px-4 py-3 outline-none focus:border-purple-400"
            />
            <input 
              type="text" 
              placeholder="https://canva.com/brand/join/..." 
              value={newLink.url}
              onChange={(e) => setNewLink({...newLink, url: e.target.value})}
              className="w-full bg-white border border-gray-200 text-gray-900 text-sm font-bold rounded-xl px-4 py-3 outline-none focus:border-purple-400"
            />
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-[10px] font-bold text-gray-500 ml-1 mb-1 block">Max Slots</label>
                <input 
                  type="number" 
                  value={newLink.totalSlots}
                  onChange={(e) => setNewLink({...newLink, totalSlots: e.target.value})}
                  className="w-full bg-white border border-gray-200 text-gray-900 text-sm font-bold rounded-xl px-4 py-3 outline-none focus:border-purple-400"
                />
              </div>
              <button 
                onClick={handleAddLink}
                disabled={addingLink}
                className="flex-[2] bg-[#6200EA] text-white font-black py-3 rounded-xl shadow-md active:scale-95 transition-transform"
              >
                {addingLink ? 'Saving...' : 'Save Link'}
              </button>
            </div>
          </div>

          {/* Active Links List */}
          <div className="space-y-3">
            {links.length === 0 ? (
              <div className="text-center py-4 border-2 border-dashed border-gray-100 rounded-xl">
                <p className="text-[12px] text-gray-400 font-medium">No active links found.</p>
              </div>
            ) : (
              links.map(link => {
                const percentage = Math.min(100, Math.round((link.used_slots / link.total_slots) * 100));
                const isFull = link.used_slots >= link.total_slots;

                return (
                  <div key={link.id} className="bg-white border border-gray-200 rounded-2xl p-4 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                      <div className="pr-8">
                        <h3 className="font-black text-[13px] text-gray-900 leading-tight mb-0.5">{link.name}</h3>
                        <p className="text-[10px] text-gray-400 font-medium truncate max-w-[200px]">{link.url}</p>
                      </div>
                      <button onClick={() => handleDeleteLink(link.id)} className="w-7 h-7 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-xs absolute top-3 right-3 hover:bg-red-100">
                        ✕
                      </button>
                    </div>

                    <div className="flex justify-between items-center mb-1.5 mt-3">
                      <span className={`text-[10px] font-bold ${isFull ? 'text-red-500' : 'text-gray-600'}`}>
                        {link.used_slots} / {link.total_slots} slots used
                      </span>
                      <span className="text-[10px] font-black text-[#6200EA]">{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full transition-all ${isFull ? 'bg-red-500' : 'bg-[#6200EA]'}`} style={{ width: `${percentage}%` }}></div>
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