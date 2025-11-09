import { useState } from "react";
import { Button } from "./ui/button";

type Mood = "happy" | "sad" | "angry" | "neutral" | "excited";

const moods: { emoji: string; label: string; value: Mood; color: string }[] = [
  { emoji: "🙂", label: "Happy", value: "happy", color: "bg-mood-happy" },
  { emoji: "😢", label: "Sad", value: "sad", color: "bg-mood-sad" },
  { emoji: "😡", label: "Angry", value: "angry", color: "bg-mood-angry" },
  { emoji: "😐", label: "Neutral", value: "neutral", color: "bg-mood-neutral" },
  { emoji: "🤩", label: "Excited", value: "excited", color: "bg-mood-excited" },
];

const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    // TODO: Log mood to backend
    console.log("Mood logged:", mood);
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">How are you feeling?</h3>
        <Button variant="ghost" size="sm" className="text-primary">
          View History
        </Button>
      </div>
      <div className="grid grid-cols-5 gap-3">
        {moods.map((mood) => (
          <button
            key={mood.value}
            onClick={() => handleMoodSelect(mood.value)}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:scale-105 ${
              selectedMood === mood.value
                ? `${mood.color} shadow-lg scale-105`
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            <span className="text-3xl">{mood.emoji}</span>
            <span className="text-xs font-medium text-foreground">{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MoodTracker;
