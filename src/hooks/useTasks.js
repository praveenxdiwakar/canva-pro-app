import { useTelegram } from '../contexts/TelegramContext';
import { supabase } from '../api/supabase';

export function useTasks() {
  const { user } = useTelegram();

  const updatePoints = async (newTotalPoints) => {
    if (!user?.telegramId) return;
    
    const tgIdStr = String(user.telegramId);

    // 1. INSTANT LOCAL BACKUP (Bulletproof offline save)
    localStorage.setItem(`canva_pts_${tgIdStr}`, newTotalPoints);

    // 2. CLOUD SAVE
    const { error } = await supabase
      .from('users')
      .update({ points: newTotalPoints })
      .eq('telegram_id', tgIdStr);
      
    if (error) console.error("Error saving points to cloud:", error);
  };

  const processCheckIn = async ({ newStreak, dateStr, pointsEarned }) => {
    if (!user?.telegramId) return 0;
    
    const tgIdStr = String(user.telegramId);
    const newTotalPoints = (user.points || 0) + pointsEarned;
    
    // 1. INSTANT LOCAL BACKUP
    localStorage.setItem(`canva_pts_${tgIdStr}`, newTotalPoints);
    localStorage.setItem(`canva_streak_${tgIdStr}`, newStreak);
    localStorage.setItem(`canva_date_${tgIdStr}`, dateStr);

    // 2. CLOUD SAVE
    const { error } = await supabase
      .from('users')
      .update({
        streak: newStreak,
        last_checkin: dateStr,
        points: newTotalPoints
      })
      .eq('telegram_id', tgIdStr);

    if (error) console.error("Error saving check-in to cloud:", error);
    
    return newTotalPoints;
  };

  return { updatePoints, processCheckIn };
}