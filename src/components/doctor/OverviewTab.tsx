import { useEffect, useState } from "react";
import { QueuePatient } from "@/hooks/useQueue";
import { useAnalytics } from "@/hooks/useAnalytics";
import { StatCard } from "@/components/StatCard";
import { BadgeChip } from "@/components/BadgeChip";
import { ArrowRight, Users, Clock, CheckCircle, CalendarCheck, TrendingUp, Calendar, FileText, Download } from "lucide-react";
interface OverviewTabProps {
  patients: QueuePatient[];
  waiting: QueuePatient[];
  serving: QueuePatient | undefined;
  done: QueuePatient[];
  callNext: () => Promise<void>;
  onPrescribe: (p: QueuePatient) => void;
  doctorName?: string;
}

export function OverviewTab({ patients, waiting, serving, done, callNext, onPrescribe, doctorName }: OverviewTabProps) {
  const { fetchDailyCounts } = useAnalytics();
  const [dailyData, setDailyData] = useState<any[]>([]);

  useEffect(() => {
    fetchDailyCounts().then(setDailyData);
  }, []);

  const maxWK = Math.max(...dailyData.map(d => d.value), 5);
  const recentPatients = done.slice(0, 5);

  // Local STATUS_META for queue badges (temporary fix)
  const STATUS_META = {
    waiting: "bg-slate-500/10 text-slate-300 border border-slate-500/20",
  } as Record<string, string>;

  // Local appointment status classes
  const appointmentStatusClasses: Record<string, string> = {
    confirmed: "bg-success/10 text-success border border-success/20",
    pending: "bg-warning/10 text-warning border border-warning/20",
  };

  return (
    <div className="animate-fade-up space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="font-extrabold text-white text-2xl">Good Morning, {doctorName?.split(' ')[0] || 'Doctor'}</h1>
        <p className="text-white/60 text-sm mt-1">Here's your clinic overview for today</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<Users className="w-5 h-5" />} label="Patients Today" value={patients.length} variant="primary" />
        <StatCard icon={<CalendarCheck className="w-5 h-5" />} label="Appointments Booked" value={patients.length} variant="primary" />
        <StatCard icon={<Clock className="w-5 h-5" />} label="Waiting in Queue" value={waiting.length} variant="warning" />
        <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Completed" value={done.length} variant="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Now Serving + Live Queue */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_16px_40px_rgba(0,0,0,0.2)] p-6">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <h3 className="font-bold text-zinc-100 text-sm mb-4 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse-soft shadow-[0_0_12px_rgba(52,211,153,0.8)]" /> Now Serving
            </h3>
            {serving ? (
              <div className="gradient-violet rounded-xl p-4 text-violet-foreground">
                <div className="font-extrabold text-lg">{serving.token_number} · {serving.patient_name}</div>
                <div className="text-sm opacity-80 mt-1 line-clamp-1">
                  {serving.symptom_tags?.join(", ") || serving.custom_symptoms || "No symptoms"}
                </div>
                <button onClick={() => onPrescribe(serving)} className="mt-3 bg-card text-violet font-semibold text-xs px-4 py-2 rounded-lg hover:bg-secondary transition-colors">
                  Write Rx
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-white/40 border-2 border-dashed border-white/5 rounded-2xl">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                    <Users className="w-6 h-6 opacity-20" />
                  </div>
                </div>
                <div className="text-sm font-medium">No one currently in service</div>
                <button onClick={callNext} className="mt-4 flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl gradient-primary text-primary-foreground text-xs font-bold transition-all hover:scale-[1.02] shadow-lg shadow-primary/20">
                  Call Next Patient <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Live Queue */}
          <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_16px_40px_rgba(0,0,0,0.2)] p-6">
            <h3 className="font-bold text-zinc-100 text-sm mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" /> Live Queue
            </h3>
            <div className="space-y-2">
              {waiting.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-secondary/50 border border-border/30">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">
                      {p.token_number}
                    </span>
                    <div>
                      <span className="font-semibold text-foreground text-sm">{p.patient_name}</span>
                      <div className="text-muted-foreground text-[11px] mt-0.5">
                        ~{(p.estimated_wait_minutes ?? 0)} min wait
                      </div>
                    </div>
                  </div>
                  <BadgeChip className={STATUS_META[p.status] || ""}>
                    {p.status}
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
              {dailyData.map(d => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-semibold text-muted-foreground">{d.value}</span>
                  <div className="w-full rounded-t-md transition-all duration-700 gradient-primary" style={{ height: `${(d.value / maxWK) * 80}px` }} />
                  <span className="text-[10px] text-muted-foreground">{new Date(d.day).toLocaleDateString("en-IN", { weekday: "short" })}</span>
                </div>
              ))}
              {dailyData.length === 0 && <div className="text-xs text-muted-foreground flex items-center justify-center h-full w-full">No data yet</div>}
            </div>
          </div>

          {/* Today's Appointments */}
          <div className="bg-card rounded-2xl border border-border shadow-card p-5">
            <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> Today's Appointments
            </h3>
            <div className="space-y-1.5">
              {patients.filter(a => a.status !== "cancelled").slice(0, 5).map(apt => (
                <div key={apt.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-primary font-bold text-xs w-16">{apt.token_number}</span>
                    <div>
                      <span className="font-semibold text-foreground text-sm">{apt.patient_name}</span>
                      <span className="text-muted-foreground text-xs ml-2 line-clamp-1 break-all">· {apt.symptom_tags?.join(", ") || "Consultation"}</span>
                    </div>
                  </div>
                  <BadgeChip className={appointmentStatusClasses[apt.status] || "bg-secondary"}>
                    {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                  </BadgeChip>
                </div>
              ))}
              {patients.length === 0 && <div className="text-xs text-muted-foreground text-center py-4">No appointments today</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Patients */}
      <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_16px_40px_rgba(0,0,0,0.2)] p-6">
        <h3 className="font-bold text-zinc-100 text-sm mb-5 flex items-center gap-2">
          <FileText className="w-4 h-4 text-sky-400" /> Recent Patients
        </h3>
        {recentPatients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">No patients completed yet today</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Patient</th>
                  <th className="text-left pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Token</th>
                  <th className="text-left pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completed</th>
                  <th className="text-right pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentPatients.map(p => (
                  <tr key={p.id} className="border-b border-border/30 last:border-0">
                    <td className="py-3">
                      <div className="font-semibold text-foreground text-sm">{p.patient_name}</div>
                      <div className="text-muted-foreground text-xs">
                        {p.symptom_tags?.join(", ") || p.custom_symptoms || "No symptoms"}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="font-mono text-sm">{p.token_number}</span>
                    </td>
                    <td className="py-3 text-muted-foreground text-xs">
                      {p.completed_at ? new Date(p.completed_at).toLocaleTimeString('en-IN', {
                        hour: '2-digit', minute: '2-digit'
                      }) : "Today"}
                    </td>
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