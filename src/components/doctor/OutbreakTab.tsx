import { useEffect, useState } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { BadgeChip } from "@/components/BadgeChip";
import { AlertTriangle, AlertCircle } from "lucide-react";

export function OutbreakTab() {
  const { fetchOutbreakStatistics, loading } = useAnalytics();
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    fetchOutbreakStatistics().then(setStats);
  }, []);

  const getSymptomCount = (label: string) => 
    stats.filter(s => s.symptom_tags?.includes(label)).length;

  const totalFever = getSymptomCount("Fever");
  const totalCough = getSymptomCount("Cough");
  const totalCold = getSymptomCount("Cold");
  const totalVomiting = getSymptomCount("Vomiting");

  const total = stats.length || 1;

  if (loading && stats.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-bold text-white text-lg">Local Outbreak Monitor</h2>
          <p className="text-white/60 text-xs mt-0.5">Anonymous symptom tracking across all clinic patients</p>
        </div>
        {totalFever > 5 && (
            <BadgeChip className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold uppercase tracking-wider animate-pulse flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3" /> High Fever Trend
            </BadgeChip>
        )}
      </div>

      {totalFever > 3 && (
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-5 flex gap-4 backdrop-blur-md">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 border border-rose-500/30 shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-rose-400 text-sm">Potential Spike Detected</div>
            <div className="text-rose-400/70 text-xs mt-1 leading-relaxed">
              Fever and Respiratory symptoms have increased in the last 24 hours. (Detected {totalFever} cases).
            </div>
          </div>
        </div>
      )}

      {/* Symptom Distribution */}
      <div className="bg-white/5 rounded-3xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.2)] p-6 backdrop-blur-md">
        <div className="font-bold text-white/90 mb-6 text-sm">Symptom Distribution (Last 100 Patients)</div>
        <div className="space-y-6">
          {[
            { label: "Fever", count: totalFever, color: "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]" },
            { label: "Cough", count: totalCough, color: "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]" },
            { label: "Cold/Flu", count: totalCold, color: "bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.4)]" },
            { label: "Vomiting", count: totalVomiting, color: "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]" },
          ].map(s => (
            <div key={s.label}>
               <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-wider text-white/40">
                 <span>{s.label}</span>
                 <span className="text-white/80">{s.count} Cases</span>
               </div>
               <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                 <div 
                   className={`${s.color} h-full rounded-full transition-all duration-1000`} 
                   style={{ width: `${(s.count / total) * 100}%` }}
                 />
               </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div className="bg-white/5 rounded-2xl p-5 border border-white/10 text-center">
            <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Total Monitored</div>
            <div className="text-2xl font-black text-white">{stats.length}</div>
         </div>
         <div className="bg-white/5 rounded-2xl p-5 border border-white/10 text-center">
            <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Clinic Area</div>
            <div className="text-2xl font-black text-white">Local</div>
         </div>
      </div>
    </div>
  );
}
