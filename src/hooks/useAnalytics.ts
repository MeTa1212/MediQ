import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";

export function useAnalytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const fetchOutbreakStatistics = useCallback(async () => {
    if (!user) return [];
    setLoading(true);
    try {
      // Direct aggregation via SQL RPC or just count for now
      // This is a simplified version
      const { data, error } = await supabase
        .from("tokens")
        .select("symptom_tags, clinic_date")
        .eq("status", "done")
        .order("clinic_date", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Outbreak fetch error:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchDailyCounts = useCallback(async () => {
    if (!user) return [];
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tokens")
        .select("clinic_date")
        .eq("doctor_id", user.id)
        .eq("status", "done");

      if (error) throw error;

      // Group by date
      const counts: Record<string, number> = {};
      data.forEach((row) => {
        counts[row.clinic_date] = (counts[row.clinic_date] || 0) + 1;
      });

      return Object.entries(counts).map(([day, val]) => ({ day, value: val }));
    } catch (err) {
      console.error("Daily counts fetch error:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    fetchOutbreakStatistics,
    fetchDailyCounts,
  };
}
