import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export interface SymptomTag {
  id: string;
  label: string;
  emoji: string | null;
  category: string | null;
  is_emergency: boolean;
  display_order: number;
}

export interface AvailableDoctor {
  id: string;
  full_name: string;
  specialty: string | null;
  clinic_name: string | null;
}

export interface PatientToken {
  id: string;
  token_number: string;
  clinic_date: string;
  doctor_id: string; // ADDED
  status: "waiting" | "serving" | "done" | "cancelled" | "no_show";
  priority: "critical" | "normal" | "low";
  symptom_tags: string[];
  custom_symptoms: string | null;
  estimated_wait_minutes: number | null;
  created_at: string;
  completed_at: string | null;
  doctor: {
    full_name: string | null;
    specialty: string | null;
  };
}

export interface PrescriptionMedicine {
  medicine_name: string;
  dose: string | null;
  frequency: string;
  duration_days: number;
  display_order: number;
}

export interface PatientPrescription {
  id: string;
  diagnosis: string | null;
  notes: string | null;
  created_at: string;
  doctor_name: string | null;
  token_number: string | null;
  prescription_medicines: PrescriptionMedicine[];
}

export interface MedicineReminder {
  id: string;
  patient_id: string;
  medicine_name: string;
  dose: string | null;
  reminder_times: string[];
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface DoctorProfileRow {
  specialty?: string | null;
  clinic_name?: string | null;
}

interface DoctorListRow {
  id: string;
  full_name: string | null;
  approved?: boolean | null;
  approval_status?: "pending" | "approved" | "rejected" | null;
  doctor_profiles?: DoctorProfileRow | DoctorProfileRow[] | null;
}

interface TokenDoctorRow {
  full_name?: string | null;
  doctor_profiles?: DoctorProfileRow | DoctorProfileRow[] | null;
}

interface TokenRow {
  id: string;
  token_number: string;
  doctor_id: string; // ADDED
  clinic_date: string;
  status: PatientToken["status"];
  priority: PatientToken["priority"];
  symptom_tags: string[] | null;
  custom_symptoms: string | null;
  estimated_wait_minutes: number | null;
  created_at: string;
  completed_at: string | null;
  profiles?: TokenDoctorRow | null;
}

interface PrescriptionDoctorRow {
  full_name?: string | null;
}

interface PrescriptionTokenRow {
  token_number?: string | null;
}

interface PrescriptionRow {
  id: string;
  diagnosis: string | null;
  notes: string | null;
  created_at: string;
  profiles?: PrescriptionDoctorRow | null;
  tokens?: PrescriptionTokenRow | null;
  prescription_medicines?: PrescriptionMedicine[] | null;
}

function firstItem<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export function usePatientQueue() {
  const { profile } = useAuth();

  const [booking, setBooking] = useState(false);
  const [myTokens, setMyTokens] = useState<PatientToken[]>([]);
  const [myPrescriptions, setMyPrescriptions] = useState<PatientPrescription[]>([]);
  const [myReminders, setMyReminders] = useState<MedicineReminder[]>([]);
  const [symptomTags, setSymptomTags] = useState<SymptomTag[]>([]);
  const [doctors, setDoctors] = useState<AvailableDoctor[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);

  const loadSymptomTags = useCallback(async () => {
    const { data, error } = await supabase
      .from("symptom_tags")
      .select("id, label, emoji, category, is_emergency, display_order")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error loading symptom tags:", error);
      setLoadingTags(false);
      return;
    }

    setSymptomTags((data ?? []) as SymptomTag[]);
    setLoadingTags(false);
  }, []);

