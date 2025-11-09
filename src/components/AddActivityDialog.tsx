import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Activity } from "@/pages/Calendar";

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddActivity: (activity: Omit<Activity, "id">) => void;
  selectedDate: Date;
}

export const AddActivityDialog = ({
  open,
  onOpenChange,
  onAddActivity,
  selectedDate,
}: AddActivityDialogProps) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<Activity["type"]>("task");
  const [date, setDate] = useState<Date>(selectedDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddActivity({
      type,
      title: title.trim(),
      date,
      completed: false,
    });

    setTitle("");
    setType("task");
    setDate(selectedDate);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Activity</DialogTitle>
          <DialogDescription>
            Add a new task, reminder, goal, or log your mood and meditation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter activity title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <RadioGroup value={type} onValueChange={(value) => setType(value as Activity["type"])}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="task" id="task" />
                <Label htmlFor="task" className="font-normal cursor-pointer">
                  Task
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="goal" id="goal" />
                <Label htmlFor="goal" className="font-normal cursor-pointer">
                  Goal
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="meditation" id="meditation" />
                <Label htmlFor="meditation" className="font-normal cursor-pointer">
                  Meditation
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mood" id="mood" />
                <Label htmlFor="mood" className="font-normal cursor-pointer">
                  Mood
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Activity
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
