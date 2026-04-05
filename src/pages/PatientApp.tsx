import { useState } from "react";
import { Link } from "react-router-dom";
import { Activity, ArrowLeft, Search, Home, CalendarPlus, ListOrdered, FileText, User, Bell, Clock, Calendar } from "lucide-react";
import { usePatientState } from "@/hooks/usePatientState";
import { Patient, STATUS_META, APPOINTMENTS } from "@/data/mockData";
import { ToastNotification } from "@/components/ToastNotification";
import { BadgeChip } from "@/components/BadgeChip";

type Tab = "home" | "book" | "status" | "prescriptions" | "profile";

const PatientApp = () => {
  const state = usePatientState();
  const [pTab, setPTab] = useState<Tab>("home");
  const [patForm, setPatForm] = useState({ name: "", age: "", phone: "", symptoms: "" });
  const [issuedToken, setIssuedToken] = useState<Patient | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [foundPat, setFoundPat] = useState<Patient | "notfound" | null>(null);

  // Booking form
  const [bookForm, setBookForm] = useState({ name: "", phone: "", date: "", time: "", type: "New Visit" });

  const bookToken = () => {
    if (!patForm.name.trim() || !patForm.phone.trim()) { state.notify("Name and phone are required", "err"); return; }
    const token = `MQ-${String(state.patients.length + 1).padStart(3, "0")}`;
    const np: Patient = {
      id: state.patients.length + 1, token, name: patForm.name,
      age: parseInt(patForm.age) || 0, phone: patForm.phone, symptoms: patForm.symptoms,
      priority: "normal", status: "waiting", waitMins: (state.waiting.length + 1) * 8,
      consultAt: null, medicines: [], diagnosis: ""
    };
    state.setPatients(prev => [...prev, np]);
    setIssuedToken(np);
    state.notify(`Token ${token} issued!`);
  };

  const searchPatient = () => {
    const q = searchQ.trim().toLowerCase();
    const p = state.patients.find(x => x.token.toLowerCase() === q || x.phone === q);
    setFoundPat(p || "notfound");
    if (!p) state.notify("No patient found", "err");
  };

  const bottomNav: { id: Tab; label: string; icon: typeof Home }[] = [
    { id: "home", label: "Home", icon: Home },
    { id: "book", label: "Book", icon: CalendarPlus },
    { id: "status", label: "Queue", icon: ListOrdered },
    { id: "prescriptions", label: "Rx", icon: FileText },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-background">
      <ToastNotification toast={state.toast} />

      <div className="max-w-md mx-auto min-h-screen flex flex-col pb-20">
        {/* Header */}
        <div className="relative overflow-hidden gradient-primary">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10" style={{ background: "radial-gradient(circle, white, transparent)" }} />
          </div>
          <div className="relative px-5 pt-5 pb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-card/20 backdrop-blur flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-extrabold text-primary-foreground text-xl tracking-tight">MediQueue</div>
                  <div className="text-primary-foreground/60 text-xs -mt-0.5">Patient App</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="relative p-2 rounded-xl bg-card/10 backdrop-blur">
                  <Bell className="w-4 h-4 text-primary-foreground" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
                </button>
                <Link to="/" className="text-primary-foreground/60 hover:text-primary-foreground text-xs px-3 py-1.5 rounded-lg border border-primary-foreground/20 transition-colors flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" /> Back
                </Link>
              </div>
            </div>

            {/* Live Status Bar */}
            <div className="flex items-center gap-3 bg-card/10 backdrop-blur-sm rounded-2xl px-4 py-3">
              <div>
                <div className="text-primary-foreground/60 text-xs">Now Serving</div>
                <div className="font-bold text-primary-foreground text-sm">{state.serving ? `${state.serving.token} — ${state.serving.name}` : "No one currently"}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-primary-foreground/60 text-xs">Waiting</div>
                <div className="font-extrabold text-primary-foreground text-xl">{state.waiting.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-5 py-5 space-y-4">

          {/* HOME TAB */}
          {pTab === "home" && (
            <div className="animate-fade-up space-y-4">
              {/* Welcome */}
              <div className="bg-card rounded-2xl border border-border shadow-card p-5">
                <h2 className="font-bold text-foreground text-lg">Welcome! 👋</h2>
                <p className="text-muted-foreground text-sm mt-1">Book appointments, track your queue status, and view prescriptions all in one place.</p>
                <button onClick={() => setPTab("book")} className="mt-4 w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-sm shadow-md hover:shadow-lg transition-all">
                  <CalendarPlus className="w-4 h-4 inline mr-2" /> Book Appointment
                </button>
              </div>

              {/* Current Queue Status */}
              <div className="bg-card rounded-2xl border border-border shadow-card p-5">
                <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
                  <ListOrdered className="w-4 h-4 text-primary" /> Current Queue Status
                </h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { v: state.waiting.length, l: "Waiting", c: "text-warning" },
                    { v: state.serving?.token || "–", l: "Serving", c: "text-primary" },
                    { v: `~${state.waiting.length * 8}m`, l: "Est. Wait", c: "text-muted-foreground" },
                  ].map(s => (
                    <div key={s.l} className="bg-secondary rounded-xl p-3">
                      <div className={`font-extrabold text-xl ${s.c}`}>{s.v}</div>
                      <div className="text-muted-foreground text-xs mt-0.5">{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Appointment */}
              <div className="bg-card rounded-2xl border border-border shadow-card p-5">
                <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" /> Upcoming Appointment
                </h3>
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-foreground text-sm">Dr. Priya Sharma</div>
                      <div className="text-muted-foreground text-xs mt-0.5">General Physician</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary text-sm">10:00 AM</div>
                      <div className="text-muted-foreground text-xs">Today</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-card rounded-2xl border border-border shadow-card p-5">
                <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" /> Notifications
                </h3>
                <div className="space-y-2.5">
                  {[
                    { icon: "🔔", text: "Your appointment with Dr. Sharma is in 30 minutes", time: "30m ago" },
                    { icon: "💊", text: "Medicine reminder: Cetirizine 10mg – Take now", time: "1h ago" },
                    { icon: "✅", text: "Prescription for last visit is ready to view", time: "2h ago" },
                  ].map((n, i) => (
                    <div key={i} className="flex items-start gap-3 py-2.5 border-b border-border/30 last:border-0">
                      <span className="text-lg">{n.icon}</span>
                      <div className="flex-1">
                        <div className="text-foreground text-xs leading-relaxed">{n.text}</div>
                        <div className="text-muted-foreground text-[10px] mt-0.5">{n.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* BOOK TAB */}
          {pTab === "book" && !issuedToken && (
            <div className="animate-fade-up space-y-4">
              <h2 className="font-bold text-foreground text-lg">Book Your Token</h2>
              <div className="space-y-3">
                {([
                  { k: "name", ph: "Full Name", t: "text" },
                  { k: "age", ph: "Age", t: "number" },
                  { k: "phone", ph: "Phone Number", t: "tel" },
                ] as const).map(f => (
                  <input key={f.k} type={f.t} placeholder={f.ph}
                    value={patForm[f.k]} onChange={e => setPatForm(p => ({ ...p, [f.k]: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-foreground text-sm placeholder:text-muted-foreground transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20" />
                ))}
                <textarea placeholder="Describe your symptoms (optional)..."
                  value={patForm.symptoms} onChange={e => setPatForm(p => ({ ...p, symptoms: e.target.value }))} rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-foreground text-sm placeholder:text-muted-foreground resize-none transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <button onClick={bookToken} className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-bold text-base shadow-md hover:shadow-lg hover:scale-[1.01] transition-all">
                  Get My Token →
                </button>
              </div>

              {/* Queue Info */}
              <div className="bg-secondary rounded-2xl border border-border p-4">
                <div className="font-semibold text-foreground/80 text-sm mb-3">Live Queue Status</div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { v: state.waiting.length, l: "Waiting", c: "text-warning" },
                    { v: state.serving?.token || "–", l: "Serving", c: "text-primary" },
                    { v: `~${state.waiting.length * 8}m`, l: "Est. Wait", c: "text-primary" },
                  ].map(s => (
                    <div key={s.l}>
                      <div className={`font-extrabold text-xl ${s.c}`}>{s.v}</div>
                      <div className="text-muted-foreground text-xs mt-0.5">{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ISSUED TOKEN */}
          {pTab === "book" && issuedToken && (
            <div className="animate-fade-up text-center space-y-5">
              <div className="inline-flex flex-col items-center gap-3 w-full">
                <div className="w-28 h-28 rounded-3xl gradient-primary flex items-center justify-center shadow-xl mx-auto">
                  <div>
                    <div className="text-primary-foreground/70 text-xs font-semibold uppercase tracking-widest">Token</div>
                    <div className="font-extrabold text-primary-foreground text-2xl tracking-tight">{issuedToken.token}</div>
                  </div>
                </div>
                <div className="font-bold text-foreground text-xl">Token Issued!</div>
                <div className="text-muted-foreground text-sm">Hello, {issuedToken.name} 👋</div>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5">
                <div className="text-primary/70 text-xs font-semibold uppercase tracking-wide mb-1">Estimated Wait</div>
                <div className="font-extrabold text-primary text-4xl">~{issuedToken.waitMins} min</div>
              </div>

              <div className="bg-secondary rounded-2xl border border-border p-4">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <div className="text-muted-foreground text-xs">Patients Ahead</div>
                    <div className="font-extrabold text-foreground text-2xl">{state.waiting.length}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Now Serving</div>
                    <div className="font-extrabold text-primary text-lg">{state.serving?.token || "–"}</div>
                  </div>
                </div>
              </div>

              <div className="text-muted-foreground text-sm leading-relaxed px-4">You'll receive an SMS when your turn is near. You can wait at home! 🏠</div>

              <button onClick={() => { setIssuedToken(null); setPatForm({ name: "", age: "", phone: "", symptoms: "" }); }}
                className="w-full py-3 rounded-xl border border-border text-foreground/70 font-semibold text-sm hover:bg-secondary transition-colors">
                Register Another Patient
              </button>
            </div>
          )}

          {/* QUEUE STATUS TAB */}
          {pTab === "status" && (
            <div className="animate-fade-up space-y-4">
              <h2 className="font-bold text-foreground text-lg">Queue Status</h2>

              {/* Search */}
              <div className="flex gap-2">
                <input value={searchQ} onChange={e => setSearchQ(e.target.value)} onKeyDown={e => e.key === "Enter" && searchPatient()}
                  placeholder="Token (MQ-001) or phone"
                  className="flex-1 px-4 py-3 rounded-xl border border-border bg-secondary text-foreground text-sm placeholder:text-muted-foreground focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <button onClick={searchPatient} className="px-4 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm shadow-sm">
                  <Search className="w-4 h-4" />
                </button>
              </div>

              {/* Current Serving */}
              <div className="bg-card rounded-2xl border border-border shadow-card p-5">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Now Serving</div>
                <div className="font-extrabold text-primary text-2xl">{state.serving?.token || "—"}</div>
                {state.serving && <div className="text-foreground text-sm mt-0.5">{state.serving.name}</div>}
              </div>

              {foundPat === "notfound" && (
                <div className="text-center py-8 text-muted-foreground bg-secondary rounded-2xl border border-border">
                  <div className="text-3xl mb-2">🔍</div>
                  <div className="font-semibold">Patient not found</div>
                  <div className="text-sm mt-1">Check your token or phone number</div>
                </div>
              )}

              {foundPat && foundPat !== "notfound" && (
                <div className="bg-card rounded-2xl border border-border shadow-card p-5 animate-fade-up">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="font-bold text-foreground text-base">{foundPat.name}</div>
                      <div className="text-muted-foreground text-xs mt-0.5">{foundPat.token} · Age {foundPat.age}</div>
                    </div>
                    <BadgeChip className={STATUS_META[foundPat.status]?.badgeClass || ""}>
                      {foundPat.status.toUpperCase()}
                    </BadgeChip>
                  </div>

                  {foundPat.status === "waiting" && (
                    <div className="space-y-3">
                      <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 text-center">
                        <div className="text-warning text-xs font-semibold uppercase tracking-wide mb-1">Estimated Wait</div>
                        <div className="font-extrabold text-warning text-3xl">~{foundPat.waitMins} min</div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-secondary rounded-xl p-3 text-center">
                          <div className="text-muted-foreground text-xs">Patients Ahead</div>
                          <div className="font-extrabold text-foreground text-xl">{state.sortedWait.findIndex(p => p.id === foundPat.id)}</div>
                        </div>
                        <div className="bg-secondary rounded-xl p-3 text-center">
                          <div className="text-muted-foreground text-xs">Your Position</div>
                          <div className="font-extrabold text-primary text-xl">#{state.sortedWait.findIndex(p => p.id === foundPat.id) + 1}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {foundPat.status === "done" && foundPat.medicines.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Your Prescription</div>
                      {foundPat.diagnosis && <div className="text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg mb-3">Diagnosis: {foundPat.diagnosis}</div>}
                      <div className="space-y-2">
                        {foundPat.medicines.map((m, i) => (
                          <div key={i} className="bg-secondary rounded-xl px-4 py-3 border border-border/30">
                            <div className="font-semibold text-primary text-sm">{m.name}</div>
                            <div className="text-muted-foreground text-xs mt-0.5">{m.dose} · {m.freq} · {m.days} days</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* PRESCRIPTIONS TAB */}
          {pTab === "prescriptions" && (
            <div className="animate-fade-up space-y-4">
              <h2 className="font-bold text-foreground text-lg">My Prescriptions</h2>

              {state.done.filter(p => p.medicines.length > 0).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border border-border">
                  <div className="text-4xl mb-2">💊</div>
                  <div className="font-semibold">No prescriptions yet</div>
                  <div className="text-sm mt-1">Your prescriptions will appear here after consultation</div>
                </div>
              ) : (
                state.done.filter(p => p.medicines.length > 0).map(p => (
                  <div key={p.id} className="bg-card rounded-2xl border border-border shadow-card p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-bold text-foreground text-sm">{p.name}</div>
                        <div className="text-muted-foreground text-xs mt-0.5">{p.consultAt} · {p.token}</div>
                      </div>
                      {p.diagnosis && (
                        <BadgeChip className="bg-primary/10 text-primary border border-primary/20">
                          {p.diagnosis}
                        </BadgeChip>
                      )}
                    </div>
                    <div className="space-y-2">
                      {p.medicines.map((m, i) => (
                        <div key={i} className="bg-secondary rounded-xl px-4 py-3 border border-border/30">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold text-primary text-sm">💊 {m.name}</div>
                              <div className="text-muted-foreground text-xs mt-1">
                                <span className="font-medium">Dosage:</span> {m.dose} · <span className="font-medium">Frequency:</span> {m.freq}
                              </div>
                            </div>
                            <span className="text-muted-foreground text-xs shrink-0">{m.days} days</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* PROFILE TAB */}
          {pTab === "profile" && (
            <div className="animate-fade-up space-y-4">
              <h2 className="font-bold text-foreground text-lg">My Profile</h2>

              <div className="bg-card rounded-2xl border border-border shadow-card p-6 text-center">
                <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold mx-auto mb-4">
                  P
                </div>
                <div className="font-bold text-foreground text-lg">Patient User</div>
                <div className="text-muted-foreground text-sm">+91 98765 43210</div>
              </div>

              <div className="bg-card rounded-2xl border border-border shadow-card p-5 space-y-3">
                {[
                  { label: "My Appointments", count: "3" },
                  { label: "Prescriptions", count: state.done.filter(p => p.medicines.length > 0).length.toString() },
                  { label: "Visit History", count: state.done.length.toString() },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                    <span className="text-foreground text-sm font-medium">{item.label}</span>
                    <span className="text-primary font-bold text-sm">{item.count}</span>
                  </div>
                ))}
              </div>

              {/* Health Tips */}
              <div className="bg-secondary rounded-2xl border border-border p-4">
                <div className="font-semibold text-foreground/80 text-sm mb-3">Health Tips</div>
                <div className="space-y-3">
                  {[
                    { icon: "🦟", tip: "Remove stagnant water to prevent dengue mosquito breeding." },
                    { icon: "🩸", tip: "Check blood sugar regularly. Avoid sugary drinks." },
                    { icon: "🫁", tip: "Viral fever is spreading. Stay hydrated and rest well." },
                  ].map((h, i) => (
                    <div key={i} className="flex gap-3 items-start pb-3 border-b border-border/30 last:border-0">
                      <span>{h.icon}</span>
                      <div className="text-muted-foreground text-xs leading-relaxed">{h.tip}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card border-t border-border shadow-lg z-30">
          <div className="flex items-center justify-around py-2">
            {bottomNav.map(item => (
              <button
                key={item.id}
                onClick={() => setPTab(item.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors ${
                  pTab === item.id ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className={`w-5 h-5 ${pTab === item.id ? "text-primary" : ""}`} />
                <span className="text-[10px] font-semibold">{item.label}</span>
                {pTab === item.id && <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientApp;
