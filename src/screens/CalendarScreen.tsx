import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { DayDetailPanel } from "@/components/DayDetailPanel";
import { AddActivityDialog } from "@/components/AddActivityDialog";

export interface Activity {
  id: string;
  type: "meditation" | "task" | "mood" | "goal";
  title: string;
  date: Date;
  completed: boolean;
}

const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: "1",
      type: "meditation",
      title: "Morning meditation",
      date: new Date(),
      completed: false,
    },
    {
      id: "2",
      type: "task",
      title: "30 min yoga",
      date: new Date(),
      completed: true,
    },
    {
      id: "3",
      type: "goal",
      title: "Read for 20 minutes",
      date: new Date(),
      completed: false,
    },
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
    setActivities(activities.filter((a) => a.id !== id));
  };

  const handleToggleComplete = (id: string) => {
    setActivities(
      activities.map((a) =>
        a.id === id ? { ...a, completed: !a.completed } : a
      )
    );
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const getDaysWithActivities = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    return days.filter((day) => getActivitiesForDate(day).length > 0);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border/50">
        <div className="max-w-md mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="text-primary" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft />
          </Button>
          <h2 className="text-lg font-semibold text-foreground">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight />
          </Button>
        </div>

        {/* Calendar */}
        <div className="bg-card rounded-2xl p-4 border border-border/50">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            modifiers={{
              hasActivity: getDaysWithActivities(),
            }}
            modifiersStyles={{
              hasActivity: {
                fontWeight: "bold",
              },
            }}
            className="rounded-md"
          />
        </div>

        {/* Activity Legend */}
        <div className="flex flex-wrap gap-3 justify-center">
          <div className="flex items-center gap-1 text-xs">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-muted-foreground">Mindfulness</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-2 h-2 rounded-full bg-activity-exercise" />
            <span className="text-muted-foreground">Exercise</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-2 h-2 rounded-full bg-activity-habit" />
            <span className="text-muted-foreground">Habit</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-2 h-2 rounded-full bg-activity-goal" />
            <span className="text-muted-foreground">Goal</span>
          </div>
        </div>

        {/* Day Detail Panel */}
        <DayDetailPanel
          selectedDate={selectedDate}
          activities={getActivitiesForDate(selectedDate)}
          onToggleComplete={handleToggleComplete}
          onDeleteActivity={handleDeleteActivity}
        />
      </div>

      {/* Add Activity Dialog */}
      <AddActivityDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddActivity={handleAddActivity}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default CalendarScreen;
