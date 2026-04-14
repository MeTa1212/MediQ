import re

with open(r'c:\Users\Mehul\Desktop\MediQ Project\mediQ\src\pages\PatientApp.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
content = content.replace('import { usePatientState } from "@/hooks/usePatientState";', 'import { usePatientQueue } from "@/hooks/usePatientQueue";\nimport { useAuth } from "@/hooks/useAuth";')
content = content.replace('import { Patient, STATUS_META, APPOINTMENTS } from "@/data/mockData";', 'import { STATUS_META, APPOINTMENTS } from "@/data/mockData";')

# 2. State
old_state = """  const state = usePatientState();
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
  };"""

new_state = """  const { profile } = useAuth();
  const {
    bookToken, booking,
    myTokens, fetchMyTokens,
    myPrescriptions, fetchMyPrescriptions,
    myReminders, fetchMyReminders,
    symptomTags, loadingTags,
    doctors,
  } = usePatientQueue();

  const [pTab, setPTab] = useState<Tab>("home");
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customSymptoms, setCustomSymptoms] = useState("");
  const [issuedToken, setIssuedToken] = useState<any | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [foundPat, setFoundPat] = useState<any | "notfound" | null>(null);

  const notify = (msg: string, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleBookToken = async () => {
    if (!selectedDoctor) { notify("Please select a doctor", "err"); return; }
    if (selectedTags.length === 0 && !customSymptoms.trim()) {
      notify("Please select at least one symptom", "err"); return;
    }
    try {
      const token = await bookToken(selectedDoctor, selectedTags, customSymptoms);
      setIssuedToken(token);
      notify(`Token ${token.token_number} issued!`);
    } catch (err: any) {
      notify(err.message || "Failed to book token", "err");
    }
  };

  const searchPatient = () => {
    const q = searchQ.trim().toLowerCase();
    const p = myTokens.find(x =>
      x.token_number.toLowerCase() === q || x.profiles?.phone === q
    );
    setFoundPat(p || "notfound");
    if (!p) notify("No patient found", "err");
  };"""
content = content.replace(old_state, new_state)

# 3. state.toast
content = content.replace('state.toast', 'toast')

# 4. Live Status Bar header
content = content.replace('{state.serving ? `${state.serving.token} — ${state.serving.name}` : "No one currently"}', '{myTokens[0] ? myTokens[0].token_number : "No one currently"}')
content = content.replace('{state.waiting.length}', '{myTokens.length}')

# 5. Current Queue Status grid
content = content.replace('{ v: state.waiting.length, l: "Waiting", c: "text-warning" }', '{ v: myTokens.length, l: "My Tokens", c: "text-warning" }')
content = content.replace('{ v: state.serving?.token || "–", l: "Serving", c: "text-primary" }', '{ v: myTokens[0]?.status || "–", l: "Latest Status", c: "text-primary" }')
content = content.replace('{ v: `~${state.waiting.length * 8}m`, l: "Est. Wait", c: "text-muted-foreground" }', '{ v: `~${myTokens[0]?.estimated_wait_minutes || 0}m`, l: "Est. Wait", c: "text-muted-foreground" }')

# 6. Book Tab JSX
old_book_jsx = """              <div className="space-y-3">
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
              </div>"""

new_book_jsx = """              <div className="space-y-4">
                {/* Doctor Selection */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Select Doctor
                  </label>
                  <select value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
                    <option value="">Choose a doctor...</option>
                    {doctors.map((d: any) => (
                      <option key={d.id} value={d.id}>
                        {d.full_name}{d.specialty ? ` — ${d.specialty}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Symptom Tag Chips */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    What's bothering you? (select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {symptomTags.map((tag: any) => {
                      const selected = selectedTags.includes(tag.label);
                      return (
                        <button key={tag.id}
                          onClick={() => setSelectedTags(prev =>
                            selected ? prev.filter(t => t !== tag.label) : [...prev, tag.label]
                          )}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                            selected
                              ? tag.is_emergency
                                ? "bg-destructive/20 border-destructive/40 text-destructive"
                                : "bg-primary/20 border-primary/40 text-primary"
                              : "bg-secondary border-border text-muted-foreground hover:border-primary/30"
                          }`}>
                          <span>{tag.emoji}</span>
                          <span>{tag.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom symptoms text */}
                <textarea
                  value={customSymptoms}
                  onChange={e => setCustomSymptoms(e.target.value)}
                  placeholder="Describe in your own words (optional)..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-foreground text-sm placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" />

                <button onClick={handleBookToken} disabled={booking}
                  className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-bold text-base shadow-md hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {booking ? "Booking..." : "Get My Token →"}
                </button>
              </div>"""
content = content.replace(old_book_jsx, new_book_jsx)

# 7. Issued Token replacements
content = content.replace('{issuedToken.token}', '{issuedToken.token_number}')
content = content.replace('Hello, {issuedToken.name} 👋', 'Hello, {profile?.full_name} 👋')
content = content.replace('~{issuedToken.waitMins} min', '~{issuedToken.estimated_wait_minutes ?? 15} min')

old_issued_queue = """                  <div>
                    <div className="text-muted-foreground text-xs">Patients Ahead</div>
                    <div className="font-extrabold text-foreground text-2xl">{state.waiting.length}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Now Serving</div>
                    <div className="font-extrabold text-primary text-lg">{state.serving?.token || "–"}</div>
                  </div>"""

new_issued_queue = """                  <div>
                    <div className="text-muted-foreground text-xs">Status</div>
                    <div className="font-extrabold text-foreground text-1xl">{issuedToken.status}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Priority</div>
                    <div className="font-extrabold text-primary text-1xl">{issuedToken.priority}</div>
                  </div>"""
content = content.replace(old_issued_queue, new_issued_queue)

old_register_another = """              <button onClick={() => { setIssuedToken(null); setPatForm({ name: "", age: "", phone: "", symptoms: "" }); }}
                className="w-full py-3 rounded-xl border border-border text-foreground/70 font-semibold text-sm hover:bg-secondary transition-colors">
                Register Another Patient
              </button>"""
new_register_another = """              <button onClick={() => { setIssuedToken(null); setSelectedTags([]); setCustomSymptoms(""); }}
                className="w-full py-3 rounded-xl border border-border text-foreground/70 font-semibold text-sm hover:bg-secondary transition-colors">
                Register Another Token
              </button>"""
content = content.replace(old_register_another, new_register_another)

# 8. Status Tab replacements
content = content.replace('{state.serving?.token || "—"}', '{myTokens[0]?.token_number || "—"}')
content = content.replace('{state.serving && <div className="text-foreground text-sm mt-0.5">{state.serving.name}</div>}', '{myTokens[0] && <div className="text-foreground text-sm mt-0.5">{myTokens[0].profiles?.full_name}</div>}')
  
content = content.replace('{foundPat.name}', '{foundPat.patient_name || foundPat.profiles?.full_name || ""}')
content = content.replace('{foundPat.token}', '{foundPat.token_number}')
content = content.replace('Age {foundPat.age}', 'Age {foundPat.patient_age ?? "N/A"}')
content = content.replace('{foundPat.waitMins}', '{foundPat.estimated_wait_minutes ?? 15}')

content = content.replace('{state.sortedWait.findIndex(p => p.id === foundPat.id)}', '{(foundPat.estimated_wait_minutes ? Math.floor(foundPat.estimated_wait_minutes/8) : 0)}')
content = content.replace('{state.sortedWait.findIndex(p => p.id === foundPat.id) + 1}', '{(foundPat.estimated_wait_minutes ? Math.floor(foundPat.estimated_wait_minutes/8)+1 : 1)}')
 
content = content.replace('foundPat.medicines.length > 0', 'false /* prescriptions now separate */')

# 9. Prescriptions Tab replacements
old_rx_jsx = """              {state.done.filter(p => p.medicines.length > 0).length === 0 ? (
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
              )}"""

new_rx_jsx = """              {myPrescriptions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border border-border">
                  <div className="text-4xl mb-2">💊</div>
                  <div className="font-semibold">No prescriptions yet</div>
                  <div className="text-sm mt-1">Your prescriptions will appear here after consultation</div>
                </div>
              ) : (
                myPrescriptions.map((rx: any) => (
                  <div key={rx.id} className="bg-card rounded-2xl border border-border shadow-card p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-bold text-foreground text-sm">
                          Dr. {rx.profiles?.full_name}
                        </div>
                        <div className="text-muted-foreground text-xs mt-0.5">
                          {rx.tokens?.token_number} · {new Date(rx.created_at).toLocaleDateString("en-IN")}
                        </div>
                      </div>
                      {rx.diagnosis && (
                        <BadgeChip className="bg-primary/10 text-primary border border-primary/20">
                          {rx.diagnosis}
                        </BadgeChip>
                      )}
                    </div>
                    <div className="space-y-2">
                      {(rx.prescription_medicines || [])
                        .sort((a: any, b: any) => a.display_order - b.display_order)
                        .map((m: any, i: number) => (
                          <div key={i} className="bg-secondary rounded-xl px-4 py-3 border border-border/30">
                            <div className="font-semibold text-primary text-sm">💊 {m.medicine_name}</div>
                            <div className="text-muted-foreground text-xs mt-0.5">
                              {m.dose} · {m.frequency} · {m.duration_days} days
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))
              )}"""
content = content.replace(old_rx_jsx, new_rx_jsx)

# 10. Profile tab
content = content.replace('{ pTab === "profile" && (', '{pTab === "profile" && (')
content = content.replace("""                <div className="font-bold text-foreground text-lg">Patient User</div>
                <div className="text-muted-foreground text-sm">+91 98765 43210</div>""", """                <div className="font-bold text-foreground text-lg">{profile?.full_name}</div>
                <div className="text-muted-foreground text-sm">{profile?.phone || profile?.email}</div>""")

content = content.replace('state.done.filter(p => p.medicines.length > 0).length.toString()', 'myPrescriptions.length.toString()')
content = content.replace('state.done.length.toString()', 'myTokens.filter((t: any) => t.status === "done").length.toString()')

with open(r'c:\Users\Mehul\Desktop\MediQ Project\mediQ\src\pages\PatientApp.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
