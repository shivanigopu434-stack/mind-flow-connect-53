import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  iconColor?: string;
}

const StatCard = ({ icon: Icon, label, value, iconColor = "text-primary" }: StatCardProps) => {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/50 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl bg-muted ${iconColor}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
