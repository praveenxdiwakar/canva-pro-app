import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../api/supabase';

export default function Admin() {
  const navigate = useNavigate();
  
  // Stats State
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRedemptions, setTotalRedemptions] = useState(0);
  
  // Settings & Links State
  const [zoneId, setZoneId] = useState("");
  const [isEditingZone, setIsEditingZone] = useState(false); // NEW: Toggle edit mode
  const [links, setLinks] = useState([]);
  const [savingZone, setSavingZone] = useState(false);
  
  // New Link Form State
  const [newLink, setNewLink] = useState({ name: '', url: '', totalSlots: 100 });
  const [addingLink, setAddingLink] = useState(false);

  // Dynamic Tasks State
  const [customTasks, setCustomTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', icon: '📱', action_url: '', points_reward: 5, requires_ad: true, is_daily: false });
  const [addingTask, setAddingTask] = useState(false);

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

    // 4. Listen for Dynamic Tasks updates
    const tasksSubscription = supabase.channel('tasks-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dynamic_tasks' }, () => {
        fetchTasks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(usersSubscription);
      supabase.removeChannel(redemptionsSubscription);
      supabase.removeChannel(linksSubscription);
      supabase.removeChannel(tasksSubscription);
    };
  }, []);

  const fetchInitialData = async () => {
    // ✅ BULLETPROOF COUNT FETCHING
    try {
      const { data, count, error } = await supabase.from('users').select('*', { count: 'exact' });
      if (!error) {
        setTotalUsers(count !== null ? count : (data?.length || 0));
      } else {
        console.error("Error fetching users:", error);
      }
    } catch (err) {
      console.error(err);
    }

    try {
      const { data, count, error } = await supabase.from('redemptions').select('*', { count: 'exact' });
      if (!error) {
        setTotalRedemptions(count !== null ? count : (data?.length || 0));
      }
    } catch (err) {
      console.error(err);
    }

    // Get Ad Zone Setting
    try {
      const { data: adData } = await supabase.from('app_settings').select('value').eq('key', 'MONETAG_ZONE_ID').maybeSingle();
      if (adData) setZoneId(adData.value);
    } catch (err) {}

    fetchLinks();
    fetchTasks();
  };

  const fetchLinks = async () => {
    const { data } = await supabase.from('canva_links').select('*').order('id', { ascending: false });
    if (data) setLinks(data);
  };

  const fetchTasks = async () => {
    const { data } = await supabase.from('dynamic_tasks').select('*').order('created_at', { ascending: false });
    if (data) setCustomTasks(data);
  };

  // --- ACTIONS ---

  const handleSaveZone = async () => {
    if (!zoneId) return alert("Please enter a valid Zone ID.");
    setSavingZone(true);
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({ key: 'MONETAG_ZONE_ID', value: zoneId });
      
      if (error) throw error;
      alert("✅ Monetag Ad Zone saved successfully!");
      setIsEditingZone(false); // Lock the input again after saving!
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
    } catch (err) {
      alert(`❌ Error saving link: ${err.message}`);
    }
    setAddingLink(false);
  };

  const handleAddCustomTask = async () => {
    if (!newTask.title || !newTask.action_url) return alert("Title and Action URL are required!");
    setAddingTask(true);
    try {
      const { error } = await supabase.from('dynamic_tasks').insert([newTask]);
      if (error) throw error;
      
      setNewTask({ title: '', description: '', icon: '📱', action_url: '', points_reward: 5, requires_ad: true, is_daily: false });
      alert("✅ Custom task added instantly!");
    } catch (err) {
      alert(`❌ Error saving task: ${err.message}`);
    }
    setAddingTask(false);
  };

  const deleteRecord = async (table, id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await supabase.from(table).delete().eq('id', id);
    } catch (err) {
      alert(`Error deleting from ${table}.`);
    }
  };

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24 relative overflow-x-hidden">
      
      {/* ========================================================= */}
      {/* 🌟 UPGRADED PREMIUM HEADER BANNER 🌟                        */}
      {/* ========================================================= */}
      <div className="relative w-full h-[150px] bg-gradient-to-br from-[#00C4CC] via-[#7B2CBF] to-[#6200EA] flex items-center justify-center overflow-hidden">
        
        {/* Ambient Glows */}
        <div className="absolute top-[-20px] left-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none z-0"></div>
        <div className="absolute bottom-[-30px] right-[-10px] w-40 h-40 bg-[#00E5FF]/20 rounded-full blur-[40px] pointer-events-none z-0"></div>
        
        {/* Animated Floating Particles */}
        <motion.div animate={{ y: [0, -10, 0], opacity: [0.3, 0.8, 0.3] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="absolute top-6 left-10 text-white/50 text-[10px] select-none z-10">✨</motion.div>
        <motion.div animate={{ y: [0, 10, 0], opacity: [0.2, 0.6, 0.2] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }} className="absolute bottom-8 right-12 text-white/40 text-[14px] select-none z-10">✦</motion.div>

        {/* Canva Logo + PRO Badge */}
        <div className="relative z-20 flex items-center justify-center gap-1.5 drop-shadow-xl mt-2">
          <h1 className="text-[52px] font-bold text-white tracking-tighter" style={{ fontFamily: 'Georgia, serif' }}>
            Canva
          </h1>
          <motion.div 
            initial={{ scale: 0.8, rotate: 0 }}
            animate={{ scale: 1, rotate: 3 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
            className="bg-gradient-to-tr from-[#FFD700] via-[#F59E0B] to-[#FFD700] text-[#5B3A00] font-black text-[11px] px-2 py-0.5 rounded-[6px] uppercase tracking-widest shadow-[0_4px_10px_rgba(245,158,11,0.4)] -mt-8 border border-yellow-200/50"
          >
            Pro
          </motion.div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 📍 ADMIN HEADER BAR (Header Bottom)                       */}
      {/* ========================================================= */}
      <div className="bg-white px-4 py-4 flex items-center gap-3 shadow-sm border-b border-gray-100 relative z-30">
        <button onClick={() => navigate('/profile')} className="text-gray-500 hover:bg-gray-100 p-1.5 rounded-lg active:scale-95 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="text-[16px] font-black text-gray-900 flex items-center gap-2">
          <span className="text-[18px]">⚙️</span> Master Admin
        </h1>
      </div>

      <div className="px-4 pt-5 space-y-4 relative z-30">
        
        {/* Real-time Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-50 rounded-full blur-2xl -mr-6 -mt-6 z-0 pointer-events-none"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 relative z-10">Total Users</p>
            <div className="text-3xl font-black text-[#6200EA] relative z-10">{totalUsers.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-50 rounded-full blur-2xl -mr-6 -mt-6 z-0 pointer-events-none"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 relative z-10">Redemptions</p>
            <div className="text-3xl font-black text-[#E65100] relative z-10">{totalRedemptions.toLocaleString()}</div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 📡 INTERACTIVE MONETAG SETTINGS WITH EDIT LOCK            */}
        {/* ========================================================= */}
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
          <h2 className="font-black text-[14px] text-gray-800 flex items-center gap-2 mb-4">📡 Monetag Ad Settings</h2>
          
          <div className="relative flex items-center">
            {/* Inline Edit Icon */}
            <button 
              onClick={() => setIsEditingZone(!isEditingZone)}
              className={`absolute left-3 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 ${isEditingZone ? 'bg-purple-100 text-purple-600' : 'bg-transparent text-gray-400 hover:bg-gray-100'}`}
            >
              ✏️
            </button>
            
            <input 
              type="text" 
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              disabled={!isEditingZone}
              placeholder="Enter Zone ID (e.g. 9773650)" 
              className={`w-full border text-sm font-bold rounded-xl pl-12 py-3.5 outline-none transition-all ${
                isEditingZone 
                  ? 'bg-white border-purple-400 shadow-[0_0_0_4px_rgba(167,139,250,0.1)] text-gray-900 pr-24' 
                  : 'bg-gray-50 border-gray-200 text-gray-500 shadow-inner pr-4'
              }`}
            />
            
            {/* Save Button only shows when editing */}
            <AnimatePresence>
              {isEditingZone && (
                <motion.button 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={handleSaveZone}
                  disabled={savingZone}
                  className="absolute right-2 bg-gradient-to-r from-[#E65100] to-[#FF9800] text-white font-black px-4 py-2 rounded-lg shadow-sm active:scale-95 transition-transform text-xs"
                >
                  {savingZone ? 'Saving...' : 'Save'}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          
          <p className="text-[10px] text-gray-400 font-medium mt-3 ml-1">
            {isEditingZone ? '🔓 Editing unlocked. Click Save when done.' : '🔒 Click the pencil icon to edit your Zone ID.'}
          </p>
        </div>

        {/* 🚀 DYNAMIC TASK GENERATOR */}
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
          <h2 className="font-black text-[14px] text-gray-800 flex items-center gap-2 mb-4">🚀 Custom Task Generator</h2>
          
          {/* Add Task Form */}
          <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 mb-5 space-y-3">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Emoji (📱)" 
                value={newTask.icon}
                onChange={(e) => setNewTask({...newTask, icon: e.target.value})}
                className="w-16 text-center bg-white border border-gray-200 text-gray-900 rounded-xl px-2 py-3 text-lg outline-none focus:border-blue-400"
              />
              <input 
                type="text" 
                placeholder="Task Title (e.g. Download App)" 
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                className="flex-1 bg-white border border-gray-200 text-gray-900 text-sm font-bold rounded-xl px-4 py-3 outline-none focus:border-blue-400"
              />
            </div>
            
            <input 
              type="text" 
              placeholder="Description (e.g. Install & Open the app)" 
              value={newTask.description}
              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              className="w-full bg-white border border-gray-200 text-gray-900 text-xs font-bold rounded-xl px-4 py-3 outline-none focus:border-blue-400"
            />
            
            <input 
              type="text" 
              placeholder="Action URL (e.g. https://play.google.com/...)" 
              value={newTask.action_url}
              onChange={(e) => setNewTask({...newTask, action_url: e.target.value})}
              className="w-full bg-white border border-gray-200 text-gray-900 text-xs font-bold rounded-xl px-4 py-3 outline-none focus:border-blue-400"
            />
            
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-[10px] font-bold text-gray-500 ml-1 block mb-1">Points Reward</label>
                <input 
                  type="number" 
                  value={newTask.points_reward}
                  onChange={(e) => setNewTask({...newTask, points_reward: parseInt(e.target.value) || 0})}
                  className="w-full bg-white border border-gray-200 text-gray-900 text-sm font-bold rounded-xl px-4 py-3 outline-none focus:border-blue-400"
                />
              </div>
              <div className="flex flex-col gap-1.5 flex-1 pb-1">
                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={newTask.requires_ad} onChange={(e) => setNewTask({...newTask, requires_ad: e.target.checked})} className="accent-blue-600 w-4 h-4" /> 
                  Require Ad
                </label>
                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={newTask.is_daily} onChange={(e) => setNewTask({...newTask, is_daily: e.target.checked})} className="accent-blue-600 w-4 h-4" /> 
                  Daily Task
                </label>
              </div>
            </div>
            
            <button 
              onClick={handleAddCustomTask}
              disabled={addingTask}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl shadow-md active:scale-95 transition-all mt-2"
            >
              {addingTask ? 'Saving...' : '➕ Create Custom Task'}
            </button>
          </div>

          {/* Active Tasks List */}
          <div className="space-y-3">
            {customTasks.length === 0 ? (
              <div className="text-center py-4 border-2 border-dashed border-gray-100 rounded-xl">
                <p className="text-[12px] text-gray-400 font-medium">No custom tasks yet.</p>
              </div>
            ) : (
              customTasks.map(task => (
                <div key={task.id} className="bg-white border border-gray-200 rounded-xl p-3 flex justify-between items-center relative overflow-hidden">
                  <div className="flex gap-3 items-center">
                    <div className="text-xl bg-gray-50 p-2 rounded-lg border border-gray-100">
                      {task.icon}
                    </div>
                    <div>
                      <h3 className="font-black text-[13px] text-gray-900 leading-tight">{task.title}</h3>
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                        <span className="text-yellow-500 font-bold">+{task.points_reward} pts</span> • {task.is_daily ? 'Daily' : 'One-time'} • {task.requires_ad ? 'Ads On' : 'No Ads'}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => deleteRecord('dynamic_tasks', task.id)} className="w-8 h-8 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-xs hover:bg-red-100 transition-colors">
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
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
                      <button onClick={() => deleteRecord('canva_links', link.id)} className="w-7 h-7 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-xs absolute top-3 right-3 hover:bg-red-100">
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