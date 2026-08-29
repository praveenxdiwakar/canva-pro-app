import { supabase } from './supabase';

export async function fetchRedeemTiers() {
  return [
    { id: 1, name: '7-Day Canva Pro Starter', pointsCost: 20, durationDays: 7 },
    { id: 2, name: '15-Day Quick Access', pointsCost: 45, durationDays: 15 },
    { id: 3, name: '30-Day Most Popular Pro', pointsCost: 80, durationDays: 30 }
  ];
}

export async function redeemPoints(telegramId, tierId) {
  const { data: user } = await supabase.from('users').select('*').eq('telegram_id', telegramId).single();
  const tiers = await fetchRedeemTiers();
  const tier = tiers.find(t => t.id === tierId);

  if (!user || !tier) throw new Error("Invalid user or tier");
  if (user.points < tier.pointsCost) throw new Error("Insufficient points");

  // Fetch all links and filter in JS to avoid Supabase raw expression errors
  const { data: links } = await supabase
    .from('canva_links')
    .select('*');

  const availableLinks = (links || []).filter(l => l.used_slots < l.total_slots);

  if (!availableLinks || availableLinks.length === 0) {
    throw new Error("No available Canva Pro links at the moment. Please check back later!");
  }

  const activeLink = availableLinks[0];

  // Deduct points from user balance
  const newPoints = user.points - tier.pointsCost;
  await supabase.from('users').update({ points: newPoints }).eq('telegram_id', telegramId);
  
  // Increment link slots used
  await supabase.from('canva_links').update({ used_slots: activeLink.used_slots + 1 }).eq('id', activeLink.id);

  // Record redemption history
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + tier.durationDays);

  await supabase.from('redemptions').insert([{
    telegram_id: telegramId,
    link_name: activeLink.name,
    invite_link: activeLink.url,
    expires_at: expiresAt.toISOString()
  }]);

  return { newPoints, inviteLink: activeLink.url };
}