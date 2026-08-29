import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24">
      <div className="bg-white px-4 pt-4 pb-3 flex items-center gap-3 border-b border-gray-100 shadow-sm sticky top-0 z-20">
        <button onClick={() => navigate('/profile')} className="p-1.5 rounded-lg hover:bg-gray-100">
          <span className="font-bold text-gray-600">← Back</span>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-black text-gray-900">⚙️ Admin Dashboard</h1>
          <div className="text-[10px] text-green-500 font-bold uppercase">Local Memory Mode</div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        <InvitePoolManager />
        <MonetagAdsManager />
      </div>
    </div>
  );
}

function InvitePoolManager() {
  const [isOpen, setIsOpen] = useState(true);
  const [links, setLinks] = useState(() => JSON.parse(localStorage.getItem('canva_links') || '[]'));

  const handleAddLink = () => {
    const name = prompt("Enter Link Name (e.g. Team 1):");
    const url = prompt("Enter Canva URL:");
    if (name && url) {
      const newLinks = [...links, { id: Date.now(), name, url, used: 0, total: 100 }];
      setLinks(newLinks);
      localStorage.setItem('canva_links', JSON.stringify(newLinks));
    }
  };

  const handleDelete = (id) => {
    const updated = links.filter(l => l.id !== id);
    setLinks(updated);
    localStorage.setItem('canva_links', JSON.stringify(updated));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center bg-gray-50">
        <button className="flex-1 px-4 py-4 text-left font-black text-purple-700" onClick={() => setIsOpen(!isOpen)}>
          🔗 Canva Invite Links ({links.length})
        </button>
        <button onClick={handleAddLink} className="mr-3 bg-purple-600 text-white text-[11px] font-bold px-3.5 py-2 rounded-xl">
          + Add
        </button>
      </div>
      {isOpen && (
        <div className="p-4 space-y-3">
          {links.length === 0 ? <p className="text-xs text-gray-400">No links saved.</p> : 
            links.map(l => (
              <div key={l.id} className="border p-3 rounded-xl flex justify-between">
                <div className="text-sm font-bold">{l.name}</div>
                <button onClick={() => handleDelete(l.id)} className="text-red-500 text-xs font-bold">🗑️</button>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}

function MonetagAdsManager() {
  const [zoneId, setZoneId] = useState(() => localStorage.getItem('ad_zone_ri') || "");

  const saveSettings = () => {
    localStorage.setItem('ad_zone_ri', zoneId);
    alert("Ad Zone Saved!");
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-4">
      <h3 className="font-black text-orange-600 mb-2">📡 Monetag Ad Settings</h3>
      <input type="text" value={zoneId} onChange={e => setZoneId(e.target.value)} placeholder="Zone ID" className="w-full border rounded-xl px-3 py-2 mb-3" />
      <button onClick={saveSettings} className="bg-orange-500 text-white font-bold w-full py-2.5 rounded-xl">Save</button>
    </div>
  );
}