import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  getUserProfile,
  loginUser,
  logoutUser,
  signUpUser,
  SignUpData,
  UserRole,
} from "@/lib/auth";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  approved: boolean; // keep for backward compatibility
  approval_status: "pending" | "approved" | "rejected";
  age?: number | null;
  specialty?: string | null;
  clinic_name?: string | null;
  registration_id?: string | null;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: UserRole | null;
  loading: boolean;
  isProfileLoading: boolean;
  approved: boolean;
  approval_status: "pending" | "approved" | "rejected";
  signUp: (role: UserRole, data: SignUpData) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const profileData = await getUserProfile(userId);
      console.log("Fetched profile:", profileData);
      setProfile(profileData);
      return profileData;
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setIsProfileLoading(true);
    try {
      await fetchProfile(user.id);
    } finally {
      setLoading(false);
      setIsProfileLoading(false);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);

      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (!session?.user) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      if (!user?.id) {
        setProfile(null);
        setLoading(false);
        setIsProfileLoading(false);
        return;
      }
      
      // Prevent fetching if we just fetched it during login
      if (profile?.id === user.id) {
        return; 
      }

      setLoading(true);
      setIsProfileLoading(true);
      try {
        const profileData = await fetchProfile(user.id);
        if (!active) return;
        setProfile(profileData);
      } finally {
        if (active) {
          setLoading(false);
          setIsProfileLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [user?.id, fetchProfile, profile?.id]);

  const signUp = async (role: UserRole, data: SignUpData) => {
    await signUpUser(role, data);
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setIsProfileLoading(true);
    try {
      const authData = await loginUser(email.trim().toLowerCase(), password);
      // Immediately fetch profile so we can guarantee route stability
      const profileData = await fetchProfile(authData.user.id);
      return profileData;
    } finally {
      // The useEffect will also sync, but we clear loading safely
      setLoading(false);
      setIsProfileLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setSession(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      role: profile?.role ?? null,
      approved: profile?.approved ?? false,
      approval_status: profile ? profile.approval_status : (user ? "pending" : "pending"),
      loading,
      isProfileLoading,
      signUp,
      login,
      logout,
      refreshProfile,
    }),
    [user, session, profile, loading, isProfileLoading, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};