import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export interface MedicineInput {
  name: string;
  dose: string;
  freq: string;
  days: number;
}

type PrescriptionRow = {
  id: string;
  diagnosis: string | null;
  notes: string | null;
  created_at: string;
  patient_id: string;
  profiles?: {
    full_name?: string | null;
    phone?: string | null;
  } | null;
  tokens?: {
    token_number?: string | null;
    completed_at?: string | null;
  } | null;
  prescription_medicines?: {
    medicine_name: string;
    dose: string | null;
    frequency: string;
    duration_days: number;
    display_order: number;
  }[] | null;
};

export function usePrescriptions() {
  const { profile } = useAuth();
  const [saving, setSaving] = useState(false);

  const savePrescription = async (
    tokenId: string,
    patientId: string,
    diagnosis: string,
    notes: string,
    medicines: MedicineInput[]
  ) => {
    if (!profile?.id) throw new Error("Not authenticated");

    setSaving(true);

    try {
      const { data: rx, error: rxError } = await supabase
        .from("prescriptions")
        .insert({
          token_id: tokenId,
          patient_id: patientId,
          doctor_id: profile.id,
          diagnosis: diagnosis || null,
          notes: notes || null,
        })
        .select()
        .single();

      if (rxError) throw rxError;

      if (medicines.length > 0) {
        const { error: medError } = await supabase
          .from("prescription_medicines")
          .insert(
            medicines.map((m, i) => ({
              prescription_id: rx.id,
              medicine_name: m.name,
              dose: m.dose || null,
              frequency: m.freq,
              duration_days: m.days,
              display_order: i,
            }))
          );

        if (medError) throw medError;
      }

      await supabase
        .from("tokens")
        .update({
          status: "done",
          completed_at: new Date().toISOString(),
        })
        .eq("id", tokenId);

      if (medicines.length > 0) {
        const startDate = new Date().toISOString().split("T")[0];

        const reminders = medicines.map((m) => {
          const end = new Date();
          end.setDate(end.getDate() + m.days);

          return {
            patient_id: patientId,
            medicine_name: m.name,
            dose: m.dose || null,
            reminder_times: freqToTimes(m.freq),
            start_date: startDate,
            end_date: end.toISOString().split("T")[0],
            is_active: true,
          };
        });

        await supabase.from("medicine_reminders").insert(reminders).then(() => {});
      }

      return rx;
    } finally {
      setSaving(false);
    }
  };

  const fetchDoctorPrescriptions = async (todayOnly = true) => {
    if (!profile?.id) return [];

    let query = supabase
      .from("prescriptions")
      .select(`
        id,
        diagnosis,
        notes,
        created_at,
        patient_id,
        profiles!prescriptions_patient_id_fkey (
          full_name,
          phone
        ),
        tokens (
          token_number,
          completed_at
        ),
        prescription_medicines (
          medicine_name,
          dose,
          frequency,
          duration_days,
          display_order
        )
      `)
      .eq("doctor_id", profile.id)
      .order("created_at", { ascending: false });

    if (todayOnly) {
      const today = new Date().toISOString().split("T")[0];
      query = query.gte("created_at", `${today}T00:00:00`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return ((data ?? []) as unknown as PrescriptionRow[]).map((rx) => ({
      ...rx,
      prescription_medicines: (rx.prescription_medicines ?? []).sort(
        (a, b) => a.display_order - b.display_order
      ),
    }));
  };

  return {
    savePrescription,
    fetchDoctorPrescriptions,
    saving,
  };
}

function freqToTimes(freq: string): string[] {
  const map: Record<string, string[]> = {
    "Once daily": ["09:00"],
    "Twice daily": ["09:00", "21:00"],
    "Thrice daily": ["08:00", "14:00", "20:00"],
    "At night": ["21:00"],
    "SOS/As needed": [],
  };

  return map[freq] ?? ["09:00"];
}