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
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all wheels with their active habits
    const { data: wheels, error: wheelsError } = await supabase
      .from('wheels')
      .select('*')
      .order('order_index');

    if (wheelsError) throw wheelsError;

    const { data: habits, error: habitsError } = await supabase
      .from('habits')
      .select('*')
      .eq('active', true);

    if (habitsError) throw habitsError;

    // Group habits by wheel
    const wheelsWithHabits = wheels.map(wheel => ({
      ...wheel,
      habits: habits.filter(h => h.wheel_id === wheel.id)
    }));

    return new Response(JSON.stringify({ wheels: wheelsWithHabits }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error fetching spin wheels:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
