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

    // Get user from auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { wheel, habitId } = await req.json();
    
    if (!wheel || !habitId) {
      return new Response(JSON.stringify({ error: 'Missing wheel or habitId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user already spun this wheel today
    const today = new Date().toISOString().split('T')[0];
    const { data: existingSpins, error: spinCheckError } = await supabase
      .from('spin_logs')
      .select('id')
      .eq('user_id', user.id)
      .eq('wheel_id', wheel)
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`);

    if (spinCheckError) throw spinCheckError;

    if (existingSpins && existingSpins.length > 0) {
      return new Response(JSON.stringify({ error: 'You already spun this wheel today' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the habit details
    const { data: habit, error: habitError } = await supabase
      .from('habits')
      .select('*')
      .eq('id', habitId)
      .single();

    if (habitError || !habit) {
      return new Response(JSON.stringify({ error: 'Habit not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create task for today
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    
    const { data: task, error: taskError } = await supabase
      .from('productivity_items')
      .insert({
        user_id: user.id,
        title: habit.title,
        description: habit.description || `🎡 ${wheel.charAt(0).toUpperCase() + wheel.slice(1)} Wheel Challenge`,
        type: wheel,
        source: 'spin_wheel',
        scheduled_at: endOfDay.toISOString(),
        completed: false,
        missed: false
      })
      .select()
      .single();

    if (taskError) throw taskError;

    // Create spin log
    const { data: spinLog, error: spinLogError } = await supabase
      .from('spin_logs')
      .insert({
        user_id: user.id,
        wheel_id: wheel,
        habit_id: habitId,
        task_id: task.id,
        completed: false
      })
      .select()
      .single();

    if (spinLogError) throw spinLogError;

    console.log(`User ${user.id} accepted ${wheel} wheel challenge: ${habit.title}`);

    return new Response(JSON.stringify({ task, spinLog }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error accepting spin:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
