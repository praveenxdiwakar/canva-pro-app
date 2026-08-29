import { supabase } from './supabase';

export async function syncUser(tgUser, referrerId = null) {
  if (!tgUser || !tgUser.telegramId) return null;
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', tgUser.telegramId)
      .maybeSingle();

    if (!data) {
      // NEW USER: Create their profile
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{
          telegram_id: tgUser.telegramId,
          first_name: tgUser.firstName || "User",
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
      if (referrerId && referrerId !== tgUser.telegramId) {
        const { data: refUser } = await supabase.from('users').select('points').eq('telegram_id', referrerId).maybeSingle();
        if (refUser) {
          await supabase.from('users').update({ points: refUser.points + 5 }).eq('telegram_id', referrerId);
        }
      }

      return newUser;
    }

    // EXISTING USER: Update avatar/name if changed on Telegram
    if (data.photo_url !== tgUser.photoUrl || data.first_name !== tgUser.firstName) {
      await supabase
        .from('users')
        .update({ photo_url: tgUser.photoUrl, first_name: tgUser.firstName })
        .eq('telegram_id', tgUser.telegramId);
    }

    return data;
  } catch (err) {
    console.error("Database connection error:", err);
    return null;
  }
}

export async function updatePointsInDb(telegramId, newPoints) {
  try {
    await supabase.from('users').update({ points: newPoints }).eq('telegram_id', telegramId);
  } catch (err) {
    console.error("Network error updating points:", err);
  }
  return newPoints;
}

export async function processDailyCheckInDb(telegramId, newStreak, dateStr, pointsEarned) {
  try {
    const { data: user } = await supabase.from('users').select('points').eq('telegram_id', telegramId).maybeSingle();
    const currentPoints = user ? user.points : 0;
    const newPoints = currentPoints + pointsEarned;

    await supabase
      .from('users')
      .update({ streak: newStreak, last_checkin: dateStr, points: newPoints })
      .eq('telegram_id', telegramId);

    return newPoints;
  } catch (err) {
    console.error("Error processing check-in:", err);
    return pointsEarned; // Fallback
  }
}