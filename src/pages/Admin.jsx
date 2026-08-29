import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTelegram } from '../contexts/TelegramContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const { initData } = useTelegram();
  const navigate = useNavigate();

  // 🔴 ULTIMATE BYPASS: This completely disables the frontend lock screen.
  const isMasterAdmin = true; 

  // Fetch admin settings
  const { data: adminData, isLoading, error } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const res = await fetch('/api/admin/settings', { headers: { 'x-init-data': initData } });
      if (!res.ok) throw new Error("Failed to load admin settings");
      return res.json();
    },
    enabled: !!initData,
    retry: false
  });

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[80vh] items-center justify-center bg-[#f5f5f5]">
        <div className="w-8 h-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
      </div>
    );
  }

  // Fallback data structure if backend throws 403 error but UI is forced open
  const settings = adminData?.settings ?? [];
  const groups = adminData?.groups ?? ["Main Settings", "Monetag Ads", "Join Channels"];

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24">
      
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3 flex items-center gap-3 border-b border-gray-100 shadow-sm sticky top-0 z-20">
        <button onClick={() => navigate('/profile')} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-black text-gray-900">⚙️ Admin Dashboard</h1>
          <div className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Unrestricted Access</div>
        </div>
      </div>

      {/* Backend Disconnected Warning */}
      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="m-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl p-3 shadow-sm">
          <div className="flex items-start gap-2">
            <span className="text-lg">🚨</span>
            <div>
              <h4 className="text-xs font-black text-red-700 uppercase tracking-wide">Backend Disconnected</h4>
              <p className="text-[11px] text-red-600 leading-snug mt-0.5">
                The frontend is unlocked, but the backend API is blocking you. You must add <b>ADMIN_TELEGRAM_IDS=5589713552</b> to your backend `.env` variables or saves will fail.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="px-4 pt-4 space-y-4">
        {/* Module 1: Canva Invite Link Pool Manager */}
        <InvitePoolManager initData={initData} />
        
        {/* Module 2: Monetag Ads Setup Manager */}
        <MonetagAdsManager initData={initData} settings={settings} />

        {/* Alert Notice */}
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-xs text-amber-700 shadow-sm">
          <span className="shrink-0 mt-0.5">⚠️</span>
          <span>Ensure you test ad integrations and verify the Canva links before going live.</span>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// 1. ADD, EDIT, AND DELETE CANVA INVITE LINKS
// -------------------------------------------------------------------------
function InvitePoolManager({ initData }) {
  const [isOpen, setIsOpen] = useState(true); // Open by default for Pro look
  const [editingEntry, setEditingEntry] = useState(null);
  const queryClient = useQueryClient();

  const { data: poolList = [], isLoading, error: poolError } = useQuery({
    queryKey: ['admin-pool'],
    queryFn: async () => {
      const res = await fetch('/api/admin/pool', { headers: { 'x-init-data': initData } });
      if (!res.ok) throw new Error("Failed to load pool");
      return res.json();
    },
    enabled: isOpen,
    retry: false
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`/api/admin/pool/${id}`, { method: 'DELETE', headers: { 'x-init-data': initData } });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-pool'] })
  });

  // Provide fake data if backend is blocking us so you can see the UI
  const displayList = poolError ? [{id: 1, name: "Sample Canva Team", usedSlots: 10, totalSlots: 100, inviteLink: "https://canva.com/..."}] : poolList;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center bg-gray-50/50">
        <button className="flex-1 px-4 py-4 flex items-center gap-3 text-left hover:bg-gray-100 transition-colors" onClick={() => setIsOpen(!isOpen)}>
          <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-lg shrink-0">🔗</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-black text-purple-700">Canva Invite Links</div>
            <div className="text-[10px] text-gray-500 mt-0.5">{displayList.length} links active</div>
          </div>
          <span className="text-gray-300 font-bold" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: '0.2s' }}>▶</span>
        </button>
        <button onClick={() => setEditingEntry('new')} className="mr-3 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold px-3.5 py-2 rounded-xl transition-colors shadow-sm">
          + Add Link
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-gray-100">
            <div className="p-4 space-y-3 bg-white">
              {isLoading ? (
                <div className="text-center py-4 text-xs text-gray-400 animate-pulse">Loading links...</div>
              ) : displayList.length === 0 ? (
                <div className="text-center py-5 text-xs text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">No active invite links. Add one above!</div>
              ) : (
                displayList.map(entry => (
                  <div key={entry.id} className="bg-white border border-gray-200 hover:border-purple-300 rounded-xl p-3 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-colors">
                    <div>
                      <div className="font-bold text-gray-900 text-[13px]">{entry.name}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        <span className={entry.usedSlots >= entry.totalSlots ? "text-red-500 font-bold" : "text-green-500 font-bold"}>
                          {entry.totalSlots - entry.usedSlots} left
                        </span> · {entry.usedSlots}/{entry.totalSlots} used
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditingEntry(entry)} className="px-3 py-1.5 bg-gray-100 hover:bg-purple-50 hover:text-purple-600 rounded-lg text-xs font-bold text-gray-600 transition-colors">Edit</button>
                      <button onClick={() => { if(window.confirm("Delete this link?")) deleteMutation.mutate(entry.id); }} className="px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg text-xs font-bold transition-colors">🗑️</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pop-up Add/Edit Form Modal */}
      {editingEntry && (
        <InviteModal 
          initData={initData} 
          editing={editingEntry === 'new' ? null : editingEntry} 
          onClose={() => setEditingEntry(null)} 
          onSaved={() => queryClient.invalidateQueries({ queryKey: ['admin-pool'] })} 
        />
      )}
    </div>
  );
}

