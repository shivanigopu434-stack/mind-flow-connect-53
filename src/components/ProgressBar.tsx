interface ProgressBarProps {
  current: number;
  max: number;
  label: string;
}

const ProgressBar = ({ current, max, label }: ProgressBarProps) => {
  const percentage = (current / max) * 100;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">{current}/{max}</span>
      </div>
      <div className="h-3 rounded-full bg-progress-bg overflow-hidden">
        <div 
          className="h-full bg-progress-fill rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
