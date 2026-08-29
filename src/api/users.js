import { supabase } from './supabase';

// Fetch top 50 users sorted by points
export async function fetchLeaderboard() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('points', { ascending: false })
    .limit(50);
  
  if (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
  return data || [];
}

// Fetch all redemptions and join with user details
export async function fetchProList() {
  const { data: redemptions } = await supabase.from('redemptions').select('*').order('created_at', { ascending: false });
  const { data: users } = await supabase.from('users').select('*');

  if (!redemptions || !users) return [];

  // Safely map user details to each redemption
  return redemptions.map(r => {
    const u = users.find(user => user.telegram_id === r.telegram_id) || {};
    return { ...r, users: u };
  });
}

// Fetch specific user's reward history
export async function fetchUserHistory(telegramId) {
  if (!telegramId) return [];
  const { data } = await supabase
    .from('redemptions')
    .select('*')
    .eq('telegram_id', telegramId)
    .order('created_at', { ascending: false });
    
  return data || [];
}