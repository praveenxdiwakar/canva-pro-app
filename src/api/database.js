import { supabase } from './supabase';

// --- USER OPERATIONS ---
export const syncUserToDb = async (tgUser) => {
  if (!tgUser || !tgUser.telegramId) return null;
  
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', tgUser.telegramId)
    .single();
  
  if (!data) {
    const { data: newUser } = await supabase
      .from('users')
      .insert([{
        telegram_id: tgUser.telegramId,
        first_name: tgUser.firstName,
        photo_url: tgUser.photoUrl,
        points: 0,
        streak: 0,
        last_checkin: null
      }])
      .select()
      .single();
    return newUser;
  }
  
  // Update photo/name if changed on Telegram
  if (data.photo_url !== tgUser.photoUrl || data.first_name !== tgUser.firstName) {
    await supabase
      .from('users')
      .update({ photo_url: tgUser.photoUrl, first_name: tgUser.firstName })
      .eq('telegram_id', tgUser.telegramId);
  }
  return data;
};

export const updatePoints = async (telegramId, newPoints) => {
  await supabase
    .from('users')
    .update({ points: newPoints })
    .eq('telegram_id', telegramId);
};

export const processDailyCheckIn = async (telegramId, newStreak, dateStr, pointsEarned) => {
  const { data: user } = await supabase
    .from('users')
    .select('points')
    .eq('telegram_id', telegramId)
    .single();
    
  const currentPoints = user ? user.points : 0;
  const newPoints = currentPoints + pointsEarned;
  
  await supabase
    .from('users')
    .update({ 
      streak: newStreak, 
      last_checkin: dateStr,
      points: newPoints 
    })
    .eq('telegram_id', telegramId);
  
  return newPoints;
};

// --- ADMIN OPERATIONS (LINKS & ADS) ---
export const getAdminLinks = async () => {
  const { data } = await supabase
    .from('canva_links')
    .select('*')
    .order('id', { ascending: true });
  return data || [];
};

export const saveAdminLink = async (linkData) => {
  if (linkData.id) {
    await supabase
      .from('canva_links')
      .update(linkData)
      .eq('id', linkData.id);
  } else {
    await supabase
      .from('canva_links')
      .insert([linkData]);
  }
};

export const deleteAdminLink = async (id) => {
  await supabase
    .from('canva_links')
    .delete()
    .eq('id', id);
};

export const getAdSettings = async () => {
  const { data } = await supabase
    .from('app_settings')
    .select('*');
  return data || [];
};

export const saveAdSetting = async (key, value) => {
  await supabase
    .from('app_settings')
    .upsert({ key, value });
};