  const loadDoctors = useCallback(async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        approved,
        approval_status,
        doctor_profiles (
          specialty,
          clinic_name
        )
      `)
      .eq("role", "doctor");

    if (error) {
      console.error("Error loading doctors:", error);
      return;
    }

    console.log("Doctors loaded from Supabase:", data);

    const approvedDoctors = ((data ?? []) as unknown as DoctorListRow[]).filter(
      (d) => d.approval_status === "approved" || d.approved === true
    );

    const mapped: AvailableDoctor[] = approvedDoctors.map((d) => {
      const doctorProfile = firstItem(d.doctor_profiles);

      return {
        id: d.id,
        full_name: d.full_name ?? "Unknown Doctor",
        specialty: doctorProfile?.specialty ?? null,
        clinic_name: doctorProfile?.clinic_name ?? null,
      };
    });

    setDoctors(mapped);
  }, []);

  const fetchMyTokens = useCallback(async () => {
    if (!profile?.id) return;

    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("tokens")
      .select(`
        id,
        token_number,
        doctor_id,
        clinic_date,
        status,
        priority,
        symptom_tags,
        custom_symptoms,
        estimated_wait_minutes,
        created_at,
        completed_at,
        profiles!tokens_doctor_id_fkey (
          full_name,
          doctor_profiles (
            specialty
          )
        )
      `)
      .eq("patient_id", profile.id)
      .eq("clinic_date", today)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const tokenRows = (data ?? []) as unknown as TokenRow[];

    const mapped: PatientToken[] = tokenRows.map((row) => {
      const doctorProfile = firstItem(row.profiles?.doctor_profiles);

      return {
        id: row.id,
        token_number: row.token_number,
        doctor_id: row.doctor_id,
        clinic_date: row.clinic_date,
        status: row.status,
        priority: row.priority,
        symptom_tags: row.symptom_tags ?? [],
        custom_symptoms: row.custom_symptoms ?? null,
        estimated_wait_minutes: row.estimated_wait_minutes ?? null,
        created_at: row.created_at,
        completed_at: row.completed_at ?? null,
        doctor: {
          full_name: row.profiles?.full_name ?? null,
          specialty: doctorProfile?.specialty ?? null,
        },
      };
    });

    setMyTokens(mapped);
  }, [profile?.id]);

  const fetchMyPrescriptions = useCallback(async () => {
    if (!profile?.id) return;

    const { data, error } = await supabase
      .from("prescriptions")
      .select(`
        id,
        diagnosis,
        notes,
        created_at,
        profiles!prescriptions_doctor_id_fkey (
          full_name
        ),
        tokens (
          token_number
        ),
        prescription_medicines (
          medicine_name,
          dose,
          frequency,
          duration_days,
          display_order
        )
      `)
      .eq("patient_id", profile.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const prescriptionRows = (data ?? []) as unknown as PrescriptionRow[];

    const mapped: PatientPrescription[] = prescriptionRows.map((rx) => ({
      id: rx.id,
      diagnosis: rx.diagnosis ?? null,
      notes: rx.notes ?? null,
      created_at: rx.created_at,
      doctor_name: rx.profiles?.full_name ?? null,
      token_number: rx.tokens?.token_number ?? null,
      prescription_medicines: (rx.prescription_medicines ?? []).sort(
        (a, b) => a.display_order - b.display_order
      ),
    }));

    setMyPrescriptions(mapped);
  }, [profile?.id]);

  const fetchMyReminders = useCallback(async () => {
    if (!profile?.id) return;

    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("medicine_reminders")
      .select(`
        id,
        patient_id,
        medicine_name,
        dose,
        reminder_times,
        start_date,
        end_date,
        is_active
      `)
      .eq("patient_id", profile.id)
      .eq("is_active", true)
      .gte("end_date", today)
      .order("start_date", { ascending: false });

    if (error) throw error;

    setMyReminders((data ?? []) as MedicineReminder[]);
  }, [profile?.id]);

  const bookToken = async (
    doctorId: string,
    selectedTags: string[],
    customSymptoms: string
  ) => {
    if (!profile?.id) throw new Error("Not logged in");

    setBooking(true);

    try {
      const today = new Date().toISOString().split("T")[0];

      const { data: tokenNum, error: fnError } = await supabase.rpc("generate_token_number", {
        p_doctor_id: doctorId,
        p_date: today,
      });

      if (fnError) throw fnError;

      const resolvedTokenNumber = (() => {
        if (typeof tokenNum === "string") return tokenNum;

        if (Array.isArray(tokenNum) && tokenNum.length > 0) {
          const first = tokenNum[0] as Record<string, unknown>;
          const tokenFromArray =
            first.generate_token_number ?? first.token_number;
          return typeof tokenFromArray === "string" ? tokenFromArray : null;
        }

        if (tokenNum && typeof tokenNum === "object") {
          const tokenObj = tokenNum as Record<string, unknown>;
          const tokenFromObject =
            tokenObj.generate_token_number ?? tokenObj.token_number;
          return typeof tokenFromObject === "string" ? tokenFromObject : null;
        }

        return null;
      })();

      if (!resolvedTokenNumber || !resolvedTokenNumber.trim()) {
        throw new Error(
          "Token generator returned an empty token number. Please fix the generate_token_number function in Supabase."
        );
      }

      const emergencyTags = ["Emergency", "Injury / Wound", "Chest Pain"];
      const isEmergency = selectedTags.some((tag) => emergencyTags.includes(tag));

      // Count how many patients are already waiting or being served by this doctor today
      const { count: queueCount } = await supabase
        .from("tokens")
        .select("id", { count: "exact", head: true })
        .eq("doctor_id", doctorId)
        .eq("clinic_date", today)
        .in("status", ["waiting", "serving"]);

      const AVG_MINUTES_PER_PATIENT = 10;
      const estimatedWait = (queueCount ?? 0) * AVG_MINUTES_PER_PATIENT;

      const { data, error } = await supabase
        .from("tokens")
        .insert({
          token_number: resolvedTokenNumber,
          patient_id: profile.id,
          doctor_id: doctorId,
          clinic_date: today,
          status: "waiting",
          priority: isEmergency ? "critical" : "normal",
          symptom_tags: selectedTags,
          custom_symptoms: customSymptoms || null,
          estimated_wait_minutes: estimatedWait,
        })
        .select()
        .single();

      if (error) throw error;

      if (selectedTags.length > 0) {
        for (const tag of selectedTags) {
          await supabase.rpc("upsert_symptom_report", {
            p_date: today,
            p_symptom: tag,
          });
        }
      }

      await fetchMyTokens();
      return data;
    } finally {
      setBooking(false);
    }
  };

  useEffect(() => {
    void loadSymptomTags();
  }, [loadSymptomTags]);

  useEffect(() => {
    void loadDoctors();
  }, [loadDoctors]);

  useEffect(() => {
    const channel = supabase
      .channel("patient-doctor-list-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          void loadDoctors();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "doctor_profiles" },
        () => {
          void loadDoctors();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadDoctors]);

  useEffect(() => {
    if (!profile?.id) return;
    void fetchMyTokens();
    void fetchMyPrescriptions();
    void fetchMyReminders();
  }, [profile?.id, fetchMyTokens, fetchMyPrescriptions, fetchMyReminders]);

  return {
    bookToken,
    booking,
    myTokens,
    fetchMyTokens,
    myPrescriptions,
    fetchMyPrescriptions,
    myReminders,
    fetchMyReminders,
    symptomTags,
    loadingTags,
    doctors,
  };
}