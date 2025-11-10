import { Button } from "@/components/ui/button";
import { CheckSquare, Clock, Target, Sparkles } from "lucide-react";

interface QuickActionChipsProps {
  onActionClick: (action: string) => void;
}

const QuickActionChips = ({ onActionClick }: QuickActionChipsProps) => {
  const actions = [
    { icon: CheckSquare, label: "Add Task", value: "Add a task" },
    { icon: Clock, label: "Set Reminder", value: "Set a reminder" },
    { icon: Target, label: "Show Goals", value: "Show my goals" },
    { icon: Sparkles, label: "Motivate Me", value: "Motivate me" },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="outline"
          size="sm"
          onClick={() => onActionClick(action.value)}
          className="flex items-center gap-1.5 whitespace-nowrap bg-background/50 hover:bg-accent border-border hover:border-primary/50 transition-all"
        >
          <action.icon className="h-3.5 w-3.5" />
          <span className="text-xs">{action.label}</span>
        </Button>
      ))}
    </div>
  );
};

export default QuickActionChips;
