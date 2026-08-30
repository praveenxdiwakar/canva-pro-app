import { supabase } from './supabase';

export async function syncUser(tgUser, referrerId = null) {
  if (!tgUser || !tgUser.telegramId) return null;
  
  try {
    const tgIdStr = String(tgUser.telegramId);

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', tgIdStr)
      .maybeSingle();

    if (!data) {
      // NEW USER: Create their profile (Now includes exact username and last_name)
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{
          telegram_id: tgIdStr,
          first_name: tgUser.firstName || "User",
          last_name: tgUser.lastName || "",
          username: tgUser.username || "",
          photo_url: tgUser.photoUrl || "",
          points: 0,
          streak: 0,
          last_checkin: null
        }])
        .select()
        .single();
        
      if (insertError) {
        console.error("Error creating user:", insertError);
        return null;
      }

      // REFERRAL SYSTEM: Reward the person who invited them
      if (referrerId && String(referrerId) !== tgIdStr) {
        const refIdStr = String(referrerId);
        const { data: refUser } = await supabase.from('users').select('points').eq('telegram_id', refIdStr).maybeSingle();
        
        if (refUser) {
          // 1. Give the referrer +5 Points
          await supabase.from('users').update({ points: refUser.points + 5 }).eq('telegram_id', refIdStr);
          
          // 2. Log it beautifully in the Reward History!
          await supabase.from('task_history').insert([{ 
            telegram_id: refIdStr, 
            task_name: 'Referral Bonus', 
            points_earned: 5, 
            icon: '👥' 
          }]);
        }
      }

      return newUser;
    }

    // EXISTING USER: Update avatar/name/username if changed on Telegram
    if (
      data.photo_url !== tgUser.photoUrl || 
      data.first_name !== tgUser.firstName || 
      data.last_name !== tgUser.lastName ||
      data.username !== tgUser.username
    ) {
      await supabase
        .from('users')
        .update({ 
          photo_url: tgUser.photoUrl, 
          first_name: tgUser.firstName,
          last_name: tgUser.lastName || "",
          username: tgUser.username || ""
        })
        .eq('telegram_id', tgIdStr);
    }

    return data;
  } catch (err) {
    console.error("Database connection error:", err);
    return null;
  }
}

export async function updatePointsInDb(telegramId, newPoints) {
  try {
    await supabase.from('users').update({ points: newPoints }).eq('telegram_id', String(telegramId));
  } catch (err) {
    console.error("Network error updating points:", err);
  }
  return newPoints;
}

export async function processDailyCheckInDb(telegramId, newStreak, dateStr, pointsEarned) {
  try {
    const tgIdStr = String(telegramId);
    const { data: user } = await supabase.from('users').select('points').eq('telegram_id', tgIdStr).maybeSingle();
    const currentPoints = user ? user.points : 0;
    const newPoints = currentPoints + pointsEarned;

    await supabase
      .from('users')
      .update({ streak: newStreak, last_checkin: dateStr, points: newPoints })
      .eq('telegram_id', tgIdStr);

    return newPoints;
  } catch (err) {
    console.error("Error processing check-in:", err);
    return pointsEarned; // Fallback
  }
}