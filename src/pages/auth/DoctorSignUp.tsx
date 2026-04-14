import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { useAuth } from "@/hooks/useAuth";

export default function DoctorSignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialty: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      await signUp("doctor", {
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        specialty: formData.specialty,
        password: formData.password,
      });
      // After signup, Supabase auto-logs in the user. 
      // Navigating to /doctor will trigger the ProtectedRoute's "Approval Pending" screen.
      navigate("/doctor");
    } catch (err: unknown) {
      console.error("Signup error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Signup failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  return (
    <AuthLayout
      theme="doctor"
      title="Provider Registration"
      subtitle="Join our network of healthcare professionals"
      isLoading={loading}
      loadingMessage="Creating provider account..."
    >
      <form onSubmit={handleSignUp} className="space-y-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white/80">
              Full Name
            </Label>
            <Input
              id="name"
              placeholder="Dr. Sarah Johnson"
              required
              value={formData.name}
              onChange={handleChange}
              className="h-14 rounded-2xl border border-zinc-300/10 bg-transparent text-white placeholder:text-white/25 transition-all duration-300 focus:border-blue-400/40 focus:bg-white/[0.02] focus:ring-0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialty" className="text-white/80">
              Specialty
            </Label>
            <Input
              id="specialty"
              placeholder="Cardiology"
              required
              value={formData.specialty}
              onChange={handleChange}
              className="h-14 rounded-2xl border border-zinc-300/10 bg-transparent text-white placeholder:text-white/25 transition-all duration-300 focus:border-blue-400/40 focus:bg-white/[0.02] focus:ring-0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-white/80">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="sarah.j@hospital.com"
            required
            value={formData.email}
            onChange={handleChange}
            className="h-14 rounded-2xl border border-zinc-300/10 bg-transparent text-white placeholder:text-white/25 transition-all duration-300 focus:border-blue-400/40 focus:bg-white/[0.02] focus:ring-0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-white/80">
            Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            required
            value={formData.phone}
            onChange={handleChange}
            className="h-14 rounded-2xl border border-zinc-300/10 bg-transparent text-white placeholder:text-white/25 transition-all duration-300 focus:border-blue-400/40 focus:bg-white/[0.02] focus:ring-0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-white/80">
            Password
          </Label>
          <PasswordInput
            id="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <div className="flex items-start space-x-3 pt-1">
          <Checkbox
            id="terms"
            required
            className="mt-1 border-zinc-300/20 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
          />
          <Label
            htmlFor="terms"
            className="text-sm font-normal leading-6 text-white/60"
          >
            I agree to the{" "}
            <a
              href="#"
              className="font-medium text-blue-300 transition hover:text-blue-200 hover:underline"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="font-medium text-blue-300 transition hover:text-blue-200 hover:underline"
            >
              Privacy Policy
            </a>
          </Label>
        </div>

        {error && <p className="text-sm text-red-300">{error}</p>}

        <Button
          type="submit"
          className="
            group relative h-14 w-full overflow-hidden rounded-2xl
            border border-blue-300/35
            bg-[linear-gradient(180deg,#60a5fa_0%,#3b82f6_42%,#2563eb_100%)]
            text-base font-semibold text-white
            shadow-[0_10px_24px_rgba(37,99,235,0.28),0_2px_0_rgba(147,197,253,0.45)_inset,0_-3px_0_rgba(30,64,175,0.35)_inset]
            transition-all duration-300
            hover:-translate-y-0.5
            hover:border-blue-200/50
            hover:bg-[linear-gradient(180deg,#7dd3fc_0%,#3b82f6_45%,#1d4ed8_100%)]
            hover:shadow-[0_14px_30px_rgba(59,130,246,0.34),0_2px_0_rgba(219,234,254,0.55)_inset,0_-3px_0_rgba(30,64,175,0.42)_inset]
            active:translate-y-[1px]
            active:shadow-[0_6px_14px_rgba(37,99,235,0.24),0_1px_0_rgba(219,234,254,0.35)_inset,0_-2px_0_rgba(30,64,175,0.28)_inset]
          "
        >
          <span className="relative z-10">Submit Application</span>
          <span className="pointer-events-none absolute inset-x-3 top-[1px] h-[46%] rounded-[14px] bg-white/12 blur-md transition-opacity duration-300 group-hover:opacity-100" />
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-white/55">
        Already have an account?{" "}
        <Link
          to="/login/doctor"
          className="font-semibold text-blue-300 transition hover:text-blue-200 hover:underline"
        >
          Sign in instead
        </Link>
      </p>
    </AuthLayout>
  );
}