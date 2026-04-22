import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { X, FileText, Clock, Plus, Save } from "lucide-react";

interface PatientHistoryPanelProps {
  patientId: string;
  patientName: string;
  tokenId?: string;
  onClose: () => void;
}

interface HistoryEntry {
  id: string;
  diagnosis: string | null;
  notes: string | null;
  visit_date: string;
  created_at: string;
  doctor_name?: string;
}

interface PastPrescription {
  id: string;
  diagnosis: string | null;
  notes: string | null;
  created_at: string;
  prescription_medicines?: { medicine_name: string; dose: string; frequency: string; duration_days: number }[];
}

export function PatientHistoryPanel({
  patientId,
  patientName,
  tokenId,
  onClose,
}: PatientHistoryPanelProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [prescriptions, setPrescriptions] = useState<PastPrescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDiagnosis, setNewDiagnosis] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);

    // Fetch medical history
    const { data: histData } = await supabase
      .from("medical_history")
      .select("id, diagnosis, notes, visit_date, created_at, doctor_id, profiles!medical_history_doctor_id_fkey(full_name)")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (histData) {
      setHistory(
        histData.map((h: any) => ({
          id: h.id,
          diagnosis: h.diagnosis,
          notes: h.notes,
          visit_date: h.visit_date,
          created_at: h.created_at,
          doctor_name: Array.isArray(h.profiles) ? h.profiles[0]?.full_name : h.profiles?.full_name,
        }))
      );
    }

    // Fetch past prescriptions
    const { data: rxData } = await supabase
      .from("prescriptions")
      .select("id, diagnosis, notes, created_at, prescription_medicines(medicine_name, dose, frequency, duration_days)")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (rxData) {
      setPrescriptions(rxData as PastPrescription[]);
    }

    setLoading(false);
  }, [patientId]);

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  const handleSaveNote = async () => {
    if (!newDiagnosis.trim() && !newNotes.trim()) return;
    setSaving(true);

    const { data: userData } = await supabase.auth.getUser();
    const doctorId = userData?.user?.id;

    if (!doctorId) {
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("medical_history").insert({
      patient_id: patientId,
      doctor_id: doctorId,
      token_id: tokenId || null,
      diagnosis: newDiagnosis.trim() || null,
      notes: newNotes.trim() || null,
    });

    if (!error) {
      setNewDiagnosis("");
      setNewNotes("");
      setShowAddForm(false);
      await fetchHistory();
    }

    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0c1117] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0c1117] border-b border-white/10 p-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Patient History</h2>
            <p className="text-xs text-white/40 mt-0.5">{patientName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Add Note Button */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/10 text-sm font-medium text-white/50 hover:border-white/20 hover:text-white/70 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Clinical Notes
            </button>
          ) : (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
              <div className="text-xs font-bold text-primary uppercase tracking-wider">New Clinical Note</div>
              <input
                value={newDiagnosis}
                onChange={(e) => setNewDiagnosis(e.target.value)}
                placeholder="Diagnosis..."
                className="w-full px-3 py-2.5 rounded-lg border border-white/10 bg-white/5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              <textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                rows={3}
                placeholder="Clinical notes, observations, follow-up instructions..."
                className="w-full px-3 py-2.5 rounded-lg border border-white/10 bg-white/5 text-sm text-white placeholder:text-white/25 resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveNote}
                  disabled={saving || (!newDiagnosis.trim() && !newNotes.trim())}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? "Saving..." : "Save Note"}
                </button>
                <button
                  onClick={() => { setShowAddForm(false); setNewDiagnosis(""); setNewNotes(""); }}
                  className="px-4 py-2.5 rounded-lg border border-white/10 text-xs font-medium text-white/50 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-white/30 text-sm">Loading history...</div>
          ) : (
            <>
              {/* Medical History */}
              <div>
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" /> Clinical Notes ({history.length})
                </h3>
                {history.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/[0.06] p-6 text-center text-xs text-white/20">
                    No clinical notes recorded yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {history.map((h) => (
                      <div key={h.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            {h.diagnosis && (
                              <div className="text-sm font-semibold text-white/80">{h.diagnosis}</div>
                            )}
                            {h.notes && (
                              <div className="text-xs text-white/50 mt-1 italic">{h.notes}</div>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-[10px] text-white/30">
                              {new Date(h.visit_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </div>
                            {h.doctor_name && (
                              <div className="text-[10px] text-white/20 mt-0.5">Dr. {h.doctor_name}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Past Prescriptions */}
              <div>
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" /> Past Prescriptions ({prescriptions.length})
                </h3>
                {prescriptions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/[0.06] p-6 text-center text-xs text-white/20">
                    No prescriptions found
                  </div>
                ) : (
                  <div className="space-y-2">
                    {prescriptions.map((rx) => (
                      <div key={rx.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                        <div className="flex items-start justify-between mb-2">
                          {rx.diagnosis && (
                            <span className="text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                              {rx.diagnosis}
                            </span>
                          )}
                          <span className="text-[10px] text-white/30">
                            {new Date(rx.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                        {rx.prescription_medicines && rx.prescription_medicines.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {rx.prescription_medicines.map((m, i) => (
                              <span
                                key={i}
                                className="text-[10px] bg-white/[0.04] border border-white/[0.08] rounded-md px-2 py-1 text-white/50"
                              >
                                {m.medicine_name} · {m.dose} · {m.frequency} · {m.duration_days}d
                              </span>
                            ))}
                          </div>
                        )}
                        {rx.notes && (
                          <div className="text-[10px] text-white/30 mt-2 italic">{rx.notes}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
