import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Trophy, Star, TrendingUp, Heart } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface MateVibesScreenProps {
  user: User | null;
}

interface Profile {
  id: string;
  name: string;
  level: number;
  xp: number;
  badge: string;
  avatar_url: string | null;
  unique_id: string;
}

const MateVibesScreen = ({ user }: MateVibesScreenProps) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const stats = [
    { icon: Flame, label: "Streak", value: "7 days", color: "text-mood-excited" },
    { icon: Trophy, label: "Level", value: profile?.level || 1, color: "text-activity-goal" },
    { icon: Star, label: "XP", value: profile?.xp || 0, color: "text-primary" },
    { icon: TrendingUp, label: "Sessions", value: "23", color: "text-mint" },
  ];

  const achievements = [
    { title: "Early Bird", description: "Complete 5 morning meditations", progress: 60, icon: "🌅" },
    { title: "Zen Master", description: "Meditate for 100 minutes total", progress: 45, icon: "🧘" },
    { title: "Streak Keeper", description: "Maintain a 7-day streak", progress: 100, icon: "🔥" },
    { title: "Mood Tracker", description: "Log your mood for 14 days", progress: 30, icon: "📊" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/20 via-lavender/20 to-mint/20 border-b border-border/50">
        <div className="max-w-md mx-auto px-6 py-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-lavender rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Mate Vibes</h1>
            <p className="text-muted-foreground">Your wellness journey</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Stats Grid */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Stats</h2>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-card rounded-2xl p-4 border border-border/50"
              >
                <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Weekly Progress */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">This Week</h2>
          <div className="bg-card rounded-2xl p-4 border border-border/50">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-muted-foreground">Mindfulness Goal</span>
              <span className="text-sm font-semibold text-primary">5/7 days</span>
            </div>
            <Progress value={71} className="h-3 mb-4" />
            
            <div className="flex justify-between">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      i < 5
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i < 5 ? "✓" : day}
                  </div>
                  <span className="text-xs text-muted-foreground">{day}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Achievements</h2>
          <div className="space-y-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.title}
                className="bg-card rounded-2xl p-4 border border-border/50"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground">
                        {achievement.title}
                      </h3>
                      <span className="text-xs text-primary font-medium">
                        {achievement.progress}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {achievement.description}
                    </p>
                    <Progress value={achievement.progress} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default MateVibesScreen;
