import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase'; // Import Supabase

export default function Admin() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24">
      <div className="bg-white px-4 pt-4 pb-3 flex items-center gap-3 border-b border-gray-100 shadow-sm sticky top-0 z-20">
        <button onClick={() => navigate('/profile')} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-black text-gray-900">⚙️ Admin Dashboard</h1>
          <div className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Connected to Supabase</div>
        </div>
      </div>
      <div className="px-4 pt-4 space-y-4">
        <InvitePoolManager />
        <MonetagAdsManager />
      </div>
    </div>
  );
}

// --- 1. SUPABASE CANVA LINKS MANAGER ---
function InvitePoolManager() {
  const [isOpen, setIsOpen] = useState(true);
  const [editingEntry, setEditingEntry] = useState(null);
  const queryClient = useQueryClient();

  // Fetch from Supabase Database
  const { data: poolList = [], isLoading } = useQuery({
    queryKey: ['supabase-links'],
    queryFn: async () => {
      const { data, error } = await supabase.from('canva_links').select('*').order('id', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  // Delete from Supabase Database
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('canva_links').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['supabase-links'] })
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center bg-gray-50/50">
        <button className="flex-1 px-4 py-4 flex items-center gap-3 text-left hover:bg-gray-100" onClick={() => setIsOpen(!isOpen)}>
          <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-lg shrink-0">🔗</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-black text-purple-700">Canva Invite Links</div>
            <div className="text-[10px] text-gray-500 mt-0.5">{poolList.length} links saved</div>
          </div>
        </button>
        <button onClick={() => setEditingEntry('new')} className="mr-3 bg-purple-600 text-white text-[11px] font-bold px-3.5 py-2 rounded-xl">
          + Add Link
        </button>
      </div>

      {isOpen && (
        <div className="p-4 space-y-3 bg-white border-t border-gray-100">
          {isLoading ? (
            <div className="text-center py-5 text-xs text-gray-400">Loading from database...</div>
          ) : poolList.length === 0 ? (
            <div className="text-center py-5 text-xs text-gray-400 border-2 border-dashed rounded-xl">No active links. Add one above!</div>
          ) : (
            poolList.map(entry => (
              <div key={entry.id} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between shadow-sm">
                <div>
                  <div className="font-bold text-gray-900 text-[13px]">{entry.name}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{entry.totalSlots - entry.usedSlots} left · {entry.usedSlots}/{entry.totalSlots} used</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditingEntry(entry)} className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-bold text-gray-600">Edit</button>
                  <button onClick={() => { if(window.confirm("Delete?")) deleteMutation.mutate(entry.id); }} className="px-2 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-bold">🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {editingEntry && (
        <InviteModal editing={editingEntry === 'new' ? null : editingEntry} onClose={() => setEditingEntry(null)} onSaved={() => queryClient.invalidateQueries({ queryKey: ['supabase-links'] })} />
      )}
    </div>
  );
}

function InviteModal({ editing, onClose, onSaved }) {
  const [name, setName] = useState(editing?.name || "");
  const [inviteLink, setInviteLink] = useState(editing?.inviteLink || "");
  const [totalSlots, setTotalSlots] = useState(editing?.totalSlots || 100);

  // Insert or Update in Supabase
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { name, inviteLink, totalSlots: Number(totalSlots) };
      if (editing) {
        const { error } = await supabase.from('canva_links').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('canva_links').insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => { onSaved(); onClose(); }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl">
        <h3 className="font-black text-lg mb-4">{editing ? "Edit Canva Link" : "Add New Canva Link"}</h3>
        <div className="space-y-4">
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Link Name" className="w-full border rounded-xl px-3 py-3 text-sm bg-gray-50" />
          <input type="text" value={inviteLink} onChange={e => setInviteLink(e.target.value)} placeholder="https://www.canva.com/..." className="w-full border rounded-xl px-3 py-3 text-sm bg-gray-50" />
          <input type="number" value={totalSlots} onChange={e => setTotalSlots(e.target.value)} placeholder="Total Slots" className="w-full border rounded-xl px-3 py-3 text-sm bg-gray-50" />
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 bg-gray-100 font-bold py-3.5 rounded-xl text-sm">Cancel</button>
          <button onClick={() => saveMutation.mutate()} className="flex-1 bg-purple-600 text-white font-bold py-3.5 rounded-xl text-sm">Save Link</button>
        </div>
      </div>
    </div>
  );
}

// --- 2. SUPABASE MONETAG ADS MANAGER ---
function MonetagAdsManager() {
  const [isOpen, setIsOpen] = useState(true);
  const adFormats = [
    { key: "ri", label: "Rewarded Interstitial", icon: "🎬" },
    { key: "rp", label: "Rewarded Popup", icon: "🎪" }
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button className="w-full px-4 py-4 flex items-center gap-3 text-left hover:bg-gray-50 bg-gray-50/50" onClick={() => setIsOpen(!isOpen)}>
        <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-lg shrink-0">📡</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-black text-orange-600">Monetag Ads Code</div>
          <div className="text-[10px] text-gray-500 mt-0.5">Edit Zone IDs permanently</div>
        </div>
      </button>

      {isOpen && (
        <div className="p-4 space-y-4 bg-white border-t border-gray-100">
          {adFormats.map(format => <AdFormatEditor key={format.key} format={format} />)}
        </div>
      )}
    </div>
  );
}

function AdFormatEditor({ format }) {
  const [enabled, setEnabled] = useState(false);
  const [zoneId, setZoneId] = useState("");

  // Fetch setting from Supabase
  useQuery({
    queryKey: ['ad-setting', format.key],
    queryFn: async () => {
      const { data } = await supabase.from('app_settings').select('value').eq('key', `MONETAG_${format.key.toUpperCase()}_ZONE_ID`).single();
      if (data) setZoneId(data.value);
      
      const { data: enabledData } = await supabase.from('app_settings').select('value').eq('key', `MONETAG_${format.key.toUpperCase()}_ENABLED`).single();
      if (enabledData) setEnabled(enabledData.value === 'true');
      return true;
    }
  });

  const handleSave = async () => {
    await supabase.from('app_settings').upsert({ key: `MONETAG_${format.key.toUpperCase()}_ZONE_ID`, value: zoneId });
    await supabase.from('app_settings').upsert({ key: `MONETAG_${format.key.toUpperCase()}_ENABLED`, value: String(enabled) });
    alert(`${format.label} Saved to Database!`);
  };

  return (
    <div className={`rounded-xl border p-4 ${enabled ? "border-orange-300 bg-orange-50/80" : "border-gray-200"}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{format.icon}</span>
        <span className="font-black text-[13px]">{format.label}</span>
      </div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-gray-500 font-bold">Enable Ad</span>
        <button onClick={() => setEnabled(!enabled)} className={`relative w-12 h-6 rounded-full ${enabled ? "bg-green-500" : "bg-gray-200"}`}>
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${enabled ? "translate-x-6" : "translate-x-0"}`} />
        </button>
      </div>
      <input type="text" value={zoneId} onChange={(e) => setZoneId(e.target.value)} placeholder="Zone ID (e.g. 11525410)" className="w-full mb-3 border rounded-lg px-3 py-2.5 text-sm bg-white" />
      <button onClick={handleSave} className="w-full bg-orange-500 text-white font-bold py-2.5 rounded-lg text-sm">Save Settings</button>
    </div>
  );
}