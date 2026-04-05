import { useState } from "react";
import { Patient, PATIENTS_INIT } from "@/data/mockData";

interface PatientContextType {
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  waiting: Patient[];
  serving: Patient | undefined;
  done: Patient[];
  sortedWait: Patient[];
  callNext: () => string | null;
  toast: { msg: string; type: string } | null;
  notify: (msg: string, type?: string) => void;
}

export function usePatientState(): PatientContextType {
  const [patients, setPatients] = useState<Patient[]>(PATIENTS_INIT);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const notify = (msg: string, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const waiting = patients.filter(p => p.status === "waiting");
  const serving = patients.find(p => p.status === "serving");
  const done = patients.filter(p => p.status === "done");

  const priorityOrder = { critical: 0, normal: 1, low: 2 };
  const sortedWait = [...waiting].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const callNext = (): string | null => {
    const nxt = sortedWait[0];
    if (!nxt) {
      notify("Queue is empty!", "warn");
      return null;
    }
    setPatients(prev => prev.map(p => {
      if (p.status === "serving") return { ...p, status: "done" as const, consultAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
      if (p.id === nxt.id) return { ...p, status: "serving" as const };
      return p;
    }));
    notify(`📢 Calling ${nxt.token} — ${nxt.name}`);
    return nxt.token;
  };

  return { patients, setPatients, waiting, serving, done, sortedWait, callNext, toast, notify };
}
