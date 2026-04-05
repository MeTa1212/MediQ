import { OUTBREAK_DATA } from "@/data/mockData";
import { BadgeChip } from "@/components/BadgeChip";

export function OutbreakTab() {
  const maxOB = Math.max(...OUTBREAK_DATA.map(d => d.fever));

  return (
    <div className="animate-fade-up space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-bold text-foreground text-lg">Outbreak Monitor</h2>
          <p className="text-muted-foreground text-xs mt-0.5">Anonymous community symptom tracking</p>
        </div>
        <BadgeChip className="bg-destructive/10 text-destructive border border-destructive/20 text-xs">⚠ Fever +42%</BadgeChip>
      </div>

      {/* Alert */}
      <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4 flex gap-3">
        <span className="text-xl shrink-0">🚨</span>
        <div>
          <div className="font-bold text-destructive text-sm">Possible Viral Outbreak Detected</div>
          <div className="text-destructive/70 text-xs mt-1 leading-relaxed">Fever cases rose 42% this week. Cough cases also trending up. Consider alerting local health authorities.</div>
        </div>
      </div>

      {/* Stacked Bar Chart */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-5">
        <div className="font-semibold text-foreground/80 text-sm mb-4">Symptom Trend — Last 7 Days</div>
        <div className="flex items-end gap-2 h-40">
          {OUTBREAK_DATA.map(d => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col justify-end gap-px" style={{ height: "120px" }}>
                <div className="w-full bg-destructive/70 rounded-sm transition-all duration-600" style={{ height: `${(d.fever / maxOB) * 90}px` }} />
                <div className="w-full bg-warning/70 transition-all duration-600" style={{ height: `${(d.cough / maxOB) * 90}px` }} />
                <div className="w-full bg-success/70 rounded-sm transition-all duration-600" style={{ height: `${(d.other / maxOB) * 90}px` }} />
              </div>
              <span className="text-xs text-muted-foreground">{d.day}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-3">
          {[
            ["bg-destructive/70", "Fever"],
            ["bg-warning/70", "Cough"],
            ["bg-success/70", "Other"],
          ].map(([bg, lb]) => (
            <div key={lb} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className={`w-2.5 h-2.5 rounded-sm ${bg}`} />{lb}
            </div>
          ))}
        </div>
      </div>

      {/* Symptom Grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { sym: "Fever", count: 14, chg: "+42%", variant: "destructive" as const },
          { sym: "Cough", count: 8, chg: "+28%", variant: "warning" as const },
          { sym: "Vomiting", count: 4, chg: "+10%", variant: "success" as const },
          { sym: "Rash", count: 2, chg: "–5%", variant: "muted" as const },
        ].map(s => {
          const classes = {
            destructive: "bg-destructive/5 border-destructive/20 text-destructive",
            warning: "bg-warning/5 border-warning/20 text-warning",
            success: "bg-success/5 border-success/20 text-success",
            muted: "bg-secondary border-border text-muted-foreground",
          };
          return (
            <div key={s.sym} className={`rounded-2xl border p-4 ${classes[s.variant]}`}>
              <div className="text-foreground/60 text-xs font-medium mb-1">{s.sym}</div>
              <div className="font-extrabold text-2xl">{s.count}</div>
              <div className="text-xs font-semibold mt-0.5">{s.chg} this week</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
