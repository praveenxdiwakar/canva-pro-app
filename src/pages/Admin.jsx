import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTelegram } from '../contexts/TelegramContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const { initData } = useTelegram();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Aggressively extract Telegram ID natively to prevent lockouts
  const tgId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString() || "";
  const isMasterAdmin = tgId === "5589713552";

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

  // FORCE BYPASS: If there is an error, BUT it's you (5589713552), IGNORE the lock screen!
  if (error && !isMasterAdmin) {
    return (
      <div className="flex flex-col h-full min-h-[80vh] items-center justify-center gap-4 px-6 bg-[#f5f5f5] text-center">
        <div className="text-5xl">🔒</div>
        <div className="font-black text-gray-800 text-lg">Admin access required</div>
        <div className="text-sm text-gray-400">
          Your Telegram ID must be authorized in your backend's ADMIN_TELEGRAM_IDS variable.
        </div>
        <button onClick={() => navigate('/profile')} className="mt-2 bg-gray-900 text-white font-bold px-6 py-3 rounded-xl shadow-md active:scale-95 transition-all">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3 flex items-center gap-3 border-b border-gray-100 shadow-sm sticky top-0 z-20">
        <button onClick={() => navigate('/profile')} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-black text-gray-900">⚙️ Admin Settings</h1>
          <div className="text-[10px] text-gray-400 font-medium">Changes apply within 60 seconds</div>
        </div>
      </div>

      {/* Warning Notice if backend blocked us but we forced the UI open */}
      {error && isMasterAdmin && (
        <div className="m-4 bg-red-50 border border-red-200 rounded-xl p-3 text-[11px] text-red-600 font-semibold shadow-sm">
          🚨 You bypassed the lock screen, but your backend API threw an error. Make sure <b>5589713552</b> is set in your backend's ADMIN_TELEGRAM_IDS variable, otherwise saving edits will fail.
        </div>
      )}

      <div className="px-4 pt-4 space-y-3">
        {/* Features you requested: Links Manager and Ads Code */}
        <InvitePoolSection initData={initData} />
        <MonetagSection initData={initData} settings={adminData?.settings ?? []} />
        
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-xs text-amber-700 shadow-sm">
          <span className="shrink-0 mt-0.5">⚠️</span>
          <span>Only Master Admins can modify these values. Make sure you verify settings before saving.</span>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 1. ADD, EDIT, AND UPDATE LINKS (INVITE POOL MANAGER)
// ----------------------------------------------------------------------
function InvitePoolSection({ initData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const queryClient = useQueryClient();

  const { data: poolList = [], isLoading } = useQuery({
    queryKey: ['admin-pool'],
    queryFn: async () => {
      const res = await fetch('/api/admin/pool', { headers: { 'x-init-data': initData } });
      if (!res.ok) throw new Error("Failed to load pool");
      return res.json();
    },
    enabled: isOpen,
    staleTime: 15000
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center">
        <button className="flex-1 px-4 py-3.5 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors" onClick={() => setIsOpen(!isOpen)}>
          <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-base shrink-0">🔗</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-black text-purple-600">Canva Invite Links</div>
            <div className="text-[10px] text-gray-400 mt-0.5">{poolList.length} links configured</div>
          </div>
          <span className="text-gray-300 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
        </button>
        <button onClick={() => setEditingEntry('new')} className="mr-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
          + Add Link
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-gray-100 p-4 space-y-2">
          {isLoading ? (
            <div className="text-center py-4 text-xs text-gray-400">Loading pool links...</div>
          ) : poolList.length === 0 ? (
            <div className="text-center py-4 text-xs text-gray-400">No invite links added yet.</div>
          ) : (
            poolList.map(entry => (
              <div key={entry.id} className="bg-gray-50 border border-gray-100 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-800 text-xs">{entry.name}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {entry.usedSlots}/{entry.totalSlots} slots used
                  </div>
                </div>
                <button onClick={() => setEditingEntry(entry)} className="p-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600">
                  Edit
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Editor Modal */}
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
    onSuccess: () => { onSaved(); onClose(); }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl">
        <h3 className="font-black text-gray-900 mb-4">{editing ? "Edit Link" : "Add New Link"}</h3>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase">Link Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Canva Team #1" className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-400" />
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase">Canva URL</label>
            <input type="text" value={inviteLink} onChange={e => setInviteLink(e.target.value)} placeholder="https://www.canva.com/..." className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-400" />
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase">Total Slots Available</label>
            <input type="number" value={totalSlots} onChange={e => setTotalSlots(e.target.value)} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-400" />
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="flex-1 bg-gray-100 font-bold py-3 rounded-xl text-gray-600">Cancel</button>
          <button onClick={() => saveMutation.mutate()} className="flex-1 bg-purple-600 font-bold py-3 rounded-xl text-white">Save Link</button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 2. MONETAG ADS CODE MANAGER
// ----------------------------------------------------------------------
function MonetagSection({ initData, settings }) {
  const [isOpen, setIsOpen] = useState(false);

  const adFormats = [
    { key: "ri", label: "Rewarded Interstitial", icon: "🎬", enabledKey: "MONETAG_RI_ENABLED", zoneKey: "MONETAG_RI_ZONE_ID" },
    { key: "rp", label: "Rewarded Popup", icon: "🎪", enabledKey: "MONETAG_RP_ENABLED", zoneKey: "MONETAG_RP_ZONE_ID" },
    { key: "iai", label: "In-App Interstitial", icon: "📲", enabledKey: "MONETAG_IAI_ENABLED", zoneKey: "MONETAG_IAI_ZONE_ID" }
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors" onClick={() => setIsOpen(!isOpen)}>
        <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-base shrink-0">📡</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-black text-orange-600">Monetag Ads Code</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Configure Ad Zone IDs</div>
        </div>
        <span className="text-gray-300 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
      </button>

      {isOpen && (
        <div className="border-t border-gray-100 p-4 space-y-3">
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-xs text-blue-700 mb-1">
            <span className="shrink-0 mt-0.5">ℹ️</span>
            <span>Paste your Monetag Zone IDs here to activate ads.</span>
          </div>
          {adFormats.map(format => (
            <AdFormatRow key={format.key} format={format} settings={settings} initData={initData} />
          ))}
        </div>
      )}
    </div>
  );
}

function AdFormatRow({ format, settings, initData }) {
  const getSetting = (key) => settings.find(s => s.key === key)?.value || "";
  
  const [enabled, setEnabled] = useState(getSetting(format.enabledKey) === "true");
  const [zoneId, setZoneId] = useState(getSetting(format.zoneKey));
  const queryClient = useQueryClient();

  const handleSave = async () => {
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
      alert("Failed to save settings. Is your backend updated?");
    }
  };

  return (
    <div className={`rounded-2xl border p-4 transition-colors ${enabled ? "border-orange-200 bg-orange-50/50" : "border-gray-100 bg-white"}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">{format.icon}</span>
        <span className="font-black text-sm text-gray-800 flex-1">{format.label}</span>
      </div>
      
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 font-semibold">Enable Ads</span>
        <button onClick={() => setEnabled(!enabled)} className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${enabled ? "bg-green-500" : "bg-gray-200"}`}>
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${enabled ? "translate-x-5" : "translate-x-0"}`} />
        </button>
      </div>

      <div className="mb-3">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Zone ID</label>
        <input type="text" value={zoneId} onChange={(e) => setZoneId(e.target.value)} placeholder="e.g. 11525410" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono bg-white focus:ring-2 focus:ring-orange-300" />
      </div>

      <button onClick={handleSave} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-sm transition-all">
        Save Ad Code
      </button>
    </div>
  );
}