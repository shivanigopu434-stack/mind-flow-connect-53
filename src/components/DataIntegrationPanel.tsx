import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Clock, Zap, ChevronDown, ChevronUp } from "lucide-react";

interface DataIntegrationPanelProps {
  onToggle: () => void;
}

const DataIntegrationPanel = ({ onToggle }: DataIntegrationPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Mock data - would come from app state/backend
  const stats = {
    activeGoals: 3,
    upcomingReminders: 2,
    dailyStreak: 7,
    weeklyProgress: 70,
  };

  if (!isExpanded) {
    return (
      <div className="px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="w-full justify-between text-xs text-muted-foreground hover:text-foreground"
        >
          <span>Show Progress Summary</span>
          <ChevronUp className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 pb-3">
      <Card className="bg-card/80 backdrop-blur-sm border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Progress Summary</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(false)}
            className="h-6 w-6"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-accent/20 border border-border/50">
            <Target className="h-4 w-4 text-activity-goal" />
            <p className="text-xs font-semibold text-foreground">{stats.activeGoals}</p>
            <p className="text-[10px] text-muted-foreground">Goals</p>
          </div>

          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-accent/20 border border-border/50">
            <Clock className="h-4 w-4 text-sky" />
            <p className="text-xs font-semibold text-foreground">{stats.upcomingReminders}</p>
            <p className="text-[10px] text-muted-foreground">Reminders</p>
          </div>

          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-accent/20 border border-border/50">
            <Zap className="h-4 w-4 text-peach" />
            <p className="text-xs font-semibold text-foreground">{stats.dailyStreak} days</p>
            <p className="text-[10px] text-muted-foreground">Streak</p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Weekly Progress</span>
            <span className="font-semibold text-foreground">{stats.weeklyProgress}%</span>
          </div>
          <div className="h-2 bg-progress-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-progress-fill to-primary transition-all duration-500"
              style={{ width: `${stats.weeklyProgress}%` }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DataIntegrationPanel;
