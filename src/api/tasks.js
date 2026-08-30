import { supabase } from './supabase';

export async function syncUser(tgUser, referrerId = null) {
  if (!tgUser || !tgUser.telegramId) return null;
  
  try {
    const tgIdStr = String(tgUser.telegramId);

    // Fetch user by checking all possible column names safely
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`telegram_id.eq.${tgIdStr},telegramid.eq.${tgIdStr},id.eq.${tgIdStr}`)
      .maybeSingle();

    if (!data) {
      // NEW USER: Create their profile
      let payload = {
        telegram_id: tgIdStr,
        first_name: tgUser.firstName || "User",
        last_name: tgUser.lastName || "",
        username: tgUser.username || "",
        photo_url: tgUser.photoUrl || "",
        points: 0,
        streak: 0,
        last_checkin: null
      };

      let { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([payload])
        .select()
        .maybeSingle();
        
      // 🔥 AUTO-FIX: If database complains about missing 'telegramid' (no underscore), retry with it!
      if (insertError && (insertError.message.includes('telegramid') || insertError.code === '23502')) {
        payload.telegramid = tgIdStr; // Add the required column
        const retry = await supabase.from('users').insert([payload]).select().maybeSingle();
        newUser = retry.data;
        insertError = retry.error;
      }

      if (insertError) {
        console.error("Error creating user:", insertError);
        return null;
      }

      // REFERRAL SYSTEM
      if (referrerId && String(referrerId) !== tgIdStr) {
        const refIdStr = String(referrerId);
        const { data: refUser } = await supabase.from('users').select('points').or(`telegram_id.eq.${refIdStr},telegramid.eq.${refIdStr}`).maybeSingle();
        if (refUser) {
          await supabase.from('users').update({ points: refUser.points + 5 }).eq('telegram_id', refIdStr);
          await supabase.from('task_history').insert([{ telegram_id: refIdStr, task_name: 'Referral Bonus', points_earned: 5, icon: '👥' }]);
        }
      }

      return newUser;
    }

    // EXISTING USER: Update avatar/name if changed
    const updates = { 
      photo_url: tgUser.photoUrl, 
      first_name: tgUser.firstName,
      last_name: tgUser.lastName || "",
      username: tgUser.username || ""
    };

    // Safely update both possible column names
    await supabase.from('users').update(updates).eq('telegram_id', tgIdStr);
    await supabase.from('users').update(updates).eq('telegramid', tgIdStr); 

    return data;
  } catch (err) {
    console.error("Database connection error:", err);
    return null;
  }
}

export async function updatePointsInDb(telegramId, newPoints) {
  try {
    const tgIdStr = String(telegramId);
    await supabase.from('users').update({ points: newPoints }).eq('telegram_id', tgIdStr);
    await supabase.from('users').update({ points: newPoints }).eq('telegramid', tgIdStr);
  } catch (err) {
    console.error("Network error updating points:", err);
  }
  return newPoints;
}

export async function processDailyCheckInDb(telegramId, newStreak, dateStr, pointsEarned) {
  try {
    const tgIdStr = String(telegramId);
    const { data: user } = await supabase.from('users').select('points').or(`telegram_id.eq.${tgIdStr},telegramid.eq.${tgIdStr}`).maybeSingle();
    const currentPoints = user ? user.points : 0;
    const newPoints = currentPoints + pointsEarned;

    const updates = { streak: newStreak, last_checkin: dateStr, points: newPoints };
    await supabase.from('users').update(updates).eq('telegram_id', tgIdStr);
    await supabase.from('users').update(updates).eq('telegramid', tgIdStr);

    return newPoints;
  } catch (err) {
    console.error("Error processing check-in:", err);
    return pointsEarned; 
  }
}