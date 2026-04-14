import { useEffect, useState } from "react";
import { usePrescriptions } from "@/hooks/usePrescriptions";
import { BadgeChip } from "@/components/BadgeChip";
import { Download, Search, FileText } from "lucide-react";

export function PrescriptionsTab() {
  const { fetchDoctorPrescriptions } = usePrescriptions();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctorPrescriptions(true).then((data) => {
      setPrescriptions(data);
      setLoading(false);
    });
  }, []);

  const filtered = prescriptions.filter((rx) =>
    rx.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    rx.tokens?.token_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-up space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-extrabold text-foreground text-2xl">
            Recent Prescriptions
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {prescriptions.length} consultations completed today
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prescriptions..."
            className="pl-9 pr-4 py-2.5 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-secondary rounded-full mb-4"></div>
            <div className="h-4 w-32 bg-secondary rounded"></div>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground bg-white/5 rounded-2xl border border-white/10">
          <div className="flex justify-center mb-3 text-muted-foreground/20">
            <FileText className="w-12 h-12" />
          </div>
          <div className="font-semibold text-white/50 text-sm italic">No prescriptions found matching your search</div>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((rx) => (
            <div
              key={rx.id}
              className="bg-card rounded-2xl border border-border shadow-card p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-bold text-foreground">
                    {rx.profiles?.full_name || "Unknown Patient"}
                  </div>
                  <div className="text-muted-foreground text-xs mt-0.5">
                    {rx.tokens?.token_number} ·{" "}
                    {new Date(rx.created_at).toLocaleDateString("en-IN")} ·{" "}
                    {new Date(rx.created_at).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>

                  {rx.diagnosis && (
                    <div className="mt-1.5 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg inline-block">
                      Diagnosis: {rx.diagnosis}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 text-primary text-xs font-semibold bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">
                    <Download className="w-3 h-3" />
                    PDF
                  </button>
                  <BadgeChip className="bg-success/10 text-success border border-success/20">
                    Done
                  </BadgeChip>
                </div>
              </div>

              {rx.prescription_medicines && rx.prescription_medicines.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Medicines
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {rx.prescription_medicines.map((m: any, i: number) => (
                      <div
                        key={i}
                        className="bg-secondary rounded-xl px-4 py-3 border border-border/30"
                      >
                        <div className="font-semibold text-primary text-sm flex items-center gap-2">
                          <FileText className="w-3 h-3" /> {m.medicine_name}
                        </div>
                        <div className="text-muted-foreground text-[11px] mt-1">
                          {m.dose} · {m.frequency} · {m.duration_days} days
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {rx.notes && (
                <div className="mt-4 p-3 bg-secondary/50 rounded-xl border border-border/30">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Doctor's Notes
                  </div>
                  <p className="text-xs text-foreground/80 italic">{rx.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}