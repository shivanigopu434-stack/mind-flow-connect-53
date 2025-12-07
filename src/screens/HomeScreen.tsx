import { Settings, Target, Zap, Flame, Brain, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import MoodTracker from "@/components/MoodTracker";
import NavigationTile from "@/components/NavigationTile";
import UnwindOrb from "@/components/UnwindOrb";

interface HomeScreenProps {
  user: User | null;
}

const HomeScreen = ({ user }: HomeScreenProps) => {
  const navigate = useNavigate();

  const userData = {
    name: user?.email?.split("@")[0] || "Mind Master",
    focusedMinutes: 45,
    level: 5,
    currentXP: 680,
    maxXP: 1000,
    streak: 7,
    tasksCompleted: 12,
    xpEarned: 340
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border/50">
        <div className="max-w-md mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">
                Hey, {userData.name}! 👋
              </h1>
              <p className="text-muted-foreground">
                You've focused <span className="font-semibold text-primary">{userData.focusedMinutes} minutes</span> today
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full" 
                onClick={() => navigate("/profile")}
              >
                <UserIcon className="text-muted-foreground" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full" 
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate("/auth");
                }}
              >
                <Settings className="text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Mood Tracker */}
        <MoodTracker />

        {/* Navigation Tiles */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground mb-4">Explore</h2>
          <NavigationTile 
            icon={Brain} 
            title="Mindfulness" 
            description="Meditate, breathe, and find calm" 
            gradient="bg-gradient-to-br from-mint/30 to-sky/30" 
          />
          <NavigationTile 
            icon={Zap} 
            title="Productivity" 
            description="Boost your focus and energy" 
            gradient="bg-gradient-to-br from-peach/30 to-mood-excited/20" 
            onClick={() => navigate("/productivity")}
          />
          <NavigationTile 
            icon={Target} 
            title="Personal Calendar" 
            description="Track habits and goals" 
            gradient="bg-gradient-to-br from-lavender/30 to-secondary/30" 
          />
          <NavigationTile 
            customIcon={<UnwindOrb size="md" animated={false} />} 
            title="AI Buddy" 
            description="Chat with your wellness assistant" 
            gradient="bg-gradient-to-br from-sky/30 to-primary/30" 
          />
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
