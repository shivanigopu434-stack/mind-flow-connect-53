import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { spinLogId } = await req.json();
    
    if (!spinLogId) {
      return new Response(JSON.stringify({ error: 'Missing spinLogId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the spin log
    const { data: spinLog, error: spinLogError } = await supabase
      .from('spin_logs')
      .select('*')
      .eq('id', spinLogId)
      .eq('user_id', user.id)
      .single();

    if (spinLogError || !spinLog) {
      return new Response(JSON.stringify({ error: 'Spin log not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (spinLog.completed) {
      return new Response(JSON.stringify({ error: 'Already completed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mark spin as completed
    const { error: updateSpinError } = await supabase
      .from('spin_logs')
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq('id', spinLogId);

    if (updateSpinError) throw updateSpinError;

    // Get or create user spin stats
    let { data: stats } = await supabase
      .from('user_spin_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const today = new Date().toISOString().split('T')[0];
    const wheelId = spinLog.wheel_id as 'mind' | 'body' | 'life';

    if (!stats) {
      // Create new stats
      const newStats = {
        user_id: user.id,
        mind_streak: wheelId === 'mind' ? 1 : 0,
        body_streak: wheelId === 'body' ? 1 : 0,
        life_streak: wheelId === 'life' ? 1 : 0,
        total_completed: 1,
        last_mind_date: wheelId === 'mind' ? today : null,
        last_body_date: wheelId === 'body' ? today : null,
        last_life_date: wheelId === 'life' ? today : null,
      };

      const { data: createdStats, error: createError } = await supabase
        .from('user_spin_stats')
        .insert(newStats)
        .select()
        .single();

      if (createError) throw createError;
      stats = createdStats;
    } else {
      // Update existing stats
      const lastDateKey = `last_${wheelId}_date` as keyof typeof stats;
      const streakKey = `${wheelId}_streak` as keyof typeof stats;
      const lastDate = stats[lastDateKey] as string | null;
      const currentStreak = stats[streakKey] as number;
      
      // Calculate new streak
      let newStreak = 1;
      if (lastDate) {
        const lastDateObj = new Date(lastDate);
        const todayObj = new Date(today);
        const diffDays = Math.floor((todayObj.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          // Consecutive day - increase streak
          newStreak = currentStreak + 1;
        } else if (diffDays === 0) {
          // Same day - keep streak
          newStreak = currentStreak;
        }
        // Otherwise reset to 1
      }

      const updateData: Record<string, unknown> = {
        [`${wheelId}_streak`]: newStreak,
        [`last_${wheelId}_date`]: today,
        total_completed: (stats.total_completed as number) + 1,
        updated_at: new Date().toISOString()
      };

      const { data: updatedStats, error: updateError } = await supabase
        .from('user_spin_stats')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      stats = updatedStats;
    }

    // Calculate rewards
    const xpGained = 10;
    const balanceScoreBoost = 2;

    // Get current profile and update XP
    const { data: profile } = await supabase
      .from('profiles')
      .select('xp')
      .eq('id', user.id)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({ xp: (profile.xp as number) + xpGained })
        .eq('id', user.id);
    }

    console.log(`User ${user.id} completed ${wheelId} wheel challenge. Streak: ${stats[`${wheelId}_streak`]}`);

    return new Response(JSON.stringify({
      streaks: {
        mind: stats.mind_streak,
        body: stats.body_streak,
        life: stats.life_streak
      },
      totalSpinChallengesCompleted: stats.total_completed,
      reward: {
        xpGained,
        balanceScoreBoost
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error completing spin:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
