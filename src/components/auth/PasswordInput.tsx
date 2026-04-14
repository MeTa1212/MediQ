import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, CheckCircle2, Circle } from "lucide-react";

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  placeholder?: string;
}

export function PasswordInput({ value, onChange, id = "password", placeholder = "Create a strong password" }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  // Strength calculations
  const hasMinLength = value.length >= 8;
  const hasUpperCase = /[A-Z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSpecial = /[^A-Za-z0-9]/.test(value);

  const strengthScore = [hasMinLength, hasUpperCase, hasNumber, hasSpecial].filter(Boolean).length;
  
  let strengthColor = "bg-zinc-700/50";
  if (strengthScore === 1) strengthColor = "bg-rose-500";
  if (strengthScore === 2) strengthColor = "bg-amber-400";
  if (strengthScore === 3) strengthColor = "bg-blue-400";
  if (strengthScore === 4) strengthColor = "bg-emerald-500";

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          required
          placeholder={placeholder}
          className="h-14 rounded-2xl border border-zinc-300/10 bg-transparent text-white placeholder:text-white/25 transition-all duration-300 focus:border-blue-400/40 focus:bg-white/[0.02] focus:ring-0 pr-12"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      {value.length > 0 && (
        <div className="animate-fade-up space-y-3 bg-black/20 p-3.5 rounded-xl border border-white/5">
          {/* Progress Bars */}
          <div className="flex gap-1.5 h-1.5">
            {[1, 2, 3, 4].map((step) => (
              <div 
                key={step} 
                className={`flex-1 rounded-full transition-colors duration-500 ${
                  strengthScore >= step ? strengthColor : "bg-zinc-700/50"
                }`}
              />
            ))}
          </div>

          {/* Checklist */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-400" : "text-white/40"}`}>
              {hasMinLength ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
              8+ Characters
            </div>
            <div className={`flex items-center gap-1.5 ${hasUpperCase ? "text-emerald-400" : "text-white/40"}`}>
              {hasUpperCase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
              Uppercase Letter
            </div>
            <div className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-400" : "text-white/40"}`}>
              {hasNumber ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
              Number (0-9)
            </div>
            <div className={`flex items-center gap-1.5 ${hasSpecial ? "text-emerald-400" : "text-white/40"}`}>
              {hasSpecial ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
              Special Character
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
