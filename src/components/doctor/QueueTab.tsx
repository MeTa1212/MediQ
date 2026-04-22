import { useState } from "react";
import { Play, SkipForward, CheckCircle2, FileText, History } from "lucide-react";
import type { QueuePatient } from "@/hooks/useQueue";
import { PatientHistoryPanel } from "@/components/doctor/PatientHistoryPanel";
const PRIORITYMETA: Record<"critical" | "normal" | "low", string> = {
  critical: "bg-red-500/10 text-red-400 border border-red-500/20",
  normal: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  low: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
};

const STATUSMETA: Record<string, string> = {
  waiting: "bg-slate-500/10 text-slate-300 border border-slate-500/20",
  serving: "bg-sky-500/10 text-sky-300 border border-sky-500/20",
  done: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
  cancelled: "bg-rose-500/10 text-rose-300 border border-rose-500/20",
  no_show: "bg-zinc-500/10 text-zinc-300 border border-zinc-500/20",
};
import { BadgeChip } from "@/components/BadgeChip";

interface QueueTabProps {
  patients: QueuePatient[];
  waiting: QueuePatient[];
  serving?: QueuePatient;
  done: QueuePatient[];
  sortedWait: QueuePatient[];
  callNext: () => Promise<void>;
  onPrescribe: (p: QueuePatient) => void;
  onChangePriority: (
    id: string,
    priority: "critical" | "normal" | "low"
  ) => Promise<void>;
  onSkip: (id: string) => Promise<void>;
  onComplete: (id: string) => Promise<void>;
}

export function QueueTab({
  waiting,
  serving,
  done,
  sortedWait,
  callNext,
  onPrescribe,
  onChangePriority,
  onSkip,
  onComplete,
}: QueueTabProps) {
  const [historyPatient, setHistoryPatient] = useState<{ id: string; name: string; tokenId?: string } | null>(null);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Queue Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage live patient flow for today
          </p>
        </div>

        <button
          onClick={callNext}
          className="inline-flex items-center gap-2 rounded-xl gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:scale-[1.02]"
        >
          <Play className="h-4 w-4" />
          Call Next
        </button>
      </div>

      {serving && (
        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-5 shadow-card">
          <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
            Now Serving
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-lg font-bold text-foreground">
                {serving.token_number} · {serving.patient_name}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {serving.symptom_tags.length > 0
                  ? serving.symptom_tags.join(", ")
                  : serving.custom_symptoms || "No symptoms"}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onPrescribe(serving)}
                className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-background px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
              >
                <FileText className="h-4 w-4" />
                Prescribe
              </button>

              <button
                onClick={() => setHistoryPatient({ id: serving.patient_id, name: serving.patient_name, tokenId: serving.id })}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/15"
              >
                <History className="h-4 w-4" />
                History
              </button>

              <button
                onClick={() => onComplete(serving.id)}
                className="inline-flex items-center gap-2 rounded-xl border border-success/20 bg-success/10 px-4 py-2 text-sm font-medium text-success transition-colors hover:bg-success/15"
              >
                <CheckCircle2 className="h-4 w-4" />
                Complete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_16px_40px_rgba(0,0,0,0.2)] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Waiting Queue</h3>
            <span className="text-xs text-muted-foreground">
              {waiting.length} patients
            </span>
          </div>

          <div className="space-y-3">
            {sortedWait.length === 0 ? (
              <div className="rounded-xl bg-secondary px-4 py-8 text-center text-sm text-muted-foreground">
                No patients waiting.
              </div>
            ) : (
              sortedWait.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-border bg-background p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-foreground">
                        {p.token_number} · {p.patient_name}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {p.symptom_tags.length > 0
                          ? p.symptom_tags.join(", ")
                          : p.custom_symptoms || "No symptoms"}
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Wait: {p.estimated_wait_minutes ?? 0} mins
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <BadgeChip className={PRIORITYMETA[p.priority]}>
                        {p.priority}
                      </BadgeChip>
                      <BadgeChip className={STATUSMETA[p.status]}>
                        {p.status}
                      </BadgeChip>
                    </div>
                  </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <select
                        value={p.priority}
                        onChange={(e) =>
                          onChangePriority(
                            p.id,
                            e.target.value as "critical" | "normal" | "low"
                          )
                        }
                        className="rounded-lg border border-border bg-secondary px-3 py-2 text-xs text-foreground outline-none"
                      >
                        <option value="critical">Critical</option>
                        <option value="normal">Normal</option>
                        <option value="low">Low</option>
                      </select>

                      <button
                        onClick={() => setHistoryPatient({ id: p.patient_id, name: p.patient_name, tokenId: p.id })}
                        className="inline-flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-500/15"
                      >
                        <History className="h-3.5 w-3.5" />
                        History
                      </button>

                      <button
                        onClick={() => onSkip(p.id)}
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary/80"
                      >
                        <SkipForward className="h-3.5 w-3.5" />
                        Skip
                      </button>
                    </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_16px_40px_rgba(0,0,0,0.2)] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Completed</h3>
            <span className="text-xs text-muted-foreground">
              {done.length} patients
            </span>
          </div>

          <div className="space-y-3">
            {done.length === 0 ? (
              <div className="rounded-xl bg-secondary px-4 py-8 text-center text-sm text-muted-foreground">
                No completed consultations yet.
              </div>
            ) : (
              done.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-border bg-background p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-foreground">
                        {p.token_number} · {p.patient_name}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {p.completed_at
                          ? new Date(p.completed_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Completed"}
                      </div>
                    </div>

                    <BadgeChip className={STATUSMETA[p.status]}>
                      {p.status}
                    </BadgeChip>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {historyPatient && (
        <PatientHistoryPanel
          patientId={historyPatient.id}
          patientName={historyPatient.name}
          tokenId={historyPatient.tokenId}
          onClose={() => setHistoryPatient(null)}
        />
      )}
    </div>
  );
}