import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Brain, Heart, Sparkles, Flame, Trophy, Target } from "lucide-react";

interface Habit {
  id: string;
  wheel_id: string;
  title: string;
  description: string | null;
  estimated_minutes: number;
}

interface Wheel {
  id: string;
  name: string;
  description: string;
  color_theme: string;
  habits: Habit[];
}

interface SpinStats {
  mind_streak: number;
  body_streak: number;
  life_streak: number;
  total_completed: number;
}

const SpinScreen = () => {
  const [wheels, setWheels] = useState<Wheel[]>([]);
  const [activeWheel, setActiveWheel] = useState<string>("mind");
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [todaysSpins, setTodaysSpins] = useState<string[]>([]);
  const [stats, setStats] = useState<SpinStats | null>(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const wheelColors = {
    mind: { primary: "hsl(217, 91%, 60%)", secondary: "hsl(217, 91%, 75%)", bg: "from-blue-500/20 to-indigo-500/20" },
    body: { primary: "hsl(142, 76%, 36%)", secondary: "hsl(142, 76%, 55%)", bg: "from-green-500/20 to-emerald-500/20" },
    life: { primary: "hsl(45, 93%, 47%)", secondary: "hsl(45, 93%, 65%)", bg: "from-yellow-500/20 to-amber-500/20" }
  };

  const wheelIcons = {
    mind: Brain,
    body: Heart,
    life: Sparkles
  };

  useEffect(() => {
    fetchWheels();
    fetchTodaysSpins();
    fetchStats();
  }, []);

  useEffect(() => {
    drawWheel();
  }, [wheels, activeWheel, rotation]);

  const fetchWheels = async () => {
    try {
      const response = await supabase.functions.invoke('spin-wheels');
      if (response.data?.wheels) {
        setWheels(response.data.wheels);
      }
    } catch (error) {
      console.error('Error fetching wheels:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodaysSpins = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('spin_logs')
      .select('wheel_id')
      .eq('user_id', session.user.id)
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`);

    if (data) {
      setTodaysSpins(data.map(s => s.wheel_id));
    }
  };

  const fetchStats = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from('user_spin_stats')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (data) {
      setStats(data as SpinStats);
    }
  };

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentWheel = wheels.find(w => w.id === activeWheel);
    if (!currentWheel || !currentWheel.habits.length) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    const habits = currentWheel.habits;
    const sliceAngle = (2 * Math.PI) / habits.length;
    const colors = wheelColors[activeWheel as keyof typeof wheelColors];

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);

    habits.forEach((habit, i) => {
      const startAngle = i * sliceAngle - Math.PI / 2;
      const endAngle = startAngle + sliceAngle;

      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = i % 2 === 0 ? colors.primary : colors.secondary;
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = 'white';
      ctx.font = 'bold 11px system-ui';
      
      const text = habit.title.length > 18 ? habit.title.substring(0, 18) + '...' : habit.title;
      ctx.fillText(text, radius - 15, 4);
      ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 35, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();

    // Draw pointer (fixed, not rotating)
    ctx.beginPath();
    ctx.moveTo(centerX + radius + 5, centerY);
    ctx.lineTo(centerX + radius - 25, centerY - 12);
    ctx.lineTo(centerX + radius - 25, centerY + 12);
    ctx.closePath();
    ctx.fillStyle = '#1a1a2e';
    ctx.fill();
  };

  const spinWheel = () => {
    if (isSpinning || todaysSpins.includes(activeWheel)) return;

    const currentWheel = wheels.find(w => w.id === activeWheel);
    if (!currentWheel || !currentWheel.habits.length) return;

    setIsSpinning(true);

    const habits = currentWheel.habits;
    const randomIndex = Math.floor(Math.random() * habits.length);
    const sliceAngle = 360 / habits.length;
    
    // Calculate target rotation (multiple full spins + landing on slice)
    const fullSpins = 5 + Math.random() * 3;
    const targetAngle = 360 * fullSpins + (360 - randomIndex * sliceAngle - sliceAngle / 2);
    
    let currentRotation = rotation;
    const targetRotation = currentRotation + targetAngle;
    const duration = 4000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const newRotation = currentRotation + (targetRotation - currentRotation) * easeOut;
      setRotation(newRotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        setSelectedHabit(habits[randomIndex]);
        setShowModal(true);
      }
    };

    requestAnimationFrame(animate);
  };

  const handleAccept = async () => {
    if (!selectedHabit) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Please log in", variant: "destructive" });
        return;
      }

      const response = await supabase.functions.invoke('spin-accept', {
        body: { wheel: activeWheel, habitId: selectedHabit.id }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to accept challenge');
      }

      toast({ 
        title: "Challenge accepted! 🎯", 
        description: "Added to your tasks for today" 
      });

      setShowModal(false);
      setTodaysSpins([...todaysSpins, activeWheel]);
      setSelectedHabit(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to accept challenge';
      toast({ title: message, variant: "destructive" });
    }
  };

  const currentWheel = wheels.find(w => w.id === activeWheel);
  const WheelIcon = wheelIcons[activeWheel as keyof typeof wheelIcons];
  const hasSpunToday = todaysSpins.includes(activeWheel);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">🎡 Unwind Spin</h1>
        <p className="text-muted-foreground text-sm">One spin. One tiny challenge. One step better.</p>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="flex justify-center gap-4 mb-6">
          <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-2 rounded-full">
            <Brain className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">{stats.mind_streak}🔥</span>
          </div>
          <div className="flex items-center gap-2 bg-green-500/10 px-3 py-2 rounded-full">
            <Heart className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">{stats.body_streak}🔥</span>
          </div>
          <div className="flex items-center gap-2 bg-yellow-500/10 px-3 py-2 rounded-full">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">{stats.life_streak}🔥</span>
          </div>
        </div>
      )}

      {/* Wheel Tabs */}
      <Tabs value={activeWheel} onValueChange={setActiveWheel} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="mind" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Mind
          </TabsTrigger>
          <TabsTrigger value="body" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Body
          </TabsTrigger>
          <TabsTrigger value="life" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Life
          </TabsTrigger>
        </TabsList>

        {["mind", "body", "life"].map((wheelId) => (
          <TabsContent key={wheelId} value={wheelId} className="mt-0">
            <div className={`bg-gradient-to-br ${wheelColors[wheelId as keyof typeof wheelColors].bg} rounded-3xl p-6`}>
              {/* Wheel Canvas */}
              <div className="relative flex justify-center mb-6">
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={300}
                  className="drop-shadow-lg"
                />
              </div>

              {/* Spin Button */}
              <div className="flex justify-center">
                <Button
                  onClick={spinWheel}
                  disabled={isSpinning || hasSpunToday}
                  size="lg"
                  className={`px-8 py-6 text-lg font-bold rounded-full transition-all ${
                    hasSpunToday 
                      ? 'bg-muted text-muted-foreground' 
                      : 'bg-gradient-to-r from-primary to-accent hover:scale-105'
                  }`}
                >
                  {isSpinning ? (
                    "Spinning..."
                  ) : hasSpunToday ? (
                    <>✅ Spun Today</>
                  ) : (
                    <>
                      <Target className="w-5 h-5 mr-2" />
                      SPIN
                    </>
                  )}
                </Button>
              </div>

              {hasSpunToday && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Come back tomorrow for another {currentWheel?.name} challenge!
                </p>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Today's Challenges */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Today's Spin Status
        </h2>
        <div className="space-y-3">
          {["mind", "body", "life"].map((wheelId) => {
            const wheel = wheels.find(w => w.id === wheelId);
            const hasSpun = todaysSpins.includes(wheelId);
            const Icon = wheelIcons[wheelId as keyof typeof wheelIcons];
            
            return (
              <div 
                key={wheelId}
                className={`flex items-center justify-between p-4 rounded-xl border ${
                  hasSpun ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${hasSpun ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="font-medium">{wheel?.name || wheelId} Wheel</span>
                </div>
                {hasSpun ? (
                  <span className="text-sm text-primary font-medium">🎯 Challenge Accepted</span>
                ) : (
                  <span className="text-sm text-muted-foreground">Ready to spin</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Challenge Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Today's Challenge 🎯</DialogTitle>
            <DialogDescription className="text-center text-lg mt-4 text-foreground font-medium">
              {selectedHabit?.title}
            </DialogDescription>
            {selectedHabit?.description && (
              <p className="text-center text-muted-foreground mt-2">
                {selectedHabit.description}
              </p>
            )}
            {selectedHabit?.estimated_minutes && (
              <p className="text-center text-sm text-muted-foreground mt-2">
                ⏱️ ~{selectedHabit.estimated_minutes} minutes
              </p>
            )}
          </DialogHeader>
          <DialogFooter className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowModal(false);
                setSelectedHabit(null);
              }}
              className="flex-1"
            >
              Not now
            </Button>
            <Button
              onClick={handleAccept}
              className="flex-1 bg-gradient-to-r from-primary to-accent"
            >
              Accept Challenge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpinScreen;
