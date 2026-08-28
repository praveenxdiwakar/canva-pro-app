import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTelegram } from '../contexts/TelegramContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const { initData } = useTelegram();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch admin settings & permission check
  const { data: adminData, isLoading, error } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const res = await fetch('/api/admin/settings', { headers: { 'x-init-data': initData } });
      if (res.status === 403) throw new Error("Access denied");
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

  // 403 Access Denied / Non-Admin Screen matching source code
  if (error) {
    return (
      <div className="flex flex-col h-full min-h-[80vh] items-center justify-center gap-4 px-6 bg-[#f5f5f5] text-center">
        <div className="text-5xl">🔒</div>
        <div className="font-black text-gray-800 text-lg">Admin access required</div>
        <div className="text-sm text-gray-400">Your Telegram ID must be in ADMIN_TELEGRAM_IDS.</div>
        <button 
          onClick={() => navigate('/profile')} 
          className="bg-gray-900 text-white font-bold px-6 py-3 rounded-xl shadow-md active:scale-95 transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  const groups = adminData?.groups ?? [];
  const settingsByGroup = adminData?.settings.reduce((acc, s) => {
    if (!acc[s.group]) acc[s.group] = [];
    acc[s.group].push(s);
    return acc;
  }, {}) ?? {};

  const modifiedCount = adminData?.settings.filter(s => s.value !== s.default).length ?? 0;

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
        {modifiedCount > 0 && (
          <div className="bg-orange-100 text-orange-600 text-[10px] font-black px-2.5 py-1 rounded-full shrink-0">
            {modifiedCount} modified
          </div>
        )}
      </div>

      <div className="px-4 pt-4 space-y-3">
        {/* Invite Pool Manager Accordion */}
        <InvitePoolSection initData={initData} />

        {/* Channel Quotas Section */}
        <ChannelQuotaSection initData={initData} settings={adminData?.settings ?? []} />

        {/* Monetag Ads Section */}
        <MonetagSection initData={initData} settings={adminData?.settings ?? []} />

        {/* Dynamic Settings Groups */}
        {groups.filter(g => g !== "Monetag Ads" && g !== "Join Channels").map(groupName => (
          <SettingsGroup 
            key={groupName} 
            groupName={groupName} 
            settings={settingsByGroup[groupName] ?? []} 
            initData={initData} 
          />
        ))}

        {/* Warning Notice */}
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-xs text-amber-700 shadow-sm">
          <span className="shrink-0 mt-0.5">⚠️</span>
          <span>Spin probability values must sum to <strong>1.0</strong>. Changes apply within 60s.</span>
        </div>
      </div>
    </div>
  );
}

// Subcomponent: Individual Setting Row Editor
function SettingRow({ setting, initData, onSaved }) {
  const [val, setVal] = useState(setting.value);
  const [isDirty, setIsDirty] = useState(false);
  const queryClient = useQueryClient();

  const isText = setting.type === "text";
  const isModified = val !== setting.default;

  const saveMutation = useMutation({
    mutationFn: async (newValue) => {
      const res = await fetch(`/api/admin/settings/${setting.key}`, {
        method: 'PATCH',
        headers: { 'x-init-data': initData, 'content-type': 'application/json' },
        body: JSON.stringify({ value: newValue })
      });
      if (!res.ok) throw await res.json();
      return res.json();
    },
    onSuccess: () => {
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      onSaved();
    }
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/settings/reset/${setting.key}`, {
        method: 'POST',
        headers: { 'x-init-data': initData }
      });
      if (!res.ok) throw await res.json();
      return res.json();
    },
    onSuccess: () => {
      setVal(setting.default);
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      onSaved();
    }
  });

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isModified ? 'bg-orange-400' : 'bg-transparent'}`} />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-gray-800 leading-tight">{setting.label}</div>
        {isModified && !isDirty && <div className="text-[10px] text-gray-400 mt-0.5">Default: {setting.default}</div>}
      </div>
      
      {isText ? (
        <input 
          type="text" 
          value={val} 
          onChange={e => { setVal(e.target.value); setIsDirty(true); }}
          className={`w-36 text-xs border rounded-xl px-2.5 py-1.5 font-mono focus:outline-none focus:ring-2 focus:ring-purple-400 ${isModified ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}
        />
      ) : (
        <input 
          type="number" 
          value={val} 
          step={setting.type === "float" ? "0.01" : "1"} 
          min="0"
          onChange={e => { setVal(e.target.value); setIsDirty(true); }}
          className={`w-20 text-right text-xs font-mono border rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400 ${isModified ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}
        />
      )}

      <div className="flex items-center gap-1.5 shrink-0">
        {isDirty && (
          <button 
            onClick={() => saveMutation.mutate(val)}
            disabled={saveMutation.isPending}
            className="w-7 h-7 bg-purple-600 text-white rounded-lg flex items-center justify-center hover:bg-purple-700 transition-colors shadow-xs"
          >
            {saveMutation.isPending ? '...' : '✓'}
          </button>
        )}
        {isModified && !isDirty && (
          <button 
            onClick={() => resetMutation.mutate()}
            disabled={resetMutation.isPending}
            className="w-7 h-7 bg-gray-100 text-gray-400 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors text-xs font-bold"
            title="Reset to default"
          >
            ↺
          </button>
        )}
        {!isDirty && !isModified && <div className="w-7" />}
      </div>
    </div>
  );
}

// Subcomponent: Settings Accordion Category Group
function SettingsGroup({ groupName, settings, initData }) {
  const [isOpen, setIsOpen] = useState(false);
  const modifiedInGroup = settings.filter(s => s.value !== s.default).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button 
        className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-base shrink-0">⚙️</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-black text-purple-600">{groupName}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">
            {settings.length} setting{settings.length !== 1 ? 's' : ''} {modifiedInGroup > 0 && <span className="text-orange-500 font-bold">· {modifiedInGroup} modified</span>}
          </div>
        </div>
        <span className="text-gray-300 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
      </button>

      {isOpen && (
        <div className="px-4 pb-3 pt-1 border-t border-gray-50 space-y-1">
          {settings.map(s => <SettingRow key={s.key} setting={s} initData={initData} onSaved={() => {}} />)}
        </div>
      )}
    </div>
  );
}

