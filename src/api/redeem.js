import { supabase } from './supabase';

export async function processRedemptionDb(telegramId, tierId, cost, days) {
  try {
    const tgIdStr = String(telegramId);

    // 1. Double check user's current points securely in the database
    const { data: user } = await supabase
      .from('users')
      .select('points')
      .eq('telegram_id', tgIdStr)
      .maybeSingle();

    if (!user || user.points < cost) {
      throw new Error("You don't have enough points for this reward!");
    }

    // 2. Find an available Canva link
    const { data: links, error: linkErr } = await supabase.from('canva_links').select('*');
    if (linkErr) throw linkErr;
    
    const availableLink = links?.find(l => l.used_slots < l.total_slots);
    if (!availableLink) {
      throw new Error("All Canva Pro slots are currently full. Please try again later!");
    }

    const newPoints = user.points - cost;
    const finalUrl = availableLink.url || availableLink.invitelink;

    // 3. Prepare the New Redemption Data
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    const newRedemption = {
      telegram_id: tgIdStr,
      tier_id: tierId,
      points_cost: cost,
      link_name: availableLink.name,
      invite_link: finalUrl,
      expires_at: expiresAt.toISOString()
    };

    // 4. Save the Redemption to the Database
    const { error: insertError } = await supabase.from('redemptions').insert([newRedemption]);
    if (insertError) {
      console.error("DB Insert Error:", insertError);
      throw new Error("Failed to save redemption to cloud. Please try again.");
    }

    // 5. Deduct Points & Update Canva Link Slots
    await supabase.from('users').update({ points: newPoints }).eq('telegram_id', tgIdStr);
    await supabase.from('canva_links').update({ used_slots: availableLink.used_slots + 1 }).eq('id', availableLink.id);

    // 6. Log to Task History (So it shows in the UI!)
    await supabase.from('task_history').insert([{ 
      telegram_id: tgIdStr, 
      task_name: `Redeemed ${days} Days Pro`, 
      points_earned: -cost, 
      icon: '💎' 
    }]);

    // 7. Update the Local Backup instantly
    localStorage.setItem(`canva_pts_${tgIdStr}`, newPoints);
    localStorage.setItem(`canva_premium_${tgIdStr}`, JSON.stringify(newRedemption));

    // Success! Return the new data back to Redeem.jsx
    return { 
      success: true, 
      newPoints: newPoints, 
      newRedemption: newRedemption, 
      finalUrl: finalUrl 
    };

  } catch (err) {
    console.error("Redemption Error:", err);
    return { 
      success: false, 
      message: err.message || "A network error occurred. Please try again." 
    };
  }
}