import { useState } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Home, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { AddActivityDialog } from "@/components/AddActivityDialog";
import { DayDetailPanel } from "@/components/DayDetailPanel";

export type Activity = {
  id: string;
  type: "meditation" | "task" | "mood" | "goal";
  title: string;
  date: Date;
  completed?: boolean;
};

const Calendar = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [activities, setActivities] = useState<Activity[]>([
    { id: "1", type: "meditation", title: "Morning meditation", date: new Date(), completed: true },
    { id: "2", type: "task", title: "Complete project", date: new Date(), completed: false },
    { id: "3", type: "mood", title: "Happy mood", date: new Date() },
    { id: "4", type: "goal", title: "Read 30 minutes", date: new Date(), completed: false },
  ]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const getActivitiesForDate = (date: Date) => {
    return activities.filter((activity) => isSameDay(activity.date, date));
  };

  const handleAddActivity = (activity: Omit<Activity, "id">) => {
    const newActivity = {
      ...activity,
      id: Date.now().toString(),
    };
    setActivities([...activities, newActivity]);
  };

  const handleDeleteActivity = (id: string) => {
    setActivities(activities.filter((activity) => activity.id !== id));
  };

  const handleToggleComplete = (id: string) => {
    setActivities(
      activities.map((activity) =>
        activity.id === id ? { ...activity, completed: !activity.completed } : activity
      )
    );
  };

  const handlePreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-pastel-purple/10 to-pastel-blue/10 pb-20">
      <div className="max-w-7xl mx-auto px-4 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="hover:bg-pastel-purple/20"
          >
            <Home className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Personal Calendar</h1>
          <Button
            variant="default"
            size="icon"
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-gradient-to-r from-pastel-purple to-pastel-blue hover:opacity-90"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <Card className="lg:col-span-2 p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePreviousMonth}
                className="hover:bg-pastel-purple/20"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-xl font-semibold text-foreground">
                {format(currentMonth, "MMMM yyyy")}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
                className="hover:bg-pastel-purple/20"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <div className="relative">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                className="rounded-md border-none"
              />
              {/* Render activity dots as overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 42 }).map((_, index) => {
                  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                  const dayOffset = index - firstDay.getDay();
                  const currentDate = new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth(),
                    dayOffset + 1
                  );
                  const dayActivities = getActivitiesForDate(currentDate);

                  if (dayActivities.length === 0) return null;

                  const row = Math.floor(index / 7);
                  const col = index % 7;

                  return (
                    <div
                      key={index}
                      className="absolute flex gap-1 justify-center"
                      style={{
                        top: `calc(${row * 14.28}% + 2.5rem)`,
                        left: `${col * 14.28}%`,
                        width: "14.28%",
                      }}
                    >
                      {dayActivities.slice(0, 3).map((activity) => (
                        <div
                          key={activity.id}
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            activity.type === "meditation" && "bg-activity-meditation",
                            activity.type === "task" && "bg-activity-task",
                            activity.type === "mood" && "bg-activity-mood",
                            activity.type === "goal" && "bg-activity-goal"
                          )}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-activity-meditation" />
                <span className="text-sm text-muted-foreground">Meditation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-activity-task" />
                <span className="text-sm text-muted-foreground">Tasks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-activity-mood" />
                <span className="text-sm text-muted-foreground">Moods</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-activity-goal" />
                <span className="text-sm text-muted-foreground">Goals</span>
              </div>
            </div>
          </Card>

          {/* Day Detail Panel */}
          <DayDetailPanel
            selectedDate={selectedDate}
            activities={getActivitiesForDate(selectedDate || new Date())}
            onDeleteActivity={handleDeleteActivity}
            onToggleComplete={handleToggleComplete}
          />
        </div>
      </div>

      <AddActivityDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddActivity={handleAddActivity}
        selectedDate={selectedDate || new Date()}
      />
    </div>
  );
};

export default Calendar;
