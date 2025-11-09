import { useState } from "react";
import { Settings, Target, Zap, Flame, Brain, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/ProgressBar";
import StatCard from "@/components/StatCard";
import MoodTracker from "@/components/MoodTracker";
import NavigationTile from "@/components/NavigationTile";
import BottomNav from "@/components/BottomNav";

type NavItem = "home" | "mindfulness" | "calendar" | "vibes" | "ai";

const Index = () => {
  const [activeNav, setActiveNav] = useState<NavItem>("home");

  // Mock data
  const userData = {
    name: "Mind Master",
    focusedMinutes: 45,
    level: 5,
    currentXP: 680,
    maxXP: 1000,
    streak: 7,
    tasksCompleted: 12,
    xpEarned: 340,
  };

  const navigationTiles = [
    {
      icon: Brain,
      title: "Mindfulness",
      description: "Meditate, breathe, and find calm",
      gradient: "bg-gradient-to-br from-mint/30 to-sky/30",
    },
    {
      icon: Zap,
      title: "Productivity",
      description: "Boost your focus and energy",
      gradient: "bg-gradient-to-br from-peach/30 to-mood-excited/20",
    },
    {
      icon: Target,
      title: "Personal Calendar",
      description: "Track habits and goals",
      gradient: "bg-gradient-to-br from-lavender/30 to-secondary/30",
    },
    {
      icon: Bot,
      title: "AI Buddy",
      description: "Chat with your wellness assistant",
      gradient: "bg-gradient-to-br from-sky/30 to-primary/30",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
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
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="text-muted-foreground" />
            </Button>
          </div>

          {/* Progress Section */}
          <div className="space-y-4">
            <ProgressBar 
              current={userData.currentXP} 
              max={userData.maxXP} 
              label={`Level ${userData.level}`} 
            />
            
            <div className="flex items-center gap-2 text-sm">
              <Flame className="text-orange-500" size={20} />
              <span className="font-semibold text-foreground">{userData.streak} Day Streak</span>
              <span className="text-muted-foreground">Keep it up!</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            icon={Target} 
            label="Tasks Done" 
            value={userData.tasksCompleted}
            iconColor="text-mint"
          />
          <StatCard 
            icon={Zap} 
            label="XP Earned" 
            value={userData.xpEarned}
            iconColor="text-mood-excited"
          />
        </div>

        {/* Mood Tracker */}
        <MoodTracker />

        {/* Navigation Tiles */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground mb-4">Explore</h2>
          {navigationTiles.map((tile, index) => (
            <NavigationTile
              key={index}
              icon={tile.icon}
              title={tile.title}
              description={tile.description}
              gradient={tile.gradient}
              onClick={() => console.log(`Navigate to ${tile.title}`)}
            />
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav active={activeNav} onNavigate={setActiveNav} />
    </div>
  );
};

export default Index;
