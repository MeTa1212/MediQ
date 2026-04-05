import { Patient, STATUS_META } from "@/data/mockData";
import { BadgeChip } from "@/components/BadgeChip";
import { Download, Search } from "lucide-react";
import { useState } from "react";

interface PrescriptionsTabProps {
  done: Patient[];
}

export function PrescriptionsTab({ done }: PrescriptionsTabProps) {
  const withRx = done.filter(p => p.medicines.length > 0);
  const [search, setSearch] = useState("");

  const filtered = withRx.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.token.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-up space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-extrabold text-foreground text-2xl">Prescriptions</h1>
          <p className="text-muted-foreground text-sm mt-1">{withRx.length} prescriptions written today</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search prescriptions..."
            className="pl-9 pr-4 py-2.5 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground w-56 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
          />
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground bg-card rounded-2xl border border-border">
          <div className="text-4xl mb-2">💊</div>
          <div className="font-semibold">No prescriptions found</div>
        </div>
      )}

      {filtered.map(p => (
        <div key={p.id} className="bg-card rounded-2xl border border-border shadow-card p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="font-bold text-foreground">{p.name}</div>
              <div className="text-muted-foreground text-xs mt-0.5">{p.token} · Age {p.age} · Seen at {p.consultAt}</div>
              {p.diagnosis && (
                <div className="mt-1.5 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg inline-block">
                  Dx: {p.diagnosis}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 text-primary text-xs font-semibold bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">
                <Download className="w-3 h-3" /> PDF
              </button>
              <BadgeChip className={STATUS_META.done.badgeClass}>Done</BadgeChip>
            </div>
          </div>
          <div className="bg-secondary rounded-xl p-3 space-y-2">
            {p.medicines.map((m, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
                <div className="font-semibold text-primary text-sm">{m.name}</div>
                <div className="text-muted-foreground text-xs">{m.dose} · {m.freq} · {m.days}d</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
