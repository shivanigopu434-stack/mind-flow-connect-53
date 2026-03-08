
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can create their own items" ON public.productivity_items;
DROP POLICY IF EXISTS "Users can delete their own items" ON public.productivity_items;
DROP POLICY IF EXISTS "Users can update their own items" ON public.productivity_items;
DROP POLICY IF EXISTS "Users can view their own items" ON public.productivity_items;

-- Recreate as permissive policies
CREATE POLICY "Users can view their own items" ON public.productivity_items
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own items" ON public.productivity_items
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items" ON public.productivity_items
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items" ON public.productivity_items
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
