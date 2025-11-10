import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, CheckSquare, Target, Bell, Heart, Pill, ArrowLeft, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

type ItemType = "task" | "goal" | "reminder" | "self-care" | "medicine";

interface ProductivityItem {
  id: string;
  type: ItemType;
  title: string;
  description: string | null;
  scheduled_at: string;
  completed: boolean;
  missed: boolean;
}

const typeConfig = {
  task: { icon: CheckSquare, label: "Task", color: "bg-blue-500" },
  goal: { icon: Target, label: "Goal", color: "bg-purple-500" },
  reminder: { icon: Bell, label: "Reminder", color: "bg-yellow-500" },
  "self-care": { icon: Heart, label: "Self-Care", color: "bg-pink-500" },
  medicine: { icon: Pill, label: "Medicine", color: "bg-green-500" },
};

const Productivity = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ProductivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ItemType>("task");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("09:00");

  useEffect(() => {
    checkAuth();
    fetchItems();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("productivity_items")
        .select("*")
        .order("scheduled_at", { ascending: true });

      if (error) throw error;
      setItems((data || []) as ProductivityItem[]);
    } catch (error) {
      console.error("Error fetching items:", error);
      toast({
        title: "Error",
        description: "Failed to load items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!title.trim() || !selectedDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const scheduledDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(":");
    scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("productivity_items").insert({
        user_id: user.id,
        type: selectedType,
        title,
        description: description || null,
        scheduled_at: scheduledDateTime.toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Item added successfully",
      });

      setIsDialogOpen(false);
      resetForm();
      fetchItems();
    } catch (error) {
      console.error("Error adding item:", error);
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedDate(undefined);
    setSelectedTime("09:00");
    setSelectedType("task");
  };

  const toggleComplete = async (id: string, currentCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from("productivity_items")
        .update({ completed: !currentCompleted, missed: false })
        .eq("id", id);

      if (error) throw error;
      fetchItems();
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  };

  const markMissed = async (id: string) => {
    try {
      const { error } = await supabase
        .from("productivity_items")
        .update({ missed: true, completed: false })
        .eq("id", id);

      if (error) throw error;
      fetchItems();
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from("productivity_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchItems();
      toast({
        title: "Success",
        description: "Item deleted",
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <div className="container max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="hover:bg-accent"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">My Day</h1>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Item</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div>
                  <Label>Type</Label>
                  <RadioGroup value={selectedType} onValueChange={(value) => setSelectedType(value as ItemType)} className="grid grid-cols-3 gap-2 mt-2">
                    {Object.entries(typeConfig).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <Label
                          key={key}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-accent/50",
                            selectedType === key ? "border-primary bg-accent" : "border-border"
                          )}
                        >
                          <RadioGroupItem value={key} className="sr-only" />
                          <Icon className="h-5 w-5" />
                          <span className="text-xs">{config.label}</span>
                        </Label>
                      );
                    })}
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What do you need to do?"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add details..."
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-1",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <Button onClick={handleAddItem} className="w-full">
                  Add Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No items yet. Add your first task, goal, or reminder!</p>
              </div>
            ) : (
              items.map((item) => {
                const config = typeConfig[item.type];
                const Icon = config.icon;
                const scheduledDate = new Date(item.scheduled_at);

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "bg-card border border-border rounded-lg p-4 transition-all hover:shadow-lg",
                      item.completed && "opacity-60",
                      item.missed && "border-destructive"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn("p-2 rounded-lg", config.color, "text-white")}>
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="flex-1">
                        <h3 className={cn(
                          "font-semibold text-foreground",
                          item.completed && "line-through"
                        )}>
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{format(scheduledDate, "PPP")}</span>
                          <span>{format(scheduledDate, "p")}</span>
                          {item.completed && (
                            <span className="text-green-500 font-medium">✓ Completed</span>
                          )}
                          {item.missed && (
                            <span className="text-destructive font-medium">✗ Missed</span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {!item.completed && !item.missed && (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => toggleComplete(item.id, item.completed)}
                              className="hover:bg-green-500/10 hover:text-green-500"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => markMissed(item.id)}
                              className="hover:bg-destructive/10 hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteItem(item.id)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Productivity;