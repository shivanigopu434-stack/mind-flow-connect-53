import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface UnwindOrbProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  animated?: boolean;
  onClick?: () => void;
}

const sizeMap = {
  sm: { container: "w-6 h-6", eye: "w-2 h-1.5", pupil: "w-1 h-1", eyeGap: "w-4" },
  md: { container: "w-10 h-10", eye: "w-3 h-2", pupil: "w-1.5 h-1.5", eyeGap: "w-6" },
  lg: { container: "w-16 h-16", eye: "w-4 h-3", pupil: "w-2 h-2", eyeGap: "w-10" },
  xl: { container: "w-24 h-24", eye: "w-5 h-4", pupil: "w-2.5 h-2.5", eyeGap: "w-14" },
};

const UnwindOrb = ({ size = "md", className, animated = true, onClick }: UnwindOrbProps) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isAngry, setIsAngry] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [lookStraight, setLookStraight] = useState(false);
  const clickHistoryRef = useRef<number[]>([]);
  const sizeConfig = sizeMap[size];

  // Random blink effect
  useEffect(() => {
    if (!animated) return;
    
    const randomBlink = () => {
      if (!isAngry) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
      }
      const nextBlink = Math.random() * 2000 + 3000;
      return setTimeout(randomBlink, nextBlink);
    };

    const timeout = setTimeout(randomBlink, Math.random() * 2000 + 1000);
    return () => clearTimeout(timeout);
  }, [animated, isAngry]);

  const handleClick = () => {
    if (onClick) onClick();
    if (!animated) return;

    const now = Date.now();
    clickHistoryRef.current = clickHistoryRef.current.filter(t => now - t < 2000);
    clickHistoryRef.current.push(now);

    if (clickHistoryRef.current.length >= 4) {
      // Trigger angry mode
      setIsAngry(true);
      setIsShaking(true);
      setLookStraight(true);
      clickHistoryRef.current = [];

      setTimeout(() => {
        setIsAngry(false);
        setIsShaking(false);
        setLookStraight(false);
      }, 3000);
    } else {
      // Look straight briefly
      setLookStraight(true);
      setTimeout(() => {
        if (!isAngry) setLookStraight(false);
      }, 1500);
    }
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center cursor-pointer",
        sizeConfig.container,
        animated && "animate-[float_4s_ease-in-out_infinite_alternate]",
        isShaking && "animate-[shake_0.1s_infinite_alternate]",
        className
      )}
      onClick={handleClick}
    >
      {/* Glow */}
      <div
        className={cn(
          "absolute inset-0 rounded-full blur-xl",
          isAngry ? "bg-red-500/50" : "bg-cyan-400/50"
        )}
      />

      {/* Main orb body */}
      <div
        className={cn(
          "absolute inset-0 rounded-full transition-all duration-300",
          isAngry && "ring-2 ring-red-500/40"
        )}
        style={{
          background: "radial-gradient(circle at 30% 30%, white 10%, #00d4d4 60%, rgba(0,255,255,0.4) 100%)",
        }}
      />

      {/* Eyes */}
      <div className={cn("absolute flex justify-between z-10", sizeConfig.eyeGap)} style={{ top: "35%" }}>
        <div
          className={cn(
            "bg-white rounded-full overflow-hidden relative transition-all duration-200 shadow-[0_0_10px_rgba(0,255,255,0.5)]",
            sizeConfig.eye,
            isBlinking && "!h-0.5"
          )}
        >
          <div
            className={cn(
              "bg-black rounded-full absolute transition-all duration-200",
              sizeConfig.pupil
            )}
            style={{
              top: "15%",
              left: lookStraight ? "30%" : "50%",
            }}
          />
        </div>
        <div
          className={cn(
            "bg-white rounded-full overflow-hidden relative transition-all duration-200 shadow-[0_0_10px_rgba(0,255,255,0.5)]",
            sizeConfig.eye,
            isBlinking && "!h-0.5"
          )}
        >
          <div
            className={cn(
              "bg-black rounded-full absolute transition-all duration-200",
              sizeConfig.pupil
            )}
            style={{
              top: "15%",
              left: lookStraight ? "30%" : "50%",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default UnwindOrb;
