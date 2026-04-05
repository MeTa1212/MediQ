import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";

export default function DoctorLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(formData.email, formData.password);
      navigate("/doctor");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Login failed");
      }
    }
  };

  return (
    <AuthLayout theme="doctor">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Welcome back
        </h1>
        <p className="mt-2 text-sm leading-6 text-white/60 sm:text-base">
          Sign in to access your dashboard and manage your workflow.
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
            placeholder="doctor@example.com"
            className="h-14 rounded-2xl border border-zinc-300/10 bg-transparent text-white placeholder:text-white/25 transition-all duration-300 focus:border-blue-400/40 focus:bg-white/[0.02] focus:ring-0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-white/80">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="Your password"
            className="h-14 rounded-2xl border border-zinc-300/10 bg-transparent text-white placeholder:text-white/25 transition-all duration-300 focus:border-blue-400/40 focus:bg-white/[0.02] focus:ring-0"
          />
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

        {error && <p className="text-sm text-red-300">{error}</p>}

        <Button
          type="submit"
          className="h-14 w-full rounded-2xl border border-blue-400/40 bg-blue-600 text-base font-semibold text-white shadow-none transition-all duration-300 hover:border-blue-300/60 hover:bg-blue-500"
        >
          Login
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-white/55">
        Don&apos;t have an account?{" "}
        <Link
          to="/signup/doctor"
          className="font-semibold text-blue-300 transition hover:text-blue-200 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}