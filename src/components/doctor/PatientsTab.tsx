import { Patient, PRIORITY_META, STATUS_META } from "@/data/mockData";
import { BadgeChip } from "@/components/BadgeChip";
import { Search, Phone, User } from "lucide-react";
import { useState } from "react";

interface PatientsTabProps {
  patients: Patient[];
}

export function PatientsTab({ patients }: PatientsTabProps) {
  const [search, setSearch] = useState("");

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.token.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  );

  return (
    <div className="animate-fade-up space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-extrabold text-foreground text-2xl">Patient Records</h1>
          <p className="text-muted-foreground text-sm mt-1">{patients.length} patients registered today</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search patients..."
            className="pl-9 pr-4 py-2.5 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Patient</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Token</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Age</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Symptoms</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priority</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const pm = PRIORITY_META[p.priority];
                return (
                  <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-semibold text-foreground text-sm">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-sm text-foreground">{p.token}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{p.age}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Phone className="w-3 h-3" /> {p.phone}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground text-xs max-w-[200px] line-clamp-1">{p.symptoms}</td>
                    <td className="px-5 py-4">
                      <BadgeChip className={STATUS_META[p.status].badgeClass}>
                        {STATUS_META[p.status].label}
                      </BadgeChip>
                    </td>
                    <td className="px-5 py-4">
                      <BadgeChip className={pm.badgeClass}>
                        <span className={`w-1.5 h-1.5 rounded-full ${pm.dotClass} mr-1.5 inline-block`} />{pm.label}
                      </BadgeChip>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-4xl mb-2">🔍</div>
            <div className="font-semibold">No patients found</div>
          </div>
        )}
      </div>
    </div>
  );
}
