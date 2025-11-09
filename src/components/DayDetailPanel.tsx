import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Trash2, Flower2, CheckSquare, Smile, Target } from "lucide-react";
import { format } from "date-fns";
import { Activity } from "@/pages/Calendar";
import { cn } from "@/lib/utils";

interface DayDetailPanelProps {
  selectedDate: Date | undefined;
  activities: Activity[];
  onDeleteActivity: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

const activityIcons = {
  meditation: Flower2,
  task: CheckSquare,
  mood: Smile,
  goal: Target,
};

const activityColors = {
  meditation: "text-activity-meditation",
  task: "text-activity-task",
  mood: "text-activity-mood",
  goal: "text-activity-goal",
};

export const DayDetailPanel = ({
  selectedDate,
  activities,
  onDeleteActivity,
  onToggleComplete,
}: DayDetailPanelProps) => {
  if (!selectedDate) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Day Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Select a date to view details</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 max-h-[600px] overflow-y-auto">
      <CardHeader>
        <CardTitle className="text-lg">{format(selectedDate, "EEEE, MMM d")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activities for this day</p>
        ) : (
          activities.map((activity) => {
            const Icon = activityIcons[activity.type];
            const hasCompletion = activity.type === "task" || activity.type === "goal";

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors"
              >
                <Icon className={cn("h-5 w-5 mt-0.5", activityColors[activity.type])} />
                
                <div className="flex-1 min-w-0">
                  {hasCompletion && (
                    <div className="flex items-center gap-2 mb-1">
                      <Checkbox
                        checked={activity.completed}
                        onCheckedChange={() => onToggleComplete(activity.id)}
                      />
                    </div>
                  )}
                  <p
                    className={cn(
                      "text-sm font-medium text-foreground",
                      activity.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{activity.type}</p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteActivity(activity.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
