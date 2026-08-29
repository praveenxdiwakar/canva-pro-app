import { supabase } from './supabase';

// Sync or create user profile in Supabase cloud database safely
export async function syncUser(tgUser) {
  if (!tgUser || !tgUser.telegramId) return { points: 0, streak: 0 };
  
  try {
    // Use maybeSingle() to avoid throwing errors if the user doesn't exist yet
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', tgUser.telegramId)
      .maybeSingle();

    if (error) {
      console.warn("Supabase query warning:", error.message);
    }

    if (!data) {
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
        console.error("Error creating user in Supabase:", insertError);
        return { telegramId: tgUser.telegramId, firstName: tgUser.firstName, photoUrl: tgUser.photoUrl, points: 0, streak: 0 };
      }
      return newUser;
    }

    // Update user avatar or name if updated on Telegram
    if (data.photo_url !== tgUser.photoUrl || data.first_name !== tgUser.firstName) {
      await supabase
        .from('users')
        .update({ photo_url: tgUser.photoUrl, first_name: tgUser.firstName })
        .eq('telegram_id', tgUser.telegramId);
    }

    return data;
  } catch (err) {
    console.error("Database connection fallback triggered:", err);
    return { telegramId: tgUser.telegramId, firstName: tgUser.firstName || "User", photoUrl: tgUser.photoUrl || "", points: 0, streak: 0 };
  }
}

export async function updatePointsInDb(telegramId, newPoints) {
  try {
    const { error } = await supabase
      .from('users')
      .update({ points: newPoints })
      .eq('telegram_id', telegramId);
      
    if (error) console.error("Error updating points:", error);
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
      .update({
        streak: newStreak,
        last_checkin: dateStr,
        points: newPoints
      })
      .eq('telegram_id', telegramId);

    return newPoints;
  } catch (err) {
    console.error("Error processing check-in:", err);
    return pointsEarned;
  }
}