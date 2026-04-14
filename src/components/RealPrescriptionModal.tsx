import { useState } from "react";
import { X, Plus, Stethoscope } from "lucide-react";
import type { QueuePatient } from "@/hooks/useQueue";
import type { MedicineInput } from "@/hooks/usePrescriptions";
import { usePrescriptions } from "@/hooks/usePrescriptions";
const MEDICINE_DB = [
  "Paracetamol 500mg", "Amoxicillin 250mg", "Ibuprofen 400mg", "Azithromycin 500mg",
  "Cetirizine 10mg", "Pantoprazole 40mg", "Vitamin C 500mg", "Cough Syrup",
  "Aspirin 75mg", "Metformin 500mg", "Atorvastatin 10mg"
];

interface Props {
  patient: QueuePatient;
  onClose: () => void;
  onSaved: () => void;
}

export default function RealPrescriptionModal({
  patient,
  onClose,
  onSaved,
}: Props) {
  const { savePrescription, saving } = usePrescriptions();

  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState<MedicineInput[]>([]);
  const [medInput, setMedInput] = useState("");
  const [medDose, setMedDose] = useState("");
  const [medFreq, setMedFreq] = useState("Once daily");
  const [medDays, setMedDays] = useState("5");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState("");

  const handleMedInput = (value: string) => {
    setMedInput(value);
    if (value.trim().length > 1) {
      setSuggestions(
        MEDICINE_DB.filter((m) =>
          m.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 6)
      );
    } else {
      setSuggestions([]);
    }
  };

  const addMed = () => {
    if (!medInput.trim()) return;

    setMedicines((prev) => [
      ...prev,
      {
        name: medInput.trim(),
        dose: medDose.trim(),
        freq: medFreq,
        days: parseInt(medDays || "5", 10),
      },
    ]);

    setMedInput("");
    setMedDose("");
    setMedFreq("Once daily");
    setMedDays("5");
    setSuggestions([]);
  };

  const removeMed = (index: number) => {
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setError("");

    try {
      await savePrescription(
        patient.id,
        patient.patient_id,
        diagnosis,
        notes,
        medicines
      );
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to save. Please try again.");
    }
  };

  const symptomDisplay =
    patient.symptom_tags.length > 0
      ? patient.symptom_tags.join(", ")
      : patient.custom_symptoms || "No symptoms noted";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(7, 16, 27, 0.75)", backdropFilter: "blur(8px)" }}
    >
      <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-[28px] border border-zinc-300/10 bg-zinc-300/5 backdrop-blur-xl shadow-[0_24px_64px_rgba(0,0,0,0.5)]">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-[28px] border-b border-zinc-300/10 bg-zinc-900/80 backdrop-blur-md px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-sky-400" />
              <span className="text-base font-bold text-white">Write Prescription</span>
            </div>
            <p className="mt-0.5 text-xs text-white/50">
              {patient.patient_name} • {patient.token_number}
              {patient.patient_age ? ` • Age ${patient.patient_age}` : ""}
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-300/10 bg-zinc-300/5 text-white/60 transition-colors hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-amber-300/80">
              Reported Symptoms
            </p>
            <p className="text-sm leading-relaxed text-white/80">{symptomDisplay}</p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-white/50">
              Diagnosis
            </label>
            <input
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Enter diagnosis..."
              className="w-full rounded-xl border border-zinc-300/10 bg-zinc-300/5 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-sky-400/40 focus:ring-1 focus:ring-sky-400/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-white/50">
              Add Medicine
            </label>

            <div className="relative mb-3">
              <input
                value={medInput}
                onChange={(e) => handleMedInput(e.target.value)}
                placeholder="Search or type medicine name..."
                className="w-full rounded-xl border border-zinc-300/10 bg-zinc-300/5 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-sky-400/40 focus:ring-1 focus:ring-sky-400/20"
              />

              {suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-zinc-300/10 bg-zinc-900/95 shadow-xl backdrop-blur-md">
                  {suggestions.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setMedInput(m);
                        setSuggestions([]);
                      }}
                      className="w-full border-b border-zinc-300/5 px-4 py-2.5 text-left text-sm text-white/80 transition-colors last:border-0 hover:bg-zinc-300/10"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-3 grid grid-cols-3 gap-2">
              <input
                value={medDose}
                onChange={(e) => setMedDose(e.target.value)}
                placeholder="Dose 500mg"
                className="rounded-xl border border-zinc-300/10 bg-zinc-300/5 px-3 py-2.5 text-xs text-white outline-none transition-all placeholder:text-white/25 focus:border-sky-400/40"
              />

              <select
                value={medFreq}
                onChange={(e) => setMedFreq(e.target.value)}
                className="cursor-pointer rounded-xl border border-zinc-300/10 bg-zinc-900 px-3 py-2.5 text-xs text-white outline-none transition-all focus:border-sky-400/40"
              >
                {["Once daily", "Twice daily", "Thrice daily", "At night", "SOS/As needed"].map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={medDays}
                onChange={(e) => setMedDays(e.target.value)}
                placeholder="Days"
                className="rounded-xl border border-zinc-300/10 bg-zinc-300/5 px-3 py-2.5 text-xs text-white outline-none transition-all placeholder:text-white/25 focus:border-sky-400/40"
              />
            </div>

            <button
              type="button"
              onClick={addMed}
              className="inline-flex items-center gap-2 rounded-xl border border-sky-400/25 bg-sky-500/20 px-4 py-2.5 text-sm font-semibold text-sky-200 transition-colors hover:bg-sky-500/30"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Medicine
            </button>
          </div>

          {medicines.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-white/50">
                Medicines ({medicines.length})
              </label>

              {medicines.map((m, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-sky-400/20 bg-sky-500/10 px-4 py-3"
                >
                  <div>
                    <span className="text-sm font-semibold text-sky-300">{m.name}</span>
                    <span className="ml-2 text-xs text-white/50">
                      {m.dose} • {m.freq} • {m.days}d
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeMed(i)}
                    className="ml-3 text-xl leading-none text-white/30 transition-colors hover:text-red-400"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-white/50">
              Doctor&apos;s Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Advice, follow-up instructions..."
              className="w-full resize-none rounded-xl border border-zinc-300/10 bg-zinc-300/5 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-sky-400/40"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="group relative h-12 w-full overflow-hidden rounded-2xl border border-blue-300/35 bg-[linear-gradient(180deg,#60a5fa_0%,#3b82f6_42%,#2563eb_100%)] text-base font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(59,130,246,0.34)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <span className="relative z-10">
              {saving ? "Saving prescription..." : "Save & Complete Consultation"}
            </span>
            <span className="pointer-events-none absolute inset-x-3 top-px h-4/6 rounded-[14px] bg-white/10 blur-md" />
          </button>
        </div>
      </div>
    </div>
  );
}