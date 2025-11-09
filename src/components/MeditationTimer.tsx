import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Play, Pause, X } from "lucide-react";

interface MeditationTimerProps {
  open: boolean;
  onClose: () => void;
}

const durations = [
  { label: "1 Min", value: 60 },
  { label: "5 Min", value: 300 },
  { label: "10 Min", value: 600 },
  { label: "20 Min", value: 1200 },
];

const sounds = [
  { label: "Om", value: "om", emoji: "🕉️" },
  { label: "Breath", value: "breath", emoji: "💨" },
  { label: "Rain", value: "rain", emoji: "🌧️" },
  { label: "Ocean", value: "ocean", emoji: "🌊" },
  { label: "Forest", value: "forest", emoji: "🌲" },
];

const MeditationTimer = ({ open, onClose }: MeditationTimerProps) => {
  const [selectedDuration, setSelectedDuration] = useState(300);
  const [selectedSound, setSelectedSound] = useState("om");
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(selectedDuration);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          // TODO: Add XP and log session
          console.log("Meditation completed!");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  const handleStart = () => {
    setTimeRemaining(selectedDuration);
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeRemaining(selectedDuration);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((selectedDuration - timeRemaining) / selectedDuration) * 100;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-mint/20 to-sky/20 border-border/50">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Meditation Setup</DialogTitle>
        </DialogHeader>

        {!isActive && timeRemaining === selectedDuration ? (
          <div className="space-y-6 py-4">
            {/* Duration Selection */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Choose Duration</h3>
              <div className="grid grid-cols-4 gap-2">
                {durations.map((duration) => (
                  <button
                    key={duration.value}
                    onClick={() => {
                      setSelectedDuration(duration.value);
                      setTimeRemaining(duration.value);
                    }}
                    className={`py-3 px-2 rounded-xl font-medium transition-all ${
                      selectedDuration === duration.value
                        ? "bg-primary text-primary-foreground scale-105 shadow-md"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {duration.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sound Selection */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Background Sound</h3>
              <div className="grid grid-cols-5 gap-2">
                {sounds.map((sound) => (
                  <button
                    key={sound.value}
                    onClick={() => setSelectedSound(sound.value)}
                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all ${
                      selectedSound === sound.value
                        ? "bg-primary text-primary-foreground scale-105 shadow-md"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    <span className="text-2xl">{sound.emoji}</span>
                    <span className="text-xs font-medium">{sound.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleStart} className="w-full" size="lg">
              <Play className="mr-2" size={20} />
              Start Meditation
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-8">
            {/* Timer Display */}
            <div className="relative flex items-center justify-center">
              <svg className="transform -rotate-90 w-48 h-48">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                  className="text-primary transition-all duration-1000"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <p className="text-5xl font-bold text-foreground">{formatTime(timeRemaining)}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {sounds.find((s) => s.value === selectedSound)?.label}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              {isActive ? (
                <Button onClick={handlePause} variant="secondary" className="flex-1" size="lg">
                  <Pause className="mr-2" size={20} />
                  Pause
                </Button>
              ) : (
                <Button onClick={handleStart} className="flex-1" size="lg">
                  <Play className="mr-2" size={20} />
                  Resume
                </Button>
              )}
              <Button onClick={handleReset} variant="outline" size="lg">
                <X className="mr-2" size={20} />
                Reset
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MeditationTimer;
