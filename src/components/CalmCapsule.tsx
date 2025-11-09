import { Play, Pause } from "lucide-react";
import { useState } from "react";

interface CalmCapsuleProps {
  title: string;
  duration: string;
  category: string;
  gradient: string;
}

const CalmCapsule = ({ title, duration, category, gradient }: CalmCapsuleProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    // TODO: Integrate actual audio playback
    console.log(isPlaying ? "Pausing" : "Playing", title);
  };

  return (
    <div className={`${gradient} rounded-2xl p-5 border border-border/30 hover:shadow-lg transition-all group`}>
      <div className="flex items-center gap-4">
        <button
          onClick={handlePlay}
          className="flex-shrink-0 w-14 h-14 rounded-full bg-white/90 dark:bg-black/20 flex items-center justify-center hover:scale-110 transition-transform shadow-md"
        >
          {isPlaying ? (
            <Pause className="text-primary" size={24} />
          ) : (
            <Play className="text-primary ml-1" size={24} />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground mb-1 truncate">{title}</h4>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="px-2 py-0.5 bg-white/50 dark:bg-black/20 rounded-full text-xs font-medium">
              {category}
            </span>
            <span>•</span>
            <span>{duration}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalmCapsule;