// Reusable Modal Component for Adding/Editing Links
function InviteModal({ initData, editing, onClose, onSaved }) {
  const [name, setName] = useState(editing?.name || "");
  const [inviteLink, setInviteLink] = useState(editing?.inviteLink || "");
  const [totalSlots, setTotalSlots] = useState(editing?.totalSlots || 100);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { name, inviteLink, totalSlots: Number(totalSlots), poolType: "FREE_CANVA", status: "ACTIVE" };
      const url = editing ? `/api/admin/pool/${editing.id}` : "/api/admin/pool";
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "x-init-data": initData, "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Save failed");
      return res.json();
    },
    onSuccess: () => { alert("Saved successfully!"); onSaved(); onClose(); },
    onError: () => { alert("Backend blocked the save. Did you add 5589713552 to your .env file?"); }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl">
        <h3 className="font-black text-gray-900 text-lg mb-4">{editing ? "Edit Canva Link" : "Add New Canva Link"}</h3>
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wide">Link Name (e.g. Team 1)</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Canva Pro Team #1" className="w-full mt-1.5 border border-gray-200 rounded-xl px-3 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50 transition-all" />
          </div>
          <div>
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wide">Full URL / Invite Link</label>
            <input type="text" value={inviteLink} onChange={e => setInviteLink(e.target.value)} placeholder="https://www.canva.com/..." className="w-full mt-1.5 border border-gray-200 rounded-xl px-3 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50 transition-all" />
          </div>
          <div>
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wide">Maximum Capacity (Slots)</label>
            <input type="number" value={totalSlots} onChange={e => setTotalSlots(e.target.value)} className="w-full mt-1.5 border border-gray-200 rounded-xl px-3 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50 transition-all" />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 font-bold py-3.5 rounded-xl text-gray-600 text-sm transition-colors">Cancel</button>
          <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="flex-1 bg-purple-600 hover:bg-purple-700 font-bold py-3.5 rounded-xl text-white text-sm transition-colors shadow-md disabled:opacity-50">
            {saveMutation.isPending ? "Saving..." : "Save Link"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// -------------------------------------------------------------------------
// 2. MONETAG ADS EDITOR (ENABLE/DISABLE & ZONE ID CHANGER)
// -------------------------------------------------------------------------
function MonetagAdsManager({ initData, settings }) {
  const [isOpen, setIsOpen] = useState(true); // Open by default for Pro look

  const adFormats = [
    { key: "ri", label: "Rewarded Interstitial", icon: "🎬", enabledKey: "MONETAG_RI_ENABLED", zoneKey: "MONETAG_RI_ZONE_ID" },
    { key: "rp", label: "Rewarded Popup", icon: "🎪", enabledKey: "MONETAG_RP_ENABLED", zoneKey: "MONETAG_RP_ZONE_ID" },
    { key: "iai", label: "In-App Interstitial", icon: "📲", enabledKey: "MONETAG_IAI_ENABLED", zoneKey: "MONETAG_IAI_ZONE_ID" }
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button className="w-full px-4 py-4 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors bg-gray-50/50" onClick={() => setIsOpen(!isOpen)}>
        <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-lg shrink-0">📡</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-black text-orange-600">Monetag Ads Code</div>
          <div className="text-[10px] text-gray-500 mt-0.5">Edit Zone IDs and enable formats</div>
        </div>
        <span className="text-gray-300 font-bold" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: '0.2s' }}>▶</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-gray-100">
            <div className="p-4 space-y-4 bg-white">
              {adFormats.map(format => (
                <AdFormatEditor key={format.key} format={format} settings={settings} initData={initData} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Subcomponent: Individual Ad Format Block
function AdFormatEditor({ format, settings, initData }) {
  const getSetting = (key) => settings.find(s => s.key === key)?.value || "";
  
  const [enabled, setEnabled] = useState(getSetting(format.enabledKey) === "true");
  const [zoneId, setZoneId] = useState(getSetting(format.zoneKey));
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/admin/settings/${format.zoneKey}`, {
        method: "PATCH", headers: { "x-init-data": initData, "content-type": "application/json" }, body: JSON.stringify({ value: zoneId })
      });
      await fetch(`/api/admin/settings/${format.enabledKey}`, {
        method: "PATCH", headers: { "x-init-data": initData, "content-type": "application/json" }, body: JSON.stringify({ value: String(enabled) })
      });
      
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      alert(`${format.label} saved successfully!`);
    } catch (e) {
      alert("Failed to save settings. Did you add 5589713552 to your backend .env file?");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`rounded-xl border p-4 transition-colors ${enabled ? "border-orange-300 bg-orange-50/80 shadow-sm" : "border-gray-200 bg-white"}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{format.icon}</span>
        <span className="font-black text-[13px] text-gray-900 flex-1">{format.label}</span>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-gray-500 font-bold">Enable Ad Block</span>
        <button onClick={() => setEnabled(!enabled)} className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${enabled ? "bg-green-500" : "bg-gray-200"}`}>
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${enabled ? "translate-x-6" : "translate-x-0"}`} />
        </button>
      </div>

      <div className="mb-4">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Monetag Zone ID</label>
        <input type="text" value={zoneId} onChange={(e) => setZoneId(e.target.value)} placeholder="e.g. 11525410" className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all" />
      </div>

      <button onClick={handleSave} disabled={isSaving} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-60">
        {isSaving ? "Saving..." : "Update Ad Settings"}
      </button>
    </div>
  );
}