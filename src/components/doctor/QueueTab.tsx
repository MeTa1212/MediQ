import { Patient, PRIORITY_META, STATUS_META } from "@/data/mockData";
import { StatCard } from "@/components/StatCard";
import { BadgeChip } from "@/components/BadgeChip";
import { ArrowRight, SkipForward, CheckCircle, Phone, Clock } from "lucide-react";

interface QueueTabProps {
  patients: Patient[];
  waiting: Patient[];
  serving: Patient | undefined;
  done: Patient[];
  sortedWait: Patient[];
  callNext: () => string | null;
  onPrescribe: (p: Patient) => void;
  onChangePriority: (id: number, priority: "critical" | "normal" | "low") => void;
  onSkip: (id: number) => void;
  onComplete: (id: number) => void;
}

export function QueueTab({ patients, waiting, done, serving, sortedWait, callNext, onPrescribe, onChangePriority, onSkip, onComplete }: QueueTabProps) {
  return (
    <div className="animate-fade-up space-y-5">
      <div>
        <h1 className="font-extrabold text-foreground text-2xl">Queue Management</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage patient flow and consultations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<span className="text-xl">👥</span>} label="Total Today" value={patients.length} variant="primary" />
        <StatCard icon={<span className="text-xl">⏳</span>} label="Waiting" value={waiting.length} variant="warning" />
        <StatCard icon={<span className="text-xl">✅</span>} label="Completed" value={done.length} variant="success" />
        <StatCard icon={<span className="text-xl">🚨</span>} label="Critical" value={patients.filter(p => p.priority === "critical").length} variant="destructive" />
      </div>

      {/* Now Serving Banner */}
      <div className="rounded-2xl overflow-hidden shadow-lg">
        <div className="gradient-violet p-5 text-violet-foreground">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest mb-1 opacity-70">🔔 Now Serving</div>
              {serving ? (
                <>
                  <div className="font-extrabold text-2xl">{serving.token}</div>
                  <div className="font-semibold text-base mt-0.5">{serving.name}</div>
                  <div className="text-sm mt-1 opacity-70 line-clamp-1">{serving.symptoms}</div>
                </>
              ) : (
                <div className="font-semibold text-lg opacity-80">No patient currently being served</div>
              )}
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              {serving && (
                <button onClick={() => onPrescribe(serving)} className="bg-card text-violet font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-secondary transition-colors whitespace-nowrap shadow-sm">
                  Write Rx
                </button>
              )}
              <button onClick={callNext} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card/20 backdrop-blur text-violet-foreground font-semibold text-sm hover:bg-card/30 transition-colors whitespace-nowrap">
                <Phone className="w-3.5 h-3.5" /> Call Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Queue Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-foreground text-lg">Patient Queue</h2>
          <p className="text-muted-foreground text-xs mt-0.5">Sorted by priority · {sortedWait.length} patients waiting</p>
        </div>
        <button onClick={callNext} className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm shadow-md hover:shadow-lg hover:scale-105 transition-all">
          Call Next <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Queue Table */}
      <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">#</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Token</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Patient Name</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priority</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Est. Wait</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedWait.map((p, i) => {
                const pm = PRIORITY_META[p.priority];
                return (
                  <tr key={p.id} className={`border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors animate-slide-in ${i === 0 ? "bg-primary/5" : ""}`}>
                    <td className="px-5 py-4 font-bold text-muted-foreground/50 text-lg">{i + 1}</td>
                    <td className="px-5 py-4 font-mono font-semibold text-foreground text-sm">{p.token}</td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-foreground text-sm">{p.name}</div>
                      <div className="text-muted-foreground text-xs mt-0.5 line-clamp-1 max-w-[200px]">{p.symptoms}</div>
                    </td>
                    <td className="px-5 py-4">
                      <BadgeChip className={STATUS_META[p.status].badgeClass}>
                        {STATUS_META[p.status].label}
                      </BadgeChip>
                    </td>
                    <td className="px-5 py-4">
                      <select value={p.priority} onChange={e => onChangePriority(p.id, e.target.value as "critical" | "normal" | "low")}
                        className="text-xs border border-border rounded-lg px-2 py-1.5 bg-secondary text-foreground font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20">
                        <option value="critical">Critical</option>
                        <option value="normal">Normal</option>
                        <option value="low">Low</option>
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                        <Clock className="w-3 h-3" /> ~{p.waitMins} min
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 justify-end">
                        <button onClick={callNext} title="Call Next" className="px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold hover:shadow-md transition-all">
                          Call
                        </button>
                        <button onClick={() => onSkip(p.id)} title="Skip" className="px-3 py-1.5 rounded-lg bg-warning/10 text-warning border border-warning/20 text-xs font-semibold hover:bg-warning/20 transition-colors">
                          <SkipForward className="w-3 h-3" />
                        </button>
                        <button onClick={() => onComplete(p.id)} title="Complete" className="px-3 py-1.5 rounded-lg bg-success/10 text-success border border-success/20 text-xs font-semibold hover:bg-success/20 transition-colors">
                          <CheckCircle className="w-3 h-3" />
                        </button>
                        <button onClick={() => onPrescribe(p)} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-semibold hover:bg-primary/20 transition-colors">
                          Rx
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {sortedWait.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-5xl mb-3">✓</div>
            <div className="font-semibold">Queue is empty</div>
            <div className="text-sm mt-1">All patients have been seen</div>
          </div>
        )}
      </div>
    </div>
  );
}
