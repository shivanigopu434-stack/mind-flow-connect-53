-- Drop the existing check constraint and create a new one that includes all types
ALTER TABLE public.productivity_items DROP CONSTRAINT IF EXISTS productivity_items_type_check;

ALTER TABLE public.productivity_items ADD CONSTRAINT productivity_items_type_check 
CHECK (type IN ('task', 'habit', 'reminder', 'goal', 'mind', 'body', 'life', 'self-care'));