import { APPOINTMENTS } from "@/data/mockData";
import { BadgeChip } from "@/components/BadgeChip";
import { Calendar, Clock } from "lucide-react";

export function AppointmentsTab() {
  const statusClass = {
    confirmed: "bg-success/10 text-success border border-success/20",
    pending: "bg-warning/10 text-warning border border-warning/20",
    cancelled: "bg-destructive/10 text-destructive border border-destructive/20",
  };

  return (
    <div className="animate-fade-up space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-foreground text-lg">Appointments</h2>
          <p className="text-muted-foreground text-xs mt-0.5">Today · {APPOINTMENTS.length} scheduled</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg">
          <Calendar className="w-3.5 h-3.5" />
          {new Date().toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}
        </div>
      </div>

      <div className="space-y-2.5">
        {APPOINTMENTS.map(apt => (
          <div key={apt.id} className="bg-card rounded-2xl border border-border shadow-card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-foreground text-sm">{apt.patientName}</span>
                <span className="text-muted-foreground text-xs">· {apt.time}</span>
              </div>
              <div className="text-muted-foreground text-xs mt-0.5">{apt.type}</div>
            </div>
            <BadgeChip className={statusClass[apt.status as keyof typeof statusClass]}>
              {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
            </BadgeChip>
          </div>
        ))}
      </div>
    </div>
  );
}
