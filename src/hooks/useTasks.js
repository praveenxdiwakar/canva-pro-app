import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTasks, completeTask } from '../api/tasks';

export const useTasks = (initData) => {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: () => fetchTasks(initData),
    enabled: !!initData,
    staleTime: 5000,
  });
};

export const useCompleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ initData, taskType }) => completeTask(initData, taskType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};