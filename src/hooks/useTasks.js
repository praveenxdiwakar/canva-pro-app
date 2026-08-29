import { useTelegram } from '../contexts/TelegramContext';
import { supabase } from '../api/supabase';

export function useTasks() {
  const { user } = useTelegram();

  const updatePoints = async (newTotalPoints) => {
    if (!user?.telegramId) return;
    
    // Save points to Supabase database permanently
    const { error } = await supabase
      .from('users')
      .update({ points: newTotalPoints })
      .eq('telegram_id', user.telegramId);
      
    if (error) console.error("Error saving points:", error);
  };

  const processCheckIn = async ({ newStreak, dateStr, pointsEarned }) => {
    if (!user?.telegramId) return 0;
    
    const newTotalPoints = (user.points || 0) + pointsEarned;
    
    // Save check-in streak, date, and points to Supabase database permanently
    const { error } = await supabase
      .from('users')
      .update({
        streak: newStreak,
        last_checkin: dateStr,
        points: newTotalPoints
      })
      .eq('telegram_id', user.telegramId);

    if (error) console.error("Error saving check-in:", error);
    
    return newTotalPoints;
  };

  return { updatePoints, processCheckIn };
}