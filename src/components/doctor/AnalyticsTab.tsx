import { WEEKLY_DATA } from "@/data/mockData";

export function AnalyticsTab() {
  const maxWK = Math.max(...WEEKLY_DATA.map(d => d.value));

  return (
    <div className="animate-fade-up space-y-5">
      <h2 className="font-bold text-foreground text-lg">Clinic Analytics</h2>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Avg Patients/Day", val: "24", icon: "👥" },
          { label: "Peak Hours", val: "10–12 AM", icon: "⏰" },
          { label: "Avg Consult", val: "8 min", icon: "⏱" },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-2xl border border-border shadow-card p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="font-extrabold text-primary text-lg">{s.val}</div>
            <div className="text-muted-foreground text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-5">
        <div className="font-semibold text-foreground/80 text-sm mb-4">Daily Patients — This Week</div>
        <div className="flex items-end gap-2 h-36">
          {WEEKLY_DATA.map(d => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground">{d.value}</span>
              <div className="w-full rounded-t-lg transition-all duration-700 gradient-primary" style={{ height: `${(d.value / maxWK) * 100}px` }} />
              <span className="text-xs text-muted-foreground">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Conditions */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-5">
        <div className="font-semibold text-foreground/80 text-sm mb-4">Common Conditions Today</div>
        <div className="space-y-3">
          {[
            { name: "Fever / Viral", count: 14, max: 14, colorClass: "bg-destructive" },
            { name: "Respiratory", count: 8, max: 14, colorClass: "bg-warning" },
            { name: "Diabetes / BP", count: 6, max: 14, colorClass: "bg-primary" },
            { name: "Skin Issues", count: 4, max: 14, colorClass: "bg-success" },
          ].map(c => (
            <div key={c.name}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-foreground/70 font-medium">{c.name}</span>
                <span className="font-bold">{c.count} pts</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${c.colorClass}`} style={{ width: `${(c.count / c.max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
