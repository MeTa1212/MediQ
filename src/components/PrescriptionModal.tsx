import { useState } from "react";
import { X, Plus } from "lucide-react";
export interface Medicine {
  name: string;
  dose: string;
  freq: string;
  days: number;
}

export interface Patient {
  id: string;
  name: string;
  token: string;
  age?: number;
  symptoms: string;
  diagnosis?: string;
  medicines?: Medicine[];
}

const MEDICINE_DB = [
  "Paracetamol 500mg", "Amoxicillin 250mg", "Ibuprofen 400mg", "Azithromycin 500mg",
  "Cetirizine 10mg", "Pantoprazole 40mg", "Vitamin C 500mg", "Cough Syrup",
  "Aspirin 75mg", "Metformin 500mg", "Atorvastatin 10mg"
];

interface PrescriptionModalProps {
  patient: Patient;
  onClose: () => void;
  onSave: (medicines: Medicine[], diagnosis: string) => void;
}

export function PrescriptionModal({ patient, onClose, onSave }: PrescriptionModalProps) {
  const [meds, setMeds] = useState<Medicine[]>(patient.medicines || []);
  const [diagnosis, setDiagnosis] = useState(patient.diagnosis || "");
  const [notes, setNotes] = useState("");
  const [medInput, setMedInput] = useState("");
  const [medDose, setMedDose] = useState("");
  const [medFreq, setMedFreq] = useState("Once daily");
  const [medDays, setMedDays] = useState("5");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleMedInput = (v: string) => {
    setMedInput(v);
    setSuggestions(v.length > 1 ? MEDICINE_DB.filter(m => m.toLowerCase().includes(v.toLowerCase())).slice(0, 6) : []);
  };

  const addMed = () => {
    if (!medInput.trim()) return;
    setMeds(prev => [...prev, { name: medInput, dose: medDose, freq: medFreq, days: parseInt(medDays) || 5 }]);
    setMedInput(""); setMedDose(""); setMedFreq("Once daily"); setMedDays("5"); setSuggestions([]);
  };

  return (
    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-40 flex items-center justify-center p-4 animate-fade-up">
      <div className="bg-card rounded-3xl shadow-modal w-full max-w-xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card rounded-t-3xl border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-bold text-foreground text-lg">Write Prescription</h2>
            <p className="text-muted-foreground text-xs mt-0.5">{patient.name} · {patient.token} · Age {patient.age}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-secondary hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Symptoms */}
          <div className="bg-warning/10 border border-warning/20 rounded-2xl p-4">
            <div className="text-xs font-semibold text-warning uppercase tracking-wide mb-1">Patient Symptoms</div>
            <div className="text-foreground/80 text-sm leading-relaxed">{patient.symptoms}</div>
          </div>

          {/* Diagnosis */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Diagnosis</label>
            <input value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="Enter diagnosis..."
              className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-foreground text-sm placeholder:text-muted-foreground transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>

          {/* Add Medicine */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Add Medicine</label>
            <div className="relative mb-3">
              <input value={medInput} onChange={e => handleMedInput(e.target.value)} placeholder="Search or type medicine name..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-foreground text-sm placeholder:text-muted-foreground transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20" />
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-xl border border-border shadow-card-hover z-20 overflow-hidden">
                  {suggestions.map(m => (
                    <button key={m} onClick={() => { setMedInput(m); setSuggestions([]); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors border-b border-border/30 last:border-0">
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <input value={medDose} onChange={e => setMedDose(e.target.value)} placeholder="Dose (e.g. 500mg)"
                className="px-3 py-2.5 rounded-xl border border-border bg-secondary text-foreground text-xs placeholder:text-muted-foreground focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <select value={medFreq} onChange={e => setMedFreq(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-border bg-secondary text-foreground text-xs cursor-pointer focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20">
                {["Once daily", "Twice daily", "Thrice daily", "At night", "SOS/As needed"].map(f => <option key={f}>{f}</option>)}
              </select>
              <input type="number" value={medDays} onChange={e => setMedDays(e.target.value)} placeholder="Days"
                className="px-3 py-2.5 rounded-xl border border-border bg-secondary text-foreground text-xs placeholder:text-muted-foreground focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <button onClick={addMed} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
              <Plus className="w-3.5 h-3.5" /> Add Medicine
            </button>
          </div>

          {/* Medicine List */}
          {meds.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Medicines ({meds.length})</label>
              <div className="space-y-2">
                {meds.map((m, i) => (
                  <div key={i} className="flex items-center justify-between bg-primary/5 border border-primary/10 rounded-xl px-4 py-3">
                    <div>
                      <span className="font-semibold text-primary text-sm">{m.name}</span>
                      <span className="text-muted-foreground text-xs ml-2">{m.dose} · {m.freq} · {m.days}d</span>
                    </div>
                    <button onClick={() => setMeds(prev => prev.filter((_, j) => j !== i))} className="text-destructive hover:text-destructive/80 text-lg leading-none ml-3 transition-colors">×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Doctor's Notes (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Advice, follow-up instructions..."
              className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-foreground text-sm placeholder:text-muted-foreground resize-none transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>

          <button onClick={() => onSave(meds, diagnosis)} className="w-full py-3.5 rounded-2xl gradient-primary text-primary-foreground font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all">
            Save & Complete Consultation
          </button>
        </div>
      </div>
    </div>
  );
}
