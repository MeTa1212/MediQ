import { Activity, Stethoscope, Pill, Syringe } from "lucide-react";
import { useState, useEffect } from "react";

export function MedicalLoader({ message = "Loading..." }: { message?: string }) {
  const [iconIndex, setIconIndex] = useState(0);
  const icons = [Activity, Stethoscope, Pill, Syringe];
  const CurrentIcon = icons[iconIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setIconIndex((prev) => (prev + 1) % icons.length);
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex min-h-[280px] w-full flex-col items-center justify-center gap-8">
      {/* Icon container */}
      <div className="relative">
        {/* Soft ambient glow */}
        <div className="absolute -inset-8 rounded-full bg-blue-500/8 blur-2xl" />

        {/* Spinning ring */}
        <div
          className="absolute -inset-4 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: "rgba(59,130,246,0.35)",
            borderRightColor: "rgba(59,130,246,0.12)",
            animation: "spinSlow 2.4s linear infinite",
          }}
        />

        {/* Core */}
        <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.10] bg-white/[0.05] backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
          <div className="absolute inset-x-3 top-0 h-px bg-white/[0.12]" />
          <CurrentIcon
            className="h-7 w-7 text-blue-400 transition-all duration-500"
            strokeWidth={1.75}
          />
        </div>
      </div>

      {/* Text */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/35">
          {message}
        </p>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1 w-1 rounded-full bg-blue-500/50"
              style={{
                animation: `pulseSoft 1.4s ease-in-out infinite`,
                animationDelay: `${i * 200}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
