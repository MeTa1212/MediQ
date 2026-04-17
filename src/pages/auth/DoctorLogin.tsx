import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function DoctorLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout } = useAuth();
  const isAdminLogin =
    location.pathname === "/admin/login" || location.pathname === "/login/admin";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const profile = await login(formData.email, formData.password);

      if (isAdminLogin) {
        if (!profile) {
          setError(
            "Login succeeded, but your profile could not be loaded. Please run fix_rls_policies.sql and verify your profiles row exists."
          );
          return;
        }

        if (profile?.role !== "admin") {
          await logout();
          setError("This portal is for admin accounts only.");
          return;
        }

        navigate("/admin", { replace: true });
        return;
      }

      if (profile?.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/doctor", { replace: true });
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
      theme={isAdminLogin ? "admin" : "doctor"}
      isLoading={isSubmitting}
      loadingMessage={isAdminLogin ? "Verifying admin credentials..." : "Verifying credentials..."}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {isAdminLogin ? "Admin access" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-white/60 sm:text-base">
          {isAdminLogin
            ? "Sign in with an admin account to manage approvals and access control."
            : "Sign in to access your dashboard and manage your workflow."}
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white/80">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder={isAdminLogin ? "admin@mediq.com" : "doctor@example.com"}
            className="h-14 rounded-2xl border border-zinc-300/10 bg-transparent text-white placeholder:text-white/25 transition-all duration-300 focus:border-blue-400/40 focus:bg-white/[0.02] focus:ring-0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-white/80">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Your password"
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
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              className="border-zinc-300/20 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
            />
            <Label htmlFor="remember" className="text-sm text-white/60">
              Remember me
            </Label>
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
          className="h-14 w-full rounded-2xl border border-blue-400/40 bg-blue-600 text-base font-semibold text-white shadow-none transition-all duration-300 hover:border-blue-300/60 hover:bg-blue-500 disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      {isAdminLogin ? (
        <p className="mt-8 text-center text-sm text-white/55">
          Admin accounts are provisioned by the platform owner.
        </p>
      ) : (
        <p className="mt-8 text-center text-sm text-white/55">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup/doctor"
            className="font-semibold text-blue-300 transition hover:text-blue-200 hover:underline"
          >
            Sign up
          </Link>
        </p>
      )}
    </AuthLayout>
  );
}