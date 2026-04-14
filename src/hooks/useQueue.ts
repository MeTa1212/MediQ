import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export type QueuePatient = {
  id: string;
  token_number: string;
  status: "waiting" | "serving" | "done" | "cancelled" | "no_show";
  priority: "critical" | "normal" | "low";
  symptom_tags: string[];
  custom_symptoms: string | null;
  estimated_wait_minutes: number | null;
  created_at: string;
  called_at: string | null;
  completed_at: string | null;
  patient_id: string;
  patient_name: string;
  patient_phone: string | null;
  patient_age: number | null;
};

type ToastState = {
  msg: string;
  type: string;
} | null;

type UseQueueReturn = {
  queue: QueuePatient[];
  waiting: QueuePatient[];
  serving: QueuePatient | null;
  done: QueuePatient[];
  sortedWait: QueuePatient[];
  loading: boolean;
  error: string | null;
  toast: ToastState;
  notify: (msg: string, type?: string) => void;
  callNext: () => Promise<void>;
  changePriority: (
    id: string,
    priority: QueuePatient["priority"]
  ) => Promise<void>;
  skipPatient: (id: string) => Promise<void>;
  completePatient: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
};

export function useQueue(): UseQueueReturn {
  const { profile } = useAuth();

  const [queue, setQueue] = useState<QueuePatient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const today = new Date().toISOString().split("T")[0];

  const notify = (msg: string, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchQueue = useCallback(async () => {
    if (!profile?.id) {
      setQueue([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("tokens")
      .select(`
        id,
        token_number,
        status,
        priority,
        symptom_tags,
        custom_symptoms,
        estimated_wait_minutes,
        created_at,
        called_at,
        completed_at,
        patient_id,
        profiles!tokens_patient_id_fkey (
          full_name,
          phone,
          patient_profiles (
            age
          )
        )
      `)
      .eq("doctor_id", profile.id)
      .eq("clinic_date", today)
      .order("created_at", { ascending: true });

    if (error) {
      setError(error.message);
      setQueue([]);
      setLoading(false);
      return;
    }

    const mapped: QueuePatient[] = (data || []).map((row: any) => ({
      id: row.id,
      token_number: row.token_number,
      status: row.status as QueuePatient["status"],
      priority: row.priority as QueuePatient["priority"],
      symptom_tags: Array.isArray(row.symptom_tags) ? row.symptom_tags : [],
      custom_symptoms: row.custom_symptoms ?? null,
      estimated_wait_minutes: row.estimated_wait_minutes ?? null,
      created_at: row.created_at,
      called_at: row.called_at ?? null,
      completed_at: row.completed_at ?? null,
      patient_id: row.patient_id,
      patient_name: row.profiles?.full_name ?? "Unknown",
      patient_phone: row.profiles?.phone ?? null,
      patient_age: row.profiles?.patient_profiles?.age ?? null,
    }));

    setQueue(mapped);
    setLoading(false);
  }, [profile?.id, today]);

  useEffect(() => {
    if (!profile?.id) return;

    fetchQueue();

    const channel = supabase
      .channel(`queue-doctor-${profile.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tokens",
          filter: `doctor_id=eq.${profile.id}`,
        },
        () => {
          fetchQueue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, fetchQueue]);

  const waiting = queue.filter((p) => p.status === "waiting");
  const serving = queue.find((p) => p.status === "serving") ?? null;
  const done = queue.filter((p) => p.status === "done");

  const priorityOrder: Record<QueuePatient["priority"], number> = {
    critical: 0,
    normal: 1,
    low: 2,
  };

  const sortedWait = [...waiting].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  const callNext = async () => {
    const next = sortedWait[0];

    if (!next) {
      notify("Queue is empty!", "warn");
      return;
    }

    if (serving) {
      const { error: servingError } = await supabase
        .from("tokens")
        .update({
          status: "done",
          completed_at: new Date().toISOString(),
        })
        .eq("id", serving.id);

      if (servingError) {
        notify(servingError.message, "error");
        return;
      }
    }

    const { error: nextError } = await supabase
      .from("tokens")
      .update({
        status: "serving",
        called_at: new Date().toISOString(),
      })
      .eq("id", next.id);

    if (nextError) {
      notify(nextError.message, "error");
      return;
    }

    notify(`Calling ${next.token_number} — ${next.patient_name}`);
    await fetchQueue();
  };

  const changePriority = async (
    id: string,
    priority: QueuePatient["priority"]
  ) => {
    const { error } = await supabase
      .from("tokens")
      .update({ priority })
      .eq("id", id);

    if (error) {
      notify(error.message, "error");
      return;
    }

    notify("Priority updated");
    await fetchQueue();
  };

  const skipPatient = async (id: string) => {
    const patient = queue.find((x) => x.id === id);
    if (!patient) return;

    const newWait = (patient.estimated_wait_minutes ?? 0) + 15;

    const { error } = await supabase
      .from("tokens")
      .update({ estimated_wait_minutes: newWait })
      .eq("id", id);

    if (error) {
      notify(error.message, "error");
      return;
    }

    notify("Patient moved later in queue");
    await fetchQueue();
  };

  const completePatient = async (id: string) => {
    const { error } = await supabase
      .from("tokens")
      .update({
        status: "done",
        completed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      notify(error.message, "error");
      return;
    }

    notify("Patient marked as complete");
    await fetchQueue();
  };

  return {
    queue,
    waiting,
    serving,
    done,
    sortedWait,
    loading,
    error,
    toast,
    notify,
    callNext,
    changePriority,
    skipPatient,
    completePatient,
    refetch: fetchQueue,
  };
}