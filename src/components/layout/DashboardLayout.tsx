import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, User, Calendar, Stethoscope } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, profile, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login/patient");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isPatient = profile?.role === "patient";
  const isDoctor = profile?.role === "doctor";

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-[#080e1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-white/10 border-t-blue-500/70 animate-spin" />
          <p className="text-sm text-white/40 tracking-wide">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const initials = profile.full_name
    ? profile.full_name.split(" ").map((p: string) => p[0]).join("").slice(0, 2).toUpperCase()
    : "P";

  return (
    <div className="min-h-screen bg-[#080e1a]">
      {/* ── Header ─────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#080e1a]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-12">
          {/* Brand */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 transition-colors group-hover:bg-blue-500/15">
              {isPatient ? (
                <Calendar className="h-[18px] w-[18px] text-blue-400" />
              ) : (
                <Stethoscope className="h-[18px] w-[18px] text-blue-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-white/90 leading-none">
                {isPatient ? "Patient Portal" : "Doctor Dashboard"}
              </p>
              <p className="mt-0.5 text-[10px] text-white/35 uppercase tracking-wider leading-none">
                {profile.role}
              </p>
            </div>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-2.5">
            {/* User pill */}
            <div className="hidden md:flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.04] px-3.5 py-2">
              <div className="h-7 w-7 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white/90 leading-none">{profile.full_name}</p>
                <p className="mt-0.5 text-[10px] text-white/35 leading-none truncate max-w-[140px]">{profile.email}</p>
              </div>
            </div>

            {/* Logout */}
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="gap-2 text-white/50 hover:text-white/90 hover:bg-white/[0.05] transition-all text-xs h-8 px-3"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-6 py-10 pb-24 sm:px-8 lg:px-12">
        {children}
      </main>
    </div>
  );
}