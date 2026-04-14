import { useEffect, useState } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Users, TrendingUp, Award, Lightbulb } from "lucide-react";

export function AnalyticsTab() {
  const { fetchDailyCounts, loading } = useAnalytics();
  const [dailyData, setDailyData] = useState<any[]>([]);

  useEffect(() => {
    fetchDailyCounts().then(setDailyData);
  }, []);

  const maxVal = Math.max(...dailyData.map(d => d.value), 5);

  return (
    <div className="animate-fade-up space-y-5">
      <h2 className="font-bold text-foreground text-lg">Clinic Performance</h2>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Today's Patients", val: dailyData[dailyData.length - 1]?.value || 0, icon: <Users className="w-5 h-5 text-blue-400" /> },
          { label: "Avg / Day", val: (dailyData.reduce((a, b) => a + b.value, 0) / (dailyData.length || 1)).toFixed(1), icon: <TrendingUp className="w-5 h-5 text-emerald-400" /> },
          { label: "Total Managed", val: dailyData.reduce((a, b) => a + b.value, 0), icon: <Award className="w-5 h-5 text-amber-400" /> },
        ].map(s => (
          <div key={s.label} className="bg-white/5 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-5 text-center transition-all hover:-translate-y-1 hover:bg-white/10">
            <div className="flex justify-center mb-3">{s.icon}</div>
            <div className="font-extrabold text-primary text-lg">{s.val}</div>
            <div className="text-muted-foreground text-[10px] uppercase font-bold tracking-tight mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-6">
        <div className="font-bold text-foreground mb-6 text-sm">Patient Volume Trend</div>
        
        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground text-xs uppercase tracking-widest">Loading stats...</div>
          </div>
        ) : dailyData.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-muted-foreground text-sm italic border border-dashed border-border rounded-xl">
             No patient data recorded yet
          </div>
        ) : (
          <div className="flex items-end gap-3 h-40 pt-4">
            {dailyData.map(d => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-[10px] font-bold px-2 py-0.5 rounded -mb-1">
                  {d.value}
                </div>
                <div 
                  className="w-full rounded-t-lg transition-all duration-700 gradient-primary shadow-sm group-hover:shadow-lg group-hover:scale-x-105" 
                  style={{ height: `${(d.value / maxVal) * 100}px` }} 
                />
                <span className="text-[10px] font-bold text-muted-foreground transform -rotate-45 mt-2 origin-top-left">
                  {new Date(d.day).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
               <div className="text-sm font-bold text-primary">Efficiency Tip</div>
               <p className="text-xs text-primary/70 mt-0.5">Most patients arrive between 10 AM - 12 PM. Consider adding a nurse for triage during these hours.</p>
            </div>
         </div>
      </div>
    </div>
  );
}
