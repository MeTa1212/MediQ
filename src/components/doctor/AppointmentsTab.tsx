import { QueuePatient } from "@/hooks/useQueue";
import { BadgeChip } from "@/components/BadgeChip";
import { Calendar, Clock } from "lucide-react";

interface AppointmentsTabProps {
  patients: QueuePatient[];
}

export function AppointmentsTab({ patients }: AppointmentsTabProps) {
  const statusClass = {
    done: "bg-success/10 text-success border border-success/20",
    waiting: "bg-warning/10 text-warning border border-warning/20",
    serving: "bg-primary/10 text-primary border border-primary/20",
    cancelled: "bg-destructive/10 text-destructive border border-destructive/20",
    no_show: "bg-destructive/10 text-destructive border border-destructive/20",
  };

  return (
    <div className="animate-fade-up space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-foreground text-lg">Appointments</h2>
          <p className="text-muted-foreground text-xs mt-0.5">Today · {patients.length} scheduled</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg">
          <Calendar className="w-3.5 h-3.5" />
          {new Date().toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}
        </div>
      </div>

      <div className="space-y-2.5">
        {patients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">No appointments scheduled for today</div>
        ) : (
          patients.map(p => (
            <div key={p.id} className="bg-card rounded-2xl border border-border shadow-card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-foreground text-sm">{p.patient_name}</span>
                  <span className="text-muted-foreground text-xs">· Token: {p.token_number}</span>
                </div>
                <div className="text-muted-foreground text-xs mt-0.5">
                  {p.symptom_tags?.join(", ") || p.custom_symptoms || "Consultation"}
                </div>
              </div>
              <BadgeChip className={statusClass[p.status as keyof typeof statusClass] || "bg-secondary"}>
                {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
              </BadgeChip>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
