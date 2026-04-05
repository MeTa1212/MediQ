import { Patient, STATUS_META } from "@/data/mockData";
import { StatCard } from "@/components/StatCard";
import { BadgeChip } from "@/components/BadgeChip";
import { ArrowRight, Users, Clock, CheckCircle, CalendarCheck, TrendingUp, Calendar, FileText, Download } from "lucide-react";
import { WEEKLY_DATA, APPOINTMENTS } from "@/data/mockData";

interface OverviewTabProps {
  patients: Patient[];
  waiting: Patient[];
  serving: Patient | undefined;
  done: Patient[];
  callNext: () => string | null;
  onPrescribe: (p: Patient) => void;
}

export function OverviewTab({ patients, waiting, serving, done, callNext, onPrescribe }: OverviewTabProps) {
  const maxWK = Math.max(...WEEKLY_DATA.map(d => d.value));
  const withRx = done.filter(p => p.medicines.length > 0);

  return (
    <div className="animate-fade-up space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="font-extrabold text-foreground text-2xl">Good Morning, Dr. Sharma 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">Here's your clinic overview for today</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<Users className="w-5 h-5" />} label="Patients Today" value={patients.length} variant="primary" />
        <StatCard icon={<CalendarCheck className="w-5 h-5" />} label="Appointments Booked" value={APPOINTMENTS.length} variant="primary" />
        <StatCard icon={<Clock className="w-5 h-5" />} label="Waiting in Queue" value={waiting.length} variant="warning" />
        <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Completed" value={done.length} variant="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Now Serving + Live Queue */}
        <div className="space-y-4">
          <div className="bg-card rounded-2xl border border-border shadow-card p-5">
            <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse-soft" /> Now Serving
            </h3>
            {serving ? (
              <div className="gradient-violet rounded-xl p-4 text-violet-foreground">
                <div className="font-extrabold text-lg">{serving.token} · {serving.name}</div>
                <div className="text-sm opacity-80 mt-1 line-clamp-1">{serving.symptoms}</div>
                <button onClick={() => onPrescribe(serving)} className="mt-3 bg-card text-violet font-semibold text-xs px-4 py-2 rounded-lg hover:bg-secondary transition-colors">
                  Write Rx
                </button>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <div className="text-3xl mb-2">🪑</div>
                <div className="text-sm">No one currently</div>
                <button onClick={callNext} className="mt-3 flex items-center gap-2 mx-auto px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold">
                  Call Next <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Live Queue */}
          <div className="bg-card rounded-2xl border border-border shadow-card p-5">
            <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-warning" /> Live Queue
            </h3>
            <div className="space-y-2">
              {waiting.slice(0, 5).map((p, i) => (
                <div key={p.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-secondary/50 border border-border/30">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">{p.token}</span>
                    <div>
                      <span className="font-semibold text-foreground text-sm">{p.name}</span>
                      <div className="text-muted-foreground text-[11px] mt-0.5">~{p.waitMins} min wait</div>
                    </div>
                  </div>
                  <BadgeChip className={STATUS_META[p.status].badgeClass}>
                    {STATUS_META[p.status].label}
                  </BadgeChip>
                </div>
              ))}
              {waiting.length === 0 && <div className="text-center py-4 text-muted-foreground text-sm">Queue is empty</div>}
              {waiting.length > 5 && <div className="text-center text-primary text-xs font-semibold pt-1">+{waiting.length - 5} more patients</div>}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Mini Chart */}
          <div className="bg-card rounded-2xl border border-border shadow-card p-5">
            <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Weekly Trend
            </h3>
            <div className="flex items-end gap-2 h-28">
              {WEEKLY_DATA.map(d => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-semibold text-muted-foreground">{d.value}</span>
                  <div className="w-full rounded-t-md transition-all duration-700 gradient-primary" style={{ height: `${(d.value / maxWK) * 80}px` }} />
                  <span className="text-[10px] text-muted-foreground">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Appointments */}
          <div className="bg-card rounded-2xl border border-border shadow-card p-5">
            <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> Today's Appointments
            </h3>
            <div className="space-y-1.5">
              {APPOINTMENTS.filter(a => a.status !== "cancelled").slice(0, 5).map(apt => {
                const sc: Record<string, string> = {
                  confirmed: "bg-success/10 text-success border border-success/20",
                  pending: "bg-warning/10 text-warning border border-warning/20",
                };
                return (
                  <div key={apt.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-primary font-bold text-xs w-16">{apt.time}</span>
                      <div>
                        <span className="font-semibold text-foreground text-sm">{apt.patientName}</span>
                        <span className="text-muted-foreground text-xs ml-2">· {apt.type}</span>
                      </div>
                    </div>
                    <BadgeChip className={sc[apt.status] || ""}>
                      {apt.status}
                    </BadgeChip>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Prescriptions */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-5">
        <h3 className="font-bold text-foreground text-sm mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" /> Recent Prescriptions
        </h3>
        {withRx.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">No prescriptions written yet today</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Patient</th>
                  <th className="text-left pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Medicines</th>
                  <th className="text-left pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="text-right pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {withRx.map(p => (
                  <tr key={p.id} className="border-b border-border/30 last:border-0">
                    <td className="py-3">
                      <div className="font-semibold text-foreground text-sm">{p.name}</div>
                      <div className="text-muted-foreground text-xs">{p.diagnosis}</div>
                    </td>
                    <td className="py-3">
                      <div className="text-foreground/80 text-xs">{p.medicines.map(m => m.name).join(", ")}</div>
                    </td>
                    <td className="py-3 text-muted-foreground text-xs">{p.consultAt || "Today"}</td>
                    <td className="py-3 text-right">
                      <button className="text-primary text-xs font-semibold hover:text-primary/80 flex items-center gap-1 ml-auto">
                        <Download className="w-3 h-3" /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
