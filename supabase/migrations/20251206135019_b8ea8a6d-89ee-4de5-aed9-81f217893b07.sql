
-- Create wheels table
CREATE TABLE public.wheels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color_theme TEXT NOT NULL DEFAULT 'blue',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default wheels
INSERT INTO public.wheels (id, name, description, color_theme, order_index) VALUES
  ('mind', 'Mind', 'Calm, mood, reflection', 'blue', 0),
  ('body', 'Body', 'Energy, movement, physical reset', 'green', 1),
  ('life', 'Life', 'Productivity, connection, small wins', 'yellow', 2);

-- Create habits table
CREATE TABLE public.habits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wheel_id TEXT NOT NULL REFERENCES public.wheels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  difficulty TEXT NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  estimated_minutes INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert Mind Wheel habits
INSERT INTO public.habits (wheel_id, title, description, estimated_minutes) VALUES
  ('mind', '1-minute breathing reset', 'Take a moment to breathe deeply and reset', 1),
  ('mind', 'Write 1 gratitude', 'Write down one thing you are grateful for', 2),
  ('mind', 'Mind dump journaling', 'Write freely for 1-2 minutes', 2),
  ('mind', 'Describe your mood in 3 words', 'Reflect on how you feel right now', 1),
  ('mind', 'Watch something that makes you laugh', 'Find a funny video or meme', 5),
  ('mind', 'Sit still for 30 seconds', 'Just be present in the moment', 1),
  ('mind', 'Forgive yourself for one small thing', 'Let go of something small', 2),
  ('mind', 'Write something positive about yourself', 'Self-affirmation moment', 2),
  ('mind', 'Stretch your neck & shoulders', 'Release tension from your body', 2),
  ('mind', 'Avoid screens for 10 minutes', 'Give your eyes and mind a break', 10);

-- Insert Body Wheel habits
INSERT INTO public.habits (wheel_id, title, description, estimated_minutes) VALUES
  ('body', 'Drink 2 glasses of water', 'Hydrate your body', 2),
  ('body', '10-minute walk', 'Get moving and get some steps in', 10),
  ('body', '30-second full-body stretch', 'Stretch out your entire body', 1),
  ('body', 'Fix posture for 1 minute', 'Sit or stand up straight', 1),
  ('body', 'Eat one fruit', 'Nourish your body with something healthy', 3),
  ('body', 'Sunlight break for 1 minute', 'Get some natural light', 1),
  ('body', '5 pushups or 5 squats', 'Quick strength exercise', 2),
  ('body', 'Deep breathing (5 slow breaths)', 'Oxygenate your body', 1),
  ('body', 'Step outside for fresh air', 'Get some fresh air', 3),
  ('body', '2-minute room clean-up', 'Tidy up your space', 2);

-- Insert Life Wheel habits
INSERT INTO public.habits (wheel_id, title, description, estimated_minutes) VALUES
  ('life', 'Delete 5 unwanted photos', 'Declutter your phone gallery', 3),
  ('life', 'Send a thank you message', 'Express gratitude to someone', 2),
  ('life', 'Compliment someone', 'Brighten someones day', 1),
  ('life', 'Plan your next 3 tasks', 'Get organized for what is next', 3),
  ('life', 'Organize one tiny corner', 'Clean up a small area', 5),
  ('life', 'Read one paragraph of anything', 'Feed your mind', 2),
  ('life', 'Complete one mini overdue task', 'Get something done', 5),
  ('life', 'Do one thing that makes you smile', 'Prioritize your happiness', 3),
  ('life', 'Reconnect with someone', 'Reach out to a friend or family', 5),
  ('life', 'Set a micro-goal for tomorrow', 'Plan one small win', 2);

-- Create spin_logs table
CREATE TABLE public.spin_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wheel_id TEXT NOT NULL REFERENCES public.wheels(id),
  habit_id UUID NOT NULL REFERENCES public.habits(id),
  task_id UUID REFERENCES public.productivity_items(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create user_spin_stats table for streaks
CREATE TABLE public.user_spin_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  mind_streak INTEGER NOT NULL DEFAULT 0,
  body_streak INTEGER NOT NULL DEFAULT 0,
  life_streak INTEGER NOT NULL DEFAULT 0,
  total_completed INTEGER NOT NULL DEFAULT 0,
  last_mind_date DATE,
  last_body_date DATE,
  last_life_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wheels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_spin_stats ENABLE ROW LEVEL SECURITY;

-- Wheels are publicly readable
CREATE POLICY "Wheels are viewable by everyone" ON public.wheels FOR SELECT USING (true);

-- Habits are publicly readable (active ones)
CREATE POLICY "Active habits are viewable by everyone" ON public.habits FOR SELECT USING (active = true);

-- Spin logs policies
CREATE POLICY "Users can view their own spin logs" ON public.spin_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own spin logs" ON public.spin_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own spin logs" ON public.spin_logs FOR UPDATE USING (auth.uid() = user_id);

-- User spin stats policies
CREATE POLICY "Users can view their own spin stats" ON public.user_spin_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own spin stats" ON public.user_spin_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own spin stats" ON public.user_spin_stats FOR UPDATE USING (auth.uid() = user_id);

-- Add source column to productivity_items if not exists
ALTER TABLE public.productivity_items ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';
