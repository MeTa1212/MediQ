import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";

export default function PatientSignUp() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTermsChange = (checked: boolean | "indeterminate") => {
    setFormData((prev) => ({
      ...prev,
      terms: checked === true,
    }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    if (!formData.fullName.trim()) {
      alert("Please enter your full name");
      return;
    }

    if (!formData.email.trim()) {
      alert("Please enter your email");
      return;
    }

    if (!formData.phone.trim()) {
      alert("Please enter your phone number");
      return;
    }

    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!formData.terms) {
      alert("Please accept the Terms of Service and Privacy Policy");
      return;
    }

    try {
      setLoading(true);
      console.log("Starting signup...");

      await signUp("patient", {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      console.log("Signup successful");
      alert("Account created successfully. Please log in.");

      navigate("/login/patient");
    } catch (error: any) {
      console.error("Signup error:", error);
      alert(error?.message || "Signup failed");
    } finally {
      console.log("Stopping loading");
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      theme="patient"
      title="Patient Registration"
      subtitle="Create your account to access appointments, queue updates, prescriptions, and health records."
    >
      <form onSubmit={handleSignUp} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-white/85">
            Full Name
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleChange}
            required
            disabled={loading}
            className="h-12 border-white/10 bg-white/5 text-white placeholder:text-white/35 focus:border-emerald-400/40 focus:ring-emerald-400/40"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-white/85">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
            className="h-12 border-white/10 bg-white/5 text-white placeholder:text-white/35 focus:border-emerald-400/40 focus:ring-emerald-400/40"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-white/85">
            Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={handleChange}
            required
            disabled={loading}
            className="h-12 border-white/10 bg-white/5 text-white placeholder:text-white/35 focus:border-emerald-400/40 focus:ring-emerald-400/40"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-white/85">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            disabled={loading}
            className="h-12 border-white/10 bg-white/5 text-white placeholder:text-white/35 focus:border-emerald-400/40 focus:ring-emerald-400/40"
          />
          <p className="text-xs text-white/45">
            Password must be at least 6 characters.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-white/85">
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            disabled={loading}
            className="h-12 border-white/10 bg-white/5 text-white placeholder:text-white/35 focus:border-emerald-400/40 focus:ring-emerald-400/40"
          />
        </div>

        <div className="flex items-start space-x-3 rounded-xl border border-white/8 bg-white/[0.03] p-3">
          <Checkbox
            id="terms"
            checked={formData.terms}
            onCheckedChange={handleTermsChange}
            disabled={loading}
            className="mt-0.5 border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
          />
          <Label
            htmlFor="terms"
            className="text-sm font-normal leading-6 text-white/65"
          >
            I agree to the Terms of Service and Privacy Policy.
          </Label>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-white/65">
        Already have an account?{" "}
        <Link
          to="/login/patient"
          className="font-semibold text-emerald-300 transition hover:text-emerald-200 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}