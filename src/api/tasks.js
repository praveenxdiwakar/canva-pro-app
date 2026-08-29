import { supabase } from './supabase';

// Sync or create user profile in Supabase cloud database
export async function syncUser(tgUser) {
  if (!tgUser || !tgUser.telegramId) return null;
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', tgUser.telegramId)
    .single();

  if (!data) {
    const { data: newUser, error: insertError } = await supabase
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
      
    if (insertError) console.error("Error creating user in Supabase:", insertError);
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
}

export async function updatePointsInDb(telegramId, newPoints) {
  const { error } = await supabase
    .from('users')
    .update({ points: newPoints })
    .eq('telegram_id', telegramId);
    
  if (error) console.error("Error updating points:", error);
  return newPoints;
}

export async function processDailyCheckInDb(telegramId, newStreak, dateStr, pointsEarned) {
  const { data: user } = await supabase.from('users').select('points').eq('telegram_id', telegramId).single();
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
}