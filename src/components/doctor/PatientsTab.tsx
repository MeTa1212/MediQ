import { QueuePatient } from "@/hooks/useQueue";
import { BadgeChip } from "@/components/BadgeChip";
import { Search, Phone, User } from "lucide-react";
import { useState } from "react";

interface PatientsTabProps {
  patients: QueuePatient[];
}

const STATUS_META: Record<string, { label: string; badgeClass: string }> = {
  waiting: {
    label: "Waiting",
    badgeClass: "bg-slate-500/10 text-slate-300 border border-slate-500/20",
  },
  serving: {
    label: "Serving",
    badgeClass: "bg-primary/10 text-primary border border-primary/20",
  },
  done: {
    label: "Done",
    badgeClass: "bg-success/10 text-success border border-success/20",
  },
  cancelled: {
    label: "Cancelled",
    badgeClass: "bg-destructive/10 text-destructive border border-destructive/20",
  },
  no_show: {
    label: "No Show",
    badgeClass: "bg-warning/10 text-warning border border-warning/20",
  },
};

const PRIORITY_META: Record<string, { label: string; badgeClass: string; dotClass: string }> = {
  critical: {
    label: "Critical",
    badgeClass: "bg-destructive/10 text-destructive border border-destructive/20",
    dotClass: "bg-destructive",
  },
  normal: {
    label: "Normal",
    badgeClass: "bg-primary/10 text-primary border border-primary/20",
    dotClass: "bg-primary",
  },
  low: {
    label: "Low",
    badgeClass: "bg-slate-500/10 text-slate-300 border border-slate-500/20",
    dotClass: "bg-slate-400",
  },
};

export function PatientsTab({ patients }: PatientsTabProps) {
  const [search, setSearch] = useState("");

  const filtered = patients.filter((p) => {
    const name = p.patient_name?.toLowerCase() || "";
    const token = p.token_number?.toLowerCase() || "";
    const phone = p.patient_phone || "";

    return (
      name.includes(search.toLowerCase()) ||
      token.includes(search.toLowerCase()) ||
      phone.includes(search)
    );
  });

  return (
    <div className="animate-fade-up space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-extrabold text-foreground text-2xl">Patient Records</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {patients.length} patients registered today
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Patient
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Token
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Age
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Phone
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Symptoms
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Priority
                </th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((p) => {
                const pm = PRIORITY_META[p.priority];
                const sm = STATUS_META[p.status];

                return (
                  <tr
                    key={p.id}
                    className="border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-semibold text-foreground text-sm">
                          {p.patient_name}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-mono text-sm text-foreground">
                      {p.token_number}
                    </td>

                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {p.patient_age ?? "N/A"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        {p.patient_phone || "N/A"}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-muted-foreground text-xs max-w-[200px] line-clamp-1">
                      {p.symptom_tags?.length > 0
                        ? p.symptom_tags.join(", ")
                        : p.custom_symptoms || "No symptoms"}
                    </td>

                    <td className="px-5 py-4">
                      <BadgeChip className={sm.badgeClass}>{sm.label}</BadgeChip>
                    </td>

                    <td className="px-5 py-4">
                      <BadgeChip className={pm.badgeClass}>
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${pm.dotClass} mr-1.5 inline-block`}
                        />
                        {pm.label}
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
            <div className="flex justify-center mb-3 text-muted-foreground/20">
              <Search className="w-12 h-12" />
            </div>
            <div className="font-semibold text-white/50 text-sm italic">No patients found matching your search</div>
          </div>
        )}
      </div>
    </div>
  );
}