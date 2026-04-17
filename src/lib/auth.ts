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

const ensureProfileRows = async (
  userId: string,
  role: UserRole,
  data: SignUpData
) => {
  const isDoctor = role === "doctor";

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        full_name: data.fullName,
        email: data.email.trim().toLowerCase(),
        phone: data.phone || null,
        role,
        approved: !isDoctor,
        approval_status: isDoctor ? "pending" : "approved",
      },
      { onConflict: "id", ignoreDuplicates: true }
    );

  if (profileError) {
    console.warn("Profile upsert skipped:", profileError);
    return;
  }

  if (isDoctor) {
    const { error: doctorProfileError } = await supabase
      .from("doctor_profiles")
      .upsert(
        {
          id: userId,
          specialty: data.specialty || null,
        },
        { onConflict: "id", ignoreDuplicates: true }
      );

    if (doctorProfileError) {
      console.warn("Doctor profile upsert skipped:", doctorProfileError);
    }
    return;
  }

  const { error: patientProfileError } = await supabase
    .from("patient_profiles")
    .upsert(
      {
        id: userId,
        age: data.age ?? null,
      },
      { onConflict: "id", ignoreDuplicates: true }
    );

  if (patientProfileError) {
    console.warn("Patient profile upsert skipped:", patientProfileError);
  }
};

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

  await ensureProfileRows(user.id, role, data);

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