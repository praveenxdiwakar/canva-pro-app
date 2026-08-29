import React, { useState, useEffect } from 'react';
import { useTelegram } from '../contexts/TelegramContext';
import { getAdminLinks, saveAdminLink, deleteAdminLink, getAdSettings, saveAdSetting } from '../api/database';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const { user } = useTelegram();
  const navigate = useNavigate();
  const [links, setLinks] = useState([]);
  const [adZone, setAdZone] = useState("");

  if (user?.telegramId !== import.meta.env.VITE_ADMIN_TELEGRAM_ID) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-black text-red-600 mb-2">Access Denied 🔒</h1>
          <p className="text-sm text-gray-500">You do not have permission to view the Admin Dashboard.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    getAdminLinks().then(setLinks);
    getAdSettings().then(settings => {
      const zone = settings.find(s => s.key === 'MONETAG_ZONE_ID');
      if (zone) setAdZone(zone.value);
    });
  }, []);

  const handleAddLink = async () => {
    const name = prompt("Link Name (e.g. Team 1):");
    const url = prompt("Canva Invite URL:");
    if (name && url) {
      await saveAdminLink({ name, url, total_slots: 100, used_slots: 0 });
      getAdminLinks().then(setLinks);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this link?")) {
      await deleteAdminLink(id);
      getAdminLinks().then(setLinks);
    }
  };

  const handleSaveAd = async () => {
    await saveAdSetting('MONETAG_ZONE_ID', adZone);
    alert("Ad Zone saved successfully to Supabase!");
  };

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24 px-4 pt-4 space-y-4">
      <div className="bg-white px-4 pt-4 pb-3 flex items-center gap-3 border-b border-gray-100 shadow-sm">
        <button onClick={() => navigate('/profile')} className="font-bold text-gray-600 text-sm">← Back</button>
        <h1 className="text-lg font-black text-gray-900">⚙️ Admin Dashboard</h1>
      </div>

      <div className="bg-white rounded-2xl border p-4 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="font-black text-purple-700 text-sm">🔗 Canva Links ({links.length})</h2>
          <button onClick={handleAddLink} className="bg-purple-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs">+ Add Link</button>
        </div>
        <div className="space-y-2">
          {links.map(l => (
            <div key={l.id} className="border p-3 rounded-xl flex justify-between items-center text-sm">
              <div>
                <div className="font-bold text-gray-900">{l.name}</div>
                <div className="text-[10px] text-gray-500">{l.used_slots}/{l.total_slots} slots used</div>
              </div>
              <button onClick={() => handleDelete(l.id)} className="text-red-500 font-bold bg-red-50 px-2.5 py-1.5 rounded-lg text-xs">🗑️</button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border p-4 shadow-sm space-y-3">
        <h2 className="font-black text-orange-600 text-sm">📡 Monetag Ad Settings</h2>
        <input type="text" value={adZone} onChange={e => setAdZone(e.target.value)} placeholder="Zone ID (e.g. 11525410)" className="w-full border rounded-xl px-3 py-2.5 text-sm" />
        <button onClick={handleSaveAd} className="w-full bg-orange-500 text-white font-bold py-2.5 rounded-lg text-sm shadow-sm">Save Ad Zone</button>
      </div>
    </div>
  );
}