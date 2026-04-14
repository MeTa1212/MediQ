import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/lib/auth";
import { MedicalLoader } from "@/components/MedicalLoader";
import { Clock, AlertTriangle, LogOut, RefreshCw, ShieldX } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole: UserRole;
}

const ProtectedRoute = ({
  children,
  allowedRole,
}: ProtectedRouteProps) => {
  const { user, role, loading, isProfileLoading, approval_status, logout } = useAuth();

  // Still loading auth or profile — show branded loader
  if (loading || isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c]">
        <MedicalLoader message="Authenticating..." />
      </div>
    );
  }

  // Not logged in — redirect to appropriate login
  if (!user) {
    const loginPath = allowedRole === "doctor" ? "/login/doctor" : allowedRole === "admin" ? "/login/doctor" : "/login/patient";
    return <Navigate to={loginPath} replace />;
  }

  // Logged in but wrong role
  if (role !== allowedRole) {
    // If user is a doctor trying to access admin, redirect to doctor
    // If user is a patient trying to access doctor, redirect to patient
    // Otherwise go home
    return <Navigate to="/" replace />;
  }

  // DOCTOR-ONLY approval checks
  // Patients and admins do NOT require approval
  if (role === "doctor") {
    // REJECTED doctor
    if (approval_status === "rejected") {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#0a0f1c] text-white">
          <div className="max-w-md w-full text-center space-y-6 p-8 rounded-[28px] border border-rose-500/20 bg-rose-500/5 backdrop-blur-2xl shadow-[0_16px_40px_rgba(225,29,72,0.1)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent pointer-events-none" />
            <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center relative">
               <ShieldX className="h-8 w-8 text-rose-500" />
            </div>
            <div className="space-y-2 relative">
              <h1 className="text-2xl font-bold tracking-tight text-white">Application Rejected</h1>
              <p className="text-white/60 text-sm leading-relaxed">
                We are sorry, but your doctor application has not been approved at this time. Please contact administration for more details on your specific case.
              </p>
            </div>
            <div className="pt-4 flex flex-col gap-3 relative">
               <button 
                 onClick={() => logout()}
                 className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors font-semibold text-sm flex items-center justify-center gap-2"
               >
                 <LogOut className="w-4 h-4" /> Sign Out
               </button>
            </div>
          </div>
        </div>
      );
    }
    
    // PENDING doctor
    if (approval_status === "pending") {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#0a0f1c] text-white">
          <div className="max-w-md w-full text-center space-y-6 p-8 rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.16)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />
            <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center relative">
               <Clock className="h-8 w-8 text-amber-500" />
            </div>
            <div className="space-y-2 relative">
              <h1 className="text-2xl font-bold tracking-tight">Account Under Review</h1>
              <p className="text-white/60 text-sm leading-relaxed">
                Your doctor account has been created successfully. It is currently
                pending admin verification. You will gain full access once approved.
              </p>
            </div>
            <div className="pt-2 relative">
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 mb-4">
                <div className="flex items-start gap-3 text-left">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-300/90 text-xs font-semibold">What happens next?</p>
                    <p className="text-amber-300/60 text-xs mt-1 leading-relaxed">
                      An admin will review your credentials and approve your account. This typically takes 1-2 business days.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 relative">
               <button 
                 onClick={() => window.location.reload()}
                 className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors font-semibold text-sm flex items-center justify-center gap-2"
               >
                 <RefreshCw className="w-4 h-4" /> Check Status
               </button>
               <button 
                 onClick={() => logout()}
                 className="w-full py-3.5 rounded-xl bg-transparent border border-white/10 text-white/70 hover:bg-white/5 hover:text-white transition-colors font-semibold text-sm flex items-center justify-center gap-2"
               >
                 <LogOut className="w-4 h-4" /> Sign Out
               </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // All checks passed — render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;