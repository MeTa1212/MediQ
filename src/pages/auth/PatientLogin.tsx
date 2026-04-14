import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff } from "lucide-react";

export default function PatientLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const profile = await login(email, password);
      
      if (profile?.role === "admin") {
         navigate("/admin", { replace: true });
      } else {
         navigate("/patient", { replace: true });
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      theme="patient"
      title="Patient Login"
      subtitle="Access your health dashboard"
      isLoading={isSubmitting}
      loadingMessage="Verifying credentials..."
    >
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white/85">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="h-14 rounded-2xl border border-zinc-300/10 bg-transparent text-white placeholder:text-white/25 transition-all duration-300 focus:border-emerald-400/40 focus:bg-white/[0.02] focus:ring-0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-white/85">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="h-14 rounded-2xl border border-zinc-300/10 bg-transparent text-white placeholder:text-white/25 transition-all duration-300 focus:border-emerald-400/40 focus:bg-white/[0.02] focus:ring-0 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3">
            <p className="text-sm text-rose-300">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 h-14 w-full rounded-2xl bg-emerald-500 text-white text-base font-semibold hover:bg-emerald-400 disabled:opacity-60 transition-all duration-300 shadow-lg shadow-emerald-500/20"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-white/65">
        Don't have an account?{" "}
        <Link
          to="/signup/patient"
          className="font-semibold text-emerald-300 transition hover:text-emerald-200 hover:underline"
        >
          Sign Up
        </Link>
      </p>
    </AuthLayout>
  );
}