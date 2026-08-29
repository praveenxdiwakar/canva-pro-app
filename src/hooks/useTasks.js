import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTelegram } from './useTelegram';
import { updatePointsInDb, processDailyCheckInDb } from '../api/tasks';

export function useTasks() {
  const { user } = useTelegram();
  const queryClient = useQueryClient();

  const updatePointsMutation = useMutation({
    mutationFn: (newPoints) => updatePointsInDb(user.telegramId, newPoints),
    onSuccess: () => {
      queryClient.invalidateQueries(['user', user?.telegramId]);
    }
  });

  const checkInMutation = useMutation({
    mutationFn: ({ newStreak, dateStr, pointsEarned }) => 
      processDailyCheckInDb(user.telegramId, newStreak, dateStr, pointsEarned),
    onSuccess: () => {
      queryClient.invalidateQueries(['user', user?.telegramId]);
    }
  });

  return {
    updatePoints: updatePointsMutation.mutateAsync,
    processCheckIn: checkInMutation.mutateAsync,
    isUpdating: updatePointsMutation.isPending || checkInMutation.isPending
  };
}