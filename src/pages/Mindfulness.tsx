import { useState } from "react";
import { ArrowLeft, Flower2, Wind, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import MeditationTimer from "@/components/MeditationTimer";
import CalmCapsule from "@/components/CalmCapsule";
import { useNavigate } from "react-router-dom";

const Mindfulness = () => {
  const [timerOpen, setTimerOpen] = useState(false);
  const navigate = useNavigate();

  const calmCapsules = [
    {
      title: "1-Min Reset",
      duration: "1 min",
      category: "Quick Relief",
      gradient: "bg-gradient-to-br from-mint/30 to-sky/20",
    },
    {
      title: "Anxiety Release",
      duration: "2 min",
      category: "Emotional",
      gradient: "bg-gradient-to-br from-lavender/30 to-secondary/20",
    },
    {
      title: "Breathe Slow",
      duration: "3 min",
      category: "Breathing",
      gradient: "bg-gradient-to-br from-sky/30 to-primary/20",
    },
    {
      title: "Morning Energy",
      duration: "2 min",
      category: "Motivation",
      gradient: "bg-gradient-to-br from-peach/30 to-mood-excited/20",
    },
    {
      title: "Deep Focus",
      duration: "3 min",
      category: "Productivity",
      gradient: "bg-gradient-to-br from-primary/30 to-mint/20",
    },
    {
      title: "Evening Wind Down",
      duration: "3 min",
      category: "Sleep",
      gradient: "bg-gradient-to-br from-lavender/30 to-mood-neutral/20",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint/10 via-background to-sky/10">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-full"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Mindfulness</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6 space-y-6 pb-24">
        {/* Meditate Section */}
        <div className="bg-gradient-to-br from-primary/20 to-mint/20 rounded-3xl p-6 border border-border/30 shadow-lg">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-white/90 dark:bg-black/20 rounded-2xl">
              <Flower2 className="text-primary" size={32} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground mb-2">Meditate</h2>
              <p className="text-sm text-muted-foreground">
                Find your calm with guided meditation and peaceful sounds
              </p>
            </div>
          </div>
          <Button
            onClick={() => setTimerOpen(true)}
            className="w-full"
            size="lg"
          >
            Start Meditation
          </Button>
        </div>

        {/* Calm Capsules Section */}
        <div className="bg-card/50 rounded-3xl p-6 border border-border/30">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-muted rounded-xl">
              <Wind className="text-sky" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Calm Capsules</h2>
              <p className="text-xs text-muted-foreground">Short guided audios for instant relief</p>
            </div>
          </div>
          <div className="space-y-3">
            {calmCapsules.map((capsule, index) => (
              <CalmCapsule key={index} {...capsule} />
            ))}
          </div>
        </div>

        {/* AI Assist Section */}
        <div className="bg-gradient-to-br from-lavender/20 to-secondary/20 rounded-3xl p-6 border border-border/30">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-white/90 dark:bg-black/20 rounded-2xl">
              <Sparkles className="text-secondary" size={28} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground mb-2">Talk to AI Assist</h2>
              <p className="text-sm text-muted-foreground">
                Get gentle support, affirmations, and breathing tips
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            className="w-full"
            size="lg"
            onClick={() => navigate("/ai-assistant")}
          >
            Chat with AI
          </Button>
        </div>
      </div>

      <MeditationTimer open={timerOpen} onClose={() => setTimerOpen(false)} />
    </div>
  );
};

export default Mindfulness;
