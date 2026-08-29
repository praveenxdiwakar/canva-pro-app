import { supabase } from './supabase';

export async function fetchLeaderboard() {
  const { data, error } = await supabase
    .from('users')
    .select('telegram_id, first_name, photo_url, points, streak')
    .order('points', { ascending: false })
    .limit(50);
  
  if (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
  return data;
}

export async function fetchProList() {
  const { data, error } = await supabase
    .from('redemptions')
    .select('*, users(first_name, photo_url)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching pro list:", error);
    return [];
  }
  return data;
}