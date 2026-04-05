import { supabase } from "@/lib/supabase";

export type UserRole = "doctor" | "patient";

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

  console.log("Creating user with:", { email: email.trim().toLowerCase(), role });

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      },
    },
  });

  if (authError) {
    console.error("Auth signup error:", authError);
    throw authError;
  }

  const user = authData.user;
  if (!user) throw new Error("User signup failed - no user returned.");

  console.log("Auth user created:", user.id);

  // Wait a moment for auth to settle, then create profile
  await new Promise(resolve => setTimeout(resolve, 500));

  // Create profile
  const { error: profileError } = await supabase.from("profiles").insert([
    {
      id: user.id,
      full_name: fullName,
      email: email.trim().toLowerCase(),
      phone: phone || null,
      role,
      approved: role === "patient", // patients approved immediately
      age: age ?? null,
      specialty: role === "doctor" ? specialty || null : null,
    },
  ]);

  if (profileError) {
    console.error("Profile creation error:", profileError);
    throw profileError;
  }

  console.log("Profile created successfully");
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

  if (error && error.code !== "PGRST116") { // PGRST116 = no rows
    throw error;
  }

  return data;
};