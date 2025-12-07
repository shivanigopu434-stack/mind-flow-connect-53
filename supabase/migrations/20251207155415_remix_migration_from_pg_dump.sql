CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: generate_unique_wellness_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_unique_wellness_id() RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  new_id TEXT;
  id_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate WELL + 6 random digits
    new_id := 'WELL' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    
    -- Check if it exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE unique_id = new_id) INTO id_exists;
    
    -- If it doesn't exist, return it
    IF NOT id_exists THEN
      RETURN new_id;
    END IF;
  END LOOP;
END;
$$;


--
-- Name: handle_new_user_profile(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user_profile() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, name, unique_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Wellness User'),
    generate_unique_wellness_id()
  );
  RETURN NEW;
END;
$$;


--
-- Name: update_productivity_items_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_productivity_items_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_profiles_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_profiles_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: habits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.habits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    wheel_id text NOT NULL,
    title text NOT NULL,
    description text,
    active boolean DEFAULT true NOT NULL,
    difficulty text DEFAULT 'easy'::text NOT NULL,
    estimated_minutes integer DEFAULT 5 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT habits_difficulty_check CHECK ((difficulty = ANY (ARRAY['easy'::text, 'medium'::text, 'hard'::text])))
);


--
-- Name: productivity_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.productivity_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    description text,
    scheduled_at timestamp with time zone NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    missed boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    source text DEFAULT 'manual'::text,
    CONSTRAINT productivity_items_type_check CHECK ((type = ANY (ARRAY['task'::text, 'habit'::text, 'reminder'::text, 'goal'::text, 'mind'::text, 'body'::text, 'life'::text, 'self-care'::text])))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    name text DEFAULT 'Wellness User'::text NOT NULL,
    avatar_url text,
    level integer DEFAULT 1 NOT NULL,
    badge text DEFAULT 'Newbie'::text NOT NULL,
    xp integer DEFAULT 0 NOT NULL,
    unique_id text NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: spin_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.spin_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    wheel_id text NOT NULL,
    habit_id uuid NOT NULL,
    task_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    completed_at timestamp with time zone
);


--
-- Name: user_spin_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_spin_stats (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    mind_streak integer DEFAULT 0 NOT NULL,
    body_streak integer DEFAULT 0 NOT NULL,
    life_streak integer DEFAULT 0 NOT NULL,
    total_completed integer DEFAULT 0 NOT NULL,
    last_mind_date date,
    last_body_date date,
    last_life_date date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: wheels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wheels (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    color_theme text DEFAULT 'blue'::text NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: habits habits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.habits
    ADD CONSTRAINT habits_pkey PRIMARY KEY (id);


--
-- Name: productivity_items productivity_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productivity_items
    ADD CONSTRAINT productivity_items_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_unique_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_unique_id_key UNIQUE (unique_id);


--
-- Name: spin_logs spin_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spin_logs
    ADD CONSTRAINT spin_logs_pkey PRIMARY KEY (id);


--
-- Name: user_spin_stats user_spin_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_spin_stats
    ADD CONSTRAINT user_spin_stats_pkey PRIMARY KEY (id);


--
-- Name: user_spin_stats user_spin_stats_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_spin_stats
    ADD CONSTRAINT user_spin_stats_user_id_key UNIQUE (user_id);


--
-- Name: wheels wheels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wheels
    ADD CONSTRAINT wheels_pkey PRIMARY KEY (id);


--
-- Name: idx_productivity_items_scheduled_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_productivity_items_scheduled_at ON public.productivity_items USING btree (scheduled_at);


--
-- Name: idx_productivity_items_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_productivity_items_type ON public.productivity_items USING btree (type);


--
-- Name: idx_productivity_items_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_productivity_items_user_id ON public.productivity_items USING btree (user_id);


--
-- Name: productivity_items update_productivity_items_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_productivity_items_updated_at BEFORE UPDATE ON public.productivity_items FOR EACH ROW EXECUTE FUNCTION public.update_productivity_items_updated_at();


--
-- Name: profiles update_profiles_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at_trigger BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_profiles_updated_at();


--
-- Name: habits habits_wheel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.habits
    ADD CONSTRAINT habits_wheel_id_fkey FOREIGN KEY (wheel_id) REFERENCES public.wheels(id) ON DELETE CASCADE;


--
-- Name: productivity_items productivity_items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productivity_items
    ADD CONSTRAINT productivity_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: spin_logs spin_logs_habit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spin_logs
    ADD CONSTRAINT spin_logs_habit_id_fkey FOREIGN KEY (habit_id) REFERENCES public.habits(id);


--
-- Name: spin_logs spin_logs_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spin_logs
    ADD CONSTRAINT spin_logs_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.productivity_items(id);


--
-- Name: spin_logs spin_logs_wheel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spin_logs
    ADD CONSTRAINT spin_logs_wheel_id_fkey FOREIGN KEY (wheel_id) REFERENCES public.wheels(id);


--
-- Name: habits Active habits are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Active habits are viewable by everyone" ON public.habits FOR SELECT USING ((active = true));


--
-- Name: productivity_items Users can create their own items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own items" ON public.productivity_items FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: spin_logs Users can create their own spin logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own spin logs" ON public.spin_logs FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_spin_stats Users can create their own spin stats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own spin stats" ON public.user_spin_stats FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: productivity_items Users can delete their own items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own items" ON public.productivity_items FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: productivity_items Users can update their own items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own items" ON public.productivity_items FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: spin_logs Users can update their own spin logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own spin logs" ON public.spin_logs FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_spin_stats Users can update their own spin stats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own spin stats" ON public.user_spin_stats FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: productivity_items Users can view their own items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own items" ON public.productivity_items FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: spin_logs Users can view their own spin logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own spin logs" ON public.spin_logs FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_spin_stats Users can view their own spin stats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own spin stats" ON public.user_spin_stats FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: wheels Wheels are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Wheels are viewable by everyone" ON public.wheels FOR SELECT USING (true);


--
-- Name: habits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

--
-- Name: productivity_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.productivity_items ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: spin_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.spin_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: user_spin_stats; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_spin_stats ENABLE ROW LEVEL SECURITY;

--
-- Name: wheels; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.wheels ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