// Subcomponent: Invite Pool Manager Section
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

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/admin/pool/${id}`, { method: 'DELETE', headers: { 'x-init-data': initData } });
      if (!res.ok) throw await res.json();
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-pool'] })
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center">
        <button 
          className="flex-1 px-4 py-3.5 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-base shrink-0">🎨</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-black text-purple-600">Canva Invite Pool</div>
            <div className="text-[10px] text-gray-400 mt-0.5">{poolList.length} links configured</div>
          </div>
          <span className="text-gray-300 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
        </button>
        <button 
          onClick={() => setEditingEntry('new')}
          className="mr-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shadow-xs"
        >
          + Add
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-gray-100 p-4 space-y-2">
          {isLoading ? (
            <div className="text-center py-4 text-xs text-gray-400">Loading pool links...</div>
          ) : poolList.length === 0 ? (
            <div className="text-center py-4 text-xs text-gray-400">No invite links added yet.</div>
          ) : (
            poolList.map(entry => {
              const remaining = entry.totalSlots - entry.usedSlots;
              return (
                <div key={entry.id} className="bg-gray-50 border border-gray-100 rounded-2xl p-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-800 text-xs">{entry.name}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {entry.usedSlots}/{entry.totalSlots} slots used · <span className={remaining > 0 ? "text-green-600 font-bold" : "text-red-500"}>{remaining} left</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditingEntry(entry)} className="p-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600">Edit</button>
                    <button onClick={() => confirm("Delete this pool item?") && deleteMutation.mutate(entry.id)} className="p-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-bold">🗑️</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// Subcomponent: Channel Quotas Section
function ChannelQuotaSection({ initData, settings }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button 
        className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-base shrink-0">📊</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-black text-blue-600">Join Channel Quota</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Manage Telegram channel verification limits</div>
        </div>
        <span className="text-gray-300 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
      </button>

      {isOpen && (
        <div className="border-t border-gray-100 p-4 space-y-3 text-xs text-gray-500">
          <p>Channel 01 and Channel 02 reward criteria and quotas can be customized live.</p>
        </div>
      )}
    </div>
  );
}

// Subcomponent: Monetag Ads Section
function MonetagSection({ initData, settings }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button 
        className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-base shrink-0">📡</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-black text-orange-600">Monetag Ad Settings</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Configure ad zone IDs & frequencies</div>
        </div>
        <span className="text-gray-300 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
      </button>

      {isOpen && (
        <div className="border-t border-gray-100 p-4 space-y-3 text-xs text-gray-500">
          <p>Manage rewarded interstitials, popups, and in-app ad zones directly from your Monetag account dashboard.</p>
        </div>
      )}
    </div>
  );
}