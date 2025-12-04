import { useState } from "react";
import { Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import CalmCapsule from "@/components/CalmCapsule";
import MeditationTimer from "@/components/MeditationTimer";

const calmCapsules = [
  {
    title: "Morning Calm",
    duration: "5 min",
    category: "Breathing",
    gradient: "bg-gradient-to-br from-mint/40 to-sky/40",
  },
  {
    title: "Focus Flow",
    duration: "10 min",
    category: "Focus",
    gradient: "bg-gradient-to-br from-lavender/40 to-primary/40",
  },
  {
    title: "Stress Relief",
    duration: "7 min",
    category: "Relaxation",
    gradient: "bg-gradient-to-br from-peach/40 to-mood-calm/40",
  },
  {
    title: "Deep Sleep",
    duration: "15 min",
    category: "Sleep",
    gradient: "bg-gradient-to-br from-sky/40 to-secondary/40",
  },
  {
    title: "Quick Reset",
    duration: "3 min",
    category: "Break",
    gradient: "bg-gradient-to-br from-mood-happy/30 to-mint/40",
  },
  {
    title: "Evening Wind Down",
    duration: "12 min",
    category: "Relaxation",
    gradient: "bg-gradient-to-br from-lavender/30 to-peach/40",
  },
];

const MindfulnessScreen = () => {
  const [timerOpen, setTimerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border/50">
        <div className="max-w-md mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-foreground">Mindfulness</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Meditate Section */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Meditate</h2>
          <div className="bg-gradient-to-br from-primary/20 to-mint/20 rounded-2xl p-6 border border-primary/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Start Your Session
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Choose a duration and find your inner peace
              </p>
              <Button 
                onClick={() => setTimerOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Meditation
              </Button>
            </div>
          </div>
        </section>

        {/* Calm Capsules */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Calm Capsules</h2>
          <div className="grid grid-cols-2 gap-3">
            {calmCapsules.map((capsule) => (
              <CalmCapsule
                key={capsule.title}
                title={capsule.title}
                duration={capsule.duration}
                category={capsule.category}
                gradient={capsule.gradient}
              />
            ))}
          </div>
        </section>

        {/* AI Assist Section */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">AI Assist</h2>
          <div className="bg-gradient-to-br from-sky/20 to-lavender/20 rounded-2xl p-6 border border-sky/20">
            <p className="text-muted-foreground text-sm text-center">
              Need personalized guidance? Chat with your AI buddy for customized meditation recommendations.
            </p>
          </div>
        </section>
      </div>

      {/* Meditation Timer Dialog */}
      <MeditationTimer open={timerOpen} onClose={() => setTimerOpen(false)} />
    </div>
  );
};

export default MindfulnessScreen;
