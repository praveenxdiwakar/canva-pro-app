import { useTelegram } from '../contexts/TelegramContext';
import { supabase } from '../api/supabase';

export function useTasks() {
  const { user } = useTelegram();

  // Helper to log history
  const logHistory = async (tgId, taskName, points, icon) => {
    await supabase.from('task_history').insert([{
      telegram_id: tgId,
      task_name: taskName,
      points_earned: points,
      icon: icon
    }]);
  };

  // Standard points update (Used for Spins & Ads)
  const updatePoints = async (newTotalPoints, taskName = null, pointsEarned = 0, icon = '⭐') => {
    if (!user?.telegramId) return;
    const tgIdStr = String(user.telegramId);

    // Local Backup
    localStorage.setItem(`canva_pts_${tgIdStr}`, newTotalPoints);

    // Cloud Save
    await supabase.from('users').update({ points: newTotalPoints }).eq('telegram_id', tgIdStr);
      
    // Log History if details provided
    if (taskName && pointsEarned !== 0) {
      await logHistory(tgIdStr, taskName, pointsEarned, icon);
    }
  };

  // Specific Check-In Logic
  const processCheckIn = async ({ newStreak, dateStr, pointsEarned }) => {
    if (!user?.telegramId) return 0;
    const tgIdStr = String(user.telegramId);
    const newTotalPoints = (user.points || 0) + pointsEarned;
    
    localStorage.setItem(`canva_pts_${tgIdStr}`, newTotalPoints);
    localStorage.setItem(`canva_streak_${tgIdStr}`, newStreak);
    localStorage.setItem(`canva_date_${tgIdStr}`, dateStr);

    await supabase.from('users').update({
      streak: newStreak,
      last_checkin: dateStr,
      points: newTotalPoints
    }).eq('telegram_id', tgIdStr);

    // Log Check-In History
    await logHistory(tgIdStr, `Daily Check-in (Day ${newStreak})`, pointsEarned, '📅');
    
    return newTotalPoints;
  };

  return { updatePoints, processCheckIn };
}