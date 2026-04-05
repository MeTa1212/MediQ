import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, User, Settings, Calendar, Stethoscope } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, profile, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500/30 border-t-emerald-500 mx-auto mb-4"></div>
            <p className="text-white/70">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8 lg:px-12">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20">
              {isPatient ? (
                <Calendar className="h-6 w-6 text-emerald-400" />
              ) : (
                <Stethoscope className="h-6 w-6 text-emerald-400" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                {isPatient ? "Patient Portal" : "Doctor Dashboard"}
              </h1>
              <p className="text-xs text-white/60 uppercase tracking-wider">
                {profile.role}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {/* Profile Dropdown */}
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-blue-500/20 flex items-center justify-center">
                <User className="h-5 w-5 text-white/80" />
              </div>
              <div className="hidden md:block">
                <p className="font-semibold text-white">{profile.full_name}</p>
                <p className="text-xs text-white/60">{profile.email}</p>
              </div>
            </div>

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="gap-2 border-white/20 bg-white/5 hover:bg-white/10 text-white/90 backdrop-blur-sm transition-all"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-12 pb-24 sm:px-8 lg:px-12">
        {children}
      </main>
    </div>
  );
}