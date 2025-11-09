import { LucideIcon } from "lucide-react";

interface NavigationTileProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  onClick?: () => void;
}

const NavigationTile = ({ icon: Icon, title, description, gradient, onClick }: NavigationTileProps) => {
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl p-6 text-left transition-all hover:scale-105 hover:shadow-xl ${gradient} border border-border/30`}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-white/90 dark:bg-black/20 group-hover:scale-110 transition-transform">
          <Icon size={28} className="text-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
};

export default NavigationTile;
