import { useState } from "react";
import { QueuePatient } from "@/hooks/useQueue";
import { Plus, Download, FileText, User, Stethoscope } from "lucide-react";

interface Medicine {
  name: string;
  dose: string;
  freq: string;
  days: number;
}

interface PrescriptionGeneratorTabProps {
  patients: QueuePatient[];
  onPrescribe: (p: QueuePatient) => void;
}

const MEDICINE_DB = [
  "Paracetamol",
  "Azithromycin",
  "Cetirizine",
  "Pantoprazole",
  "Amoxicillin",
  "Ibuprofen",
  "Dolo 650",
  "Metformin",
  "Amlodipine",
  "ORS",
];

function getPatientSymptoms(patient: QueuePatient | null) {
  if (!patient) return "";
  return patient.symptom_tags?.length > 0
    ? patient.symptom_tags.join(", ")
    : patient.custom_symptoms || "";
}

function getPatientMeta(patient: QueuePatient | null) {
  if (!patient) return "";
  return `${patient.token_number} · Age ${patient.patient_age ?? "N/A"} · ${patient.patient_phone || "N/A"}`;
}

export function PrescriptionGeneratorTab({
  patients,
  onPrescribe,
}: PrescriptionGeneratorTabProps) {
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [meds, setMeds] = useState<Medicine[]>([]);
  const [medInput, setMedInput] = useState("");
  const [medDose, setMedDose] = useState("");
  const [medFreq, setMedFreq] = useState("Once daily");
  const [medDays, setMedDays] = useState("5");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [generated, setGenerated] = useState(false);

  const selectedPatient =
    patients.find((p) => p.id === selectedPatientId) || null;

  const handleMedInput = (value: string) => {
    setMedInput(value);
    setSuggestions(
      value.length > 1
        ? MEDICINE_DB.filter((m) =>
            m.toLowerCase().includes(value.toLowerCase())
          ).slice(0, 6)
        : []
    );
  };

  const addMed = () => {
    if (!medInput.trim()) return;

    setMeds((prev) => [
      ...prev,
      {
        name: medInput,
        dose: medDose,
        freq: medFreq,
        days: parseInt(medDays, 10) || 5,
      },
    ]);

    setMedInput("");
    setMedDose("");
    setMedFreq("Once daily");
    setMedDays("5");
    setSuggestions([]);
  };

  const generate = () => {
    if (!selectedPatient || meds.length === 0) return;
    setGenerated(true);
  };

  const reset = () => {
    setSelectedPatientId("");
    setSymptoms("");
    setDiagnosis("");
    setNotes("");
    setMeds([]);
    setGenerated(false);
    setMedInput("");
    setMedDose("");
    setMedFreq("Once daily");
    setMedDays("5");
    setSuggestions([]);
  };

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-extrabold text-foreground text-2xl">
          Prescription Generator
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Create and preview digital prescriptions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-card rounded-2xl border border-border shadow-card p-6">
            <h3 className="font-bold text-foreground text-sm mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Patient Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Select Patient
                </label>

                <select
                  value={selectedPatientId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedPatientId(id);
                    const patient = patients.find((x) => x.id === id) || null;
                    setSymptoms(getPatientSymptoms(patient));
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-foreground text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select a patient...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.token_number} — {p.patient_name} (Age {p.patient_age ?? "N/A"})
                    </option>
                  ))}
                </select>
              </div>

              {selectedPatient && (
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground text-sm">
                      {selectedPatient.patient_name}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {getPatientMeta(selectedPatient)}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Symptoms
                </label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={2}
                  placeholder="Patient symptoms..."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-foreground text-sm placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-card p-6">
            <h3 className="font-bold text-foreground text-sm mb-4 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-primary" /> Diagnosis & Medicines
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Diagnosis
                </label>
                <input
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Enter diagnosis..."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Add Medicine
                </label>

                <div className="relative mb-3">
                  <input
                    value={medInput}
                    onChange={(e) => handleMedInput(e.target.value)}
                    placeholder="Search medicine name..."
                    className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                  />

                  {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-xl border border-border shadow-card-hover z-20 overflow-hidden">
                      {suggestions.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            setMedInput(m);
                            setSuggestions([]);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors border-b border-border/30 last:border-0"
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <input
                    value={medDose}
                    onChange={(e) => setMedDose(e.target.value)}
                    placeholder="Dosage"
                    className="px-3 py-2.5 rounded-xl border border-border bg-secondary text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />

                  <select
                    value={medFreq}
                    onChange={(e) => setMedFreq(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-border bg-secondary text-foreground text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {["Once daily", "Twice daily", "Thrice daily", "At night", "SOS/As needed"].map(
                      (f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      )
                    )}
                  </select>

                  <input
                    type="number"
                    value={medDays}
                    onChange={(e) => setMedDays(e.target.value)}
                    placeholder="Days"
                    className="px-3 py-2.5 rounded-xl border border-border bg-secondary text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <button
                  type="button"
                  onClick={addMed}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Medicine
                </button>
              </div>

              {meds.length > 0 && (
                <div className="space-y-2">
                  {meds.map((m, i) => (
                    <div
                      key={`${m.name}-${i}`}
                      className="flex items-center justify-between bg-primary/5 border border-primary/10 rounded-xl px-4 py-3"
                    >
                      <div>
                        <span className="font-semibold text-primary text-sm">
                          {m.name}
                        </span>
                        <span className="text-muted-foreground text-xs ml-2">
                          {m.dose} · {m.freq} · {m.days}d
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setMeds((prev) => prev.filter((_, j) => j !== i))
                        }
                        className="text-destructive hover:text-destructive/80 text-lg leading-none ml-3 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Doctor's Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Advice, follow-up..."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-foreground text-sm placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={generate}
                  disabled={!selectedPatient || meds.length === 0}
                  className="flex-1 py-3.5 rounded-2xl gradient-primary text-primary-foreground font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  Generate Prescription
                </button>

                <button
                  type="button"
                  onClick={() => selectedPatient && onPrescribe(selectedPatient)}
                  disabled={!selectedPatient}
                  className="px-5 py-3.5 rounded-2xl border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Open Rx Modal
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl border border-border shadow-card p-6 sticky top-24">
            <h3 className="font-bold text-foreground text-sm mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Prescription Preview
            </h3>

            {generated && selectedPatient ? (
              <div className="space-y-4">
                <div className="border-2 border-primary/20 rounded-2xl p-5 bg-primary/5">
                  <div className="text-center mb-4 pb-3 border-b border-primary/20">
                    <div className="font-extrabold text-primary text-lg">
                      MediQ Clinic
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Dr. Priya Sharma · General Physician
                    </div>
                    <div className="text-muted-foreground text-[10px] mt-0.5">
                      MCI Reg: MH-12345 · Ph: +91 98765 43210
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Name:</span>{" "}
                      <span className="font-semibold text-foreground">
                        {selectedPatient.patient_name}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Age:</span>{" "}
                      <span className="font-semibold text-foreground">
                        {selectedPatient.patient_age ?? "N/A"} years
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date:</span>{" "}
                      <span className="font-semibold text-foreground">
                        {new Date().toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Token:</span>{" "}
                      <span className="font-semibold text-foreground">
                        {selectedPatient.token_number}
                      </span>
                    </div>
                  </div>

                  {diagnosis && (
                    <div className="mb-3">
                      <span className="text-xs text-muted-foreground">Diagnosis: </span>
                      <span className="text-xs font-semibold text-foreground">
                        {diagnosis}
                      </span>
                    </div>
                  )}

                  <div className="font-bold text-primary text-xl mb-3">℞</div>

                  <div className="space-y-2 mb-4">
                    {meds.map((m, i) => (
                      <div
                        key={`${m.name}-preview-${i}`}
                        className="flex justify-between items-start text-xs py-1.5 border-b border-border/30 last:border-0"
                      >
                        <div>
                          <div className="font-semibold text-foreground">
                            {i + 1}. {m.name}
                          </div>
                          <div className="text-muted-foreground">
                            {m.dose} · {m.freq}
                          </div>
                        </div>
                        <span className="text-muted-foreground shrink-0">
                          {m.days} days
                        </span>
                      </div>
                    ))}
                  </div>

                  {notes && (
                    <div className="bg-secondary/50 rounded-lg p-3 text-xs text-muted-foreground border border-border/30">
                      <span className="font-semibold text-foreground">Notes:</span>{" "}
                      {notes}
                    </div>
                  )}

                  <div className="mt-6 text-right">
                    <div className="text-muted-foreground text-[10px]">Signature</div>
                    <div className="font-bold text-primary text-sm italic">
                      Dr. Priya Sharma
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm shadow-md hover:shadow-lg transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>

                  <button
                    type="button"
                    onClick={reset}
                    className="px-5 py-3 rounded-xl border border-border text-foreground/70 font-semibold text-sm hover:bg-secondary transition-colors"
                  >
                    New Rx
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-white/5 rounded-2xl">
                <div className="flex justify-center mb-4 text-muted-foreground/20">
                  <FileText className="w-12 h-12" />
                </div>
                <div className="font-bold text-white/50 text-sm">Prescription Preview</div>
                <div className="text-xs mt-2 px-10 text-white/40">
                  Fill in the form and click Generate to see a professional preview
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}