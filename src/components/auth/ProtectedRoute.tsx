import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/lib/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole: UserRole;
}

const ProtectedRoute = ({
  children,
  allowedRole,
}: ProtectedRouteProps) => {
  const { user, role, loading, approved } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-medium">
        Loading...
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <Navigate
        to={allowedRole === "doctor" ? "/login/doctor" : "/login/patient"}
        replace
      />
    );
  }

  // Logged in but wrong role
  if (role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  // Doctor exists but not approved yet
  if (role === "doctor" && !approved) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold">Approval Pending</h1>
          <p className="text-muted-foreground">
            Your doctor account has been created, but it is not approved yet.
            Please wait for clinic/admin verification.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;