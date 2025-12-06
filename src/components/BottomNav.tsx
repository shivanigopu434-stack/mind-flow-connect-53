import { Home, Brain, Calendar, Sparkles, Bot, Target } from "lucide-react";

type NavItem = "home" | "mindfulness" | "calendar" | "vibes" | "ai" | "spin";

interface BottomNavProps {
  active: NavItem;
  onNavigate: (item: NavItem) => void;
}

const navItems = [
  { id: "home" as NavItem, icon: Home, label: "Home" },
  { id: "spin" as NavItem, icon: Target, label: "Spin" },
  { id: "mindfulness" as NavItem, icon: Brain, label: "Mind" },
  { id: "vibes" as NavItem, icon: Sparkles, label: "Vibes" },
  { id: "ai" as NavItem, icon: Bot, label: "Unwind" },
];

const BottomNav = ({ active, onNavigate }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-50">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                  isActive
                    ? "text-primary scale-110"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={24} className={isActive ? "animate-scale-in" : ""} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
