import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

export default function PatientLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(email, password);
      navigate("/patient");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <AuthLayout
      theme="patient"
      title="Patient Login"
      subtitle="Access your health dashboard"
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
            className="h-12 border-white/10 bg-white/5 text-white placeholder:text-white/35 focus-visible:ring-emerald-400/40"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-white/85">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="h-12 border-white/10 bg-white/5 text-white placeholder:text-white/35 focus-visible:ring-emerald-400/40"
          />
        </div>

        <Button
          type="submit"
          className="mt-4 h-12 w-full bg-emerald-500 text-white hover:bg-emerald-400"
        >
          Login
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-white/65">
        Don't have an account?{" "}
        <Link
          to="/signup/patient"
          className="font-medium text-emerald-300 transition hover:text-emerald-200"
        >
          Sign Up
        </Link>
      </p>
    </AuthLayout>
  );
}