import { supabase } from './supabase';

// Helper to securely extract the Telegram ID from the app environment
const getTelegramId = (initData) => {
  try {
    const params = new URLSearchParams(initData);
    const user = JSON.parse(params.get('user'));
    return user.id.toString();
  } catch (e) {
    // Fallback to your Master Admin ID if testing outside Telegram
    return "5589713552"; 
  }
};

// 1. Sync User (Creates them in the database if they don't exist yet)
export const syncUser = async (initData) => {
  const telegramId = getTelegramId(initData);
  let { data, error } = await supabase.from('users').select('*').eq('telegramId', telegramId).single();
  
  if (!data) {
    const { data: newUser } = await supabase.from('users')
      .insert([{ telegramId, points: 0, steps_completed: 0 }])
      .select().single();
    return newUser;
  }
  return data;
};

// 2. Add Points
export const addPoints = async (initData, pointsToAdd) => {
  const user = await syncUser(initData);
  const newPoints = user.points + pointsToAdd;
  
  await supabase.from('users')
    .update({ points: newPoints })
    .eq('telegramId', user.telegramId);
    
  return newPoints;
};

// 3. Get Canva Steps Progress
export const getStepsProgress = async (initData) => {
  const user = await syncUser(initData);
  const completed = user.steps_completed || 0;
  
  return [
    { id: 1, completed: completed >= 1 },
    { id: 2, completed: completed >= 2 },
    { id: 3, completed: completed >= 3 },
    { id: 4, completed: completed >= 4 }
  ];
};

// 4. Complete Next Canva Step
export const completeNextStep = async (initData) => {
  const user = await syncUser(initData);
  const nextStep = Math.min(4, (user.steps_completed || 0) + 1); // Max 4 steps
  
  await supabase.from('users')
    .update({ steps_completed: nextStep })
    .eq('telegramId', user.telegramId);
    
  return nextStep;
};