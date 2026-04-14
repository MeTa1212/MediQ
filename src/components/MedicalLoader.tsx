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
    <div className="flex min-h-[300px] w-full flex-col items-center justify-center space-y-8">
      <div className="relative">
        <style>{`
          @keyframes orbit {
            from { transform: rotate(0deg) translateX(45px) rotate(0deg); }
            to { transform: rotate(360deg) translateX(45px) rotate(-360deg); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .orbit-dot {
            position: absolute;
            width: 8px;
            height: 8px;
            border-radius: full;
            background: theme('colors.primary.DEFAULT');
            animation: orbit 3s linear infinite;
          }
        `}</style>

        {/* Outer Glows */}
        <div className="absolute -inset-10 animate-pulse rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -inset-4 animate-ping rounded-full bg-primary/5 opacity-50 duration-[3000ms]" />

        {/* Orbiting particles */}
        <div className="absolute inset-0">
          {[0, 72, 144, 216, 288].map((deg, i) => (
            <div 
              key={i}
              className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-primary/40 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
              style={{
                transform: `rotate(${deg}deg) translateX(48px)`,
                opacity: 0.6 - (i * 0.1)
              }}
            />
          ))}
        </div>
        
        {/* Core Container */}
        <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-[24px] border border-white/20 bg-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl">
          <div className="absolute inset-x-4 top-0 h-px bg-white/40" />
          <div className="absolute inset-y-4 left-0 w-px bg-white/10" />
          
          <div className="transition-all duration-500 transform scale-110">
            <CurrentIcon className="h-9 w-9 text-primary animate-pulse" strokeWidth={2.5} />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="text-xs font-black uppercase tracking-[0.4em] text-white/50 animate-pulse text-center">
          {message}
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div 
              key={i} 
              className="h-1 w-1 rounded-full bg-primary/40 animate-bounce" 
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
