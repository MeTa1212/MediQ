import { supabase } from "@/lib/supabase";

export type UserRole = "doctor" | "patient" | "admin";

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  age?: number | null;
  specialty?: string;
}

export const signUpUser = async (
  role: UserRole,
  data: SignUpData
) => {
  const { email, password, fullName, phone, age, specialty } = data;

  console.log("Creating user with:", {
    email: email.trim().toLowerCase(),
    role,
  });

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        full_name: fullName,
        role,
        phone: phone || null,
        age: age ?? null,
        specialty: role === "doctor" ? specialty || null : null,
      },
    },
  });

  if (authError) {
    console.error("Auth signup error:", authError);
    throw authError;
  }

  const user = authData.user;
  if (!user) {
    throw new Error("User signup failed - no user returned.");
  }

  console.log("Auth user created:", user.id);
  return authData;
};

export const loginUser = async (email: string, password: string) => {
  console.log("Logging in with:", email.trim().toLowerCase());

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    console.error("Login error:", error);
    throw error;
  }

  console.log("Login successful");
  return data;
};

export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return data;
};