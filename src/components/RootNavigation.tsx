import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import BottomNav from "./BottomNav";
import HomeScreen from "@/screens/HomeScreen";
import MindfulnessScreen from "@/screens/MindfulnessScreen";
import CalendarScreen from "@/screens/CalendarScreen";
import MateVibesScreen from "@/screens/MateVibesScreen";
import AIBuddyScreen from "@/screens/AIBuddyScreen";

export type NavItem = "home" | "mindfulness" | "calendar" | "vibes" | "ai";

const RootNavigation = () => {
  const [currentIndex, setCurrentIndex] = useState<NavItem>("home");
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleNavigate = (item: NavItem) => {
    setCurrentIndex(item);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* IndexedStack equivalent - all screens rendered, only active one visible */}
      <div className="pb-24">
        <div className={currentIndex === "home" ? "block" : "hidden"}>
          <HomeScreen user={user} />
        </div>
        <div className={currentIndex === "mindfulness" ? "block" : "hidden"}>
          <MindfulnessScreen />
        </div>
        <div className={currentIndex === "calendar" ? "block" : "hidden"}>
          <CalendarScreen />
        </div>
        <div className={currentIndex === "vibes" ? "block" : "hidden"}>
          <MateVibesScreen user={user} />
        </div>
        <div className={currentIndex === "ai" ? "block" : "hidden"}>
          <AIBuddyScreen />
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <BottomNav active={currentIndex} onNavigate={handleNavigate} />
    </div>
  );
};

export default RootNavigation;
