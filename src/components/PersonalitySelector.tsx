import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Personality } from "@/screens/AIBuddyScreen";

interface PersonalitySelectorProps {
  open: boolean;
  currentPersonality: Personality;
  onSelect: (personality: Personality) => void;
  onClose: () => void;
}

const personalities = [
  {
    id: "friendly" as Personality,
    emoji: "🧡",
    title: "Friendly",
    description: "Hey champ, let's make today amazing!",
    gradient: "from-peach to-mint",
  },
  {
    id: "strict" as Personality,
    emoji: "💪",
    title: "Strict & Straightforward",
    description: "Focus. No excuses.",
    gradient: "from-sky to-lavender",
  },
  {
    id: "caring" as Personality,
    emoji: "🤗",
    title: "Caring",
    description: "You're doing great. Let's move one small step forward.",
    gradient: "from-mint to-calm",
  },
  {
    id: "sarcastic" as Personality,
    emoji: "😏",
    title: "Sarcastic",
    description: "Oh wow, productivity looks good on you today.",
    gradient: "from-lavender to-peach",
  },
];

const PersonalitySelector = ({
  open,
  currentPersonality,
  onSelect,
  onClose,
}: PersonalitySelectorProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-sm border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center flex items-center justify-center gap-2">
            <span className="text-3xl">🎭</span>
            Choose Personality
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-4">
          {personalities.map((p) => (
            <Button
              key={p.id}
              onClick={() => onSelect(p.id)}
              variant={currentPersonality === p.id ? "default" : "outline"}
              className={`w-full h-auto flex-col items-start p-4 gap-1 transition-all ${
                currentPersonality === p.id
                  ? `bg-gradient-to-r ${p.gradient} text-white border-0 ring-2 ring-primary/50`
                  : "hover:bg-accent"
              }`}
            >
              <div className="flex items-center gap-2 w-full">
                <span className="text-2xl">{p.emoji}</span>
                <span className="font-semibold text-lg">{p.title}</span>
              </div>
              <p className={`text-sm ${currentPersonality === p.id ? "text-white/90" : "text-muted-foreground"}`}>
                "{p.description}"
              </p>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PersonalitySelector;
