import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  Search,
  Home,
  CalendarPlus,
  ListOrdered,
  FileText,
  User,
  Bell,
  Clock,
  Calendar,
  LogOut,
  MapPin,
  ChevronRight,
  Pill,
  Droplets,
  AlertCircle,
} from "lucide-react";
import { usePatientQueue } from "@/hooks/usePatientQueue";
import { useAuth } from "@/hooks/useAuth";
const STATUS_META: Record<string, { badgeClass: string; label?: string }> = {
  waiting: { badgeClass: "bg-warning/10 text-warning border-warning/20" },
  serving: { badgeClass: "bg-primary/10 text-primary border-primary/20" },
  completed: { badgeClass: "bg-success/10 text-success border-success/20" },
  skipped: { badgeClass: "bg-destructive/10 text-destructive border-destructive/20" },
};
import { ToastNotification } from "@/components/ToastNotification";
import { BadgeChip } from "@/components/BadgeChip";

type Tab = "home" | "book" | "status" | "prescriptions" | "profile";

const PatientApp = () => {
  const { profile, logout } = useAuth();
  const {
    bookToken,
    booking,
    myTokens,
    fetchMyTokens,
    myPrescriptions,
    fetchMyPrescriptions,
    myReminders,
    fetchMyReminders,
    symptomTags,
    loadingTags,
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

  const navigate = useNavigate();

  const notify = (msg: string, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleBookToken = async () => {
    if (!selectedDoctor) {
      notify("Please select a doctor", "err");
      return;
    }
    if (selectedTags.length === 0 && !customSymptoms.trim()) {
      notify("Please select at least one symptom or describe it", "err");
      return;
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
    if (!q) return;

    const p = myTokens.find(
      (x) => x.token_number.toLowerCase() === q || x.id === q
    );
    setFoundPat(p || "notfound");
    if (!p) notify("No matching token found today", "err");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Find currently serving token for the selected doctor (or first token's doctor)
  const currentServingToken = issuedToken 
    ? myTokens.find(t => t.doctor_id === issuedToken.doctor_id && t.status === "serving")
    : myTokens.find(t => t.status === "serving");

  const bottomNav: { id: Tab; label: string; icon: typeof Home }[] = [
    { id: "home", label: "Home", icon: Home },
    { id: "book", label: "Book", icon: CalendarPlus },
    { id: "status", label: "Queue", icon: ListOrdered },
    { id: "prescriptions", label: "Rx", icon: FileText },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#08111f] text-white">
      <ToastNotification toast={toast} />

      <div className="mx-auto flex min-h-screen max-w-md flex-col pb-20">
        {/* Header */}
        <div className="gradient-primary relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute -right-10 -top-10 h-48 w-48 rounded-full opacity-10"
              style={{
                background: "radial-gradient(circle, white, transparent)",
              }}
            />
          </div>
          <div className="relative px-5 pb-6 pt-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-card/20 backdrop-blur">
                  <Activity className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-xl font-extrabold tracking-tight text-primary-foreground">
                    MediQ
                  </div>
                  <div className="-mt-0.5 text-xs text-primary-foreground/60">
                    Patient App
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="relative rounded-xl bg-card/10 p-2 backdrop-blur">
                  <Bell className="h-4 w-4 text-primary-foreground" />
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
                </button>
                <Link
                  to="/"
                  className="flex items-center gap-1 rounded-lg border border-primary-foreground/20 px-3 py-1.5 text-xs text-primary-foreground/60 transition-colors hover:text-primary-foreground"
                >
                  <ArrowLeft className="h-3 w-3" /> Back
                </Link>
              </div>
            </div>

            {/* Live Status Bar */}
            <div className="flex items-center gap-3 rounded-2xl bg-card/10 px-4 py-3 backdrop-blur-sm">
              <div className="flex-1">
                <div className="text-xs text-primary-foreground/60">
                  {issuedToken ? `Serving for your Doctor` : "Now Serving (Global)"}
                </div>
                <div className="text-sm font-bold text-primary-foreground truncate">
                  {currentServingToken 
                    ? `${currentServingToken.token_number} — ${currentServingToken.doctor?.full_name || "Patient"}`
                    : "No one currently"}
                </div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-xs text-primary-foreground/60">My Appointments</div>
                <div className="text-xl font-extrabold text-primary-foreground">
                  {myTokens.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4 px-5 py-5">
          {/* HOME TAB */}
          {pTab === "home" && (
            <div className="animate-fade-up space-y-4">
              <div className="relative rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_16px_40px_rgba(0,0,0,0.16)] backdrop-blur-xl">
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(255,255,255,0.08),rgba(255,255,255,0.015))] pointer-events-none rounded-[28px]" />
                <h2 className="text-xl font-bold text-white relative">
                  Welcome, {profile?.full_name?.split(" ")[0] || "Patient"}!
                </h2>
                <p className="mt-1.5 text-sm text-white/60 relative">
                  Easily book clinic tokens and monitor your wait time in real-time.
                </p>
                <button
                  onClick={() => setPTab("book")}
                  className="gradient-primary mt-4 w-full rounded-xl py-3 text-sm font-bold text-primary-foreground shadow-md transition-all hover:shadow-lg"
                >
                  <CalendarPlus className="mr-2 inline h-4 w-4" /> Get New Token
                </button>
              </div>

              {myTokens.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
                    <ListOrdered className="h-4 w-4 text-primary" /> Your Active Tokens
                  </h3>
                  <div className="space-y-3">
                    {myTokens.slice(0, 2).map((token) => (
                      <div key={token.id} className="bg-secondary/50 rounded-xl p-3 border border-border/30">
                        <div className="flex justify-between items-start mb-2">
                           <span className="font-mono font-bold text-primary">{token.token_number}</span>
                           <BadgeChip className={STATUS_META[token.status]?.badgeClass || ""}>
                             {token.status.toUpperCase()}
                           </BadgeChip>
                        </div>
                        <div className="text-xs text-muted-foreground">
                           Doctor: {token.doctor?.full_name || "General Doctor"}
                        </div>
                        {token.status === "waiting" && (
                          <div className="mt-2 text-xs font-semibold text-warning">
                            Estimated wait: ~{token.estimated_wait_minutes || "—"} mins
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {myReminders.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
                    <Bell className="h-4 w-4 text-primary" /> Medicine Reminders
                  </h3>
                  <div className="space-y-2">
                    {myReminders.slice(0, 3).map((r) => (
                      <div key={r.id} className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0 font-medium">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Pill className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-white/90">{r.medicine_name}</div>
                          <div className="text-xs text-white/40">{r.dose} • {r.reminder_times.join(", ")}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-border bg-secondary p-4">
                <div className="mb-3 text-sm font-semibold text-foreground/80">
                  Health Highlights
                </div>
                <div className="space-y-3">
                  {[
                    {
                      icon: <AlertCircle className="w-4 h-4 text-amber-400" />,
                      tip: "Health alerts for your region will appear here.",
                    },
                    {
                      icon: <Droplets className="w-4 h-4 text-blue-400" />,
                      tip: "Remember to stay hydrated throughout the day.",
                    },
                  ].map((h, i) => (
                    <div key={i} className="flex items-start gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                      <div className="mt-0.5">{h.icon}</div>
                      <div className="text-xs leading-relaxed text-white/60">
                        {h.tip}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* BOOK TAB */}
          {pTab === "book" && !issuedToken && (
            <div className="animate-fade-up space-y-5 px-1">
              <div>
                 <h2 className="text-xl font-bold text-foreground">Book Your Token</h2>
                 <p className="text-sm text-muted-foreground mt-1">Skip the waiting room. Book from home.</p>
              </div>

              <div className="space-y-4">
                {/* Doctor Selection */}
                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Select Doctor
                  </label>
                  <div className="grid gap-2">
                    {doctors.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                        No doctors available currently
                      </div>
                    ) : (
                      doctors.map(d => (
                        <button
                          key={d.id}
                          onClick={() => setSelectedDoctor(d.id)}
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                            selectedDoctor === d.id 
                              ? "bg-primary/10 border-primary shadow-sm" 
                              : "bg-card border-border hover:border-primary/40"
                          }`}
                        >
                          <div className="text-left">
                            <div className="font-bold text-foreground text-sm">{d.full_name}</div>
                            <div className="text-[11px] text-muted-foreground">{d.specialty} · {d.clinic_name || "MediQ Clinic"}</div>
                          </div>
                          {selectedDoctor === d.id && <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white"/></div>}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Symptom Tags */}
                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Chief Complaint (Symptoms)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {loadingTags ? (
                       <div className="flex gap-2">
                         {[1,2,3].map(i => <div key={i} className="h-8 w-20 rounded-full bg-secondary animate-pulse"/>)}
                       </div>
                    ) : (
                      symptomTags.map(tag => {
                        const isSelected = selectedTags.includes(tag.label);
                        return (
                          <button
                            key={tag.id}
                            onClick={() => setSelectedTags(prev => 
                              isSelected ? prev.filter(t => t !== tag.label) : [...prev, tag.label]
                            )}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all ${
                              isSelected
                                ? tag.is_emergency
                                  ? "bg-destructive/20 border-destructive text-destructive shadow-sm"
                                  : "bg-primary border-primary text-primary-foreground shadow-md -translate-y-0.5"
                                : "bg-card border-border text-muted-foreground hover:border-primary/30"
                            }`}
                          >
                            <span>{tag.emoji}</span>
                            <span>{tag.label}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Custom Symptoms */}
                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                    Additional Details
                  </label>
                  <textarea
                    placeholder="Describe how you're feeling..."
                    value={customSymptoms}
                    onChange={(e) => setCustomSymptoms(e.target.value)}
                    rows={3}
                    className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <button
                  onClick={handleBookToken}
                  disabled={booking || !selectedDoctor}
                  className="gradient-primary w-full rounded-2xl py-4 text-base font-bold text-primary-foreground shadow-lg transition-all hover:scale-[1.01] disabled:opacity-50"
                >
                  {booking ? "Confirming Booking..." : "Generate Token →"}
                </button>
              </div>
            </div>
          )}

          {/* ISSUED TOKEN VIEW */}
          {pTab === "book" && issuedToken && (
            <div className="animate-fade-up space-y-6 text-center py-4">
              <div className="mx-auto w-32 h-32 rounded-3xl gradient-primary flex flex-col items-center justify-center shadow-2xl">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/60 mb-1">Token</span>
                 <span className="text-3xl font-extrabold text-primary-foreground">{issuedToken.token_number}</span>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground">Successfully Booked!</h2>
                <p className="text-muted-foreground text-sm mt-1">Visit MediQ Clinic today</p>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 mx-2">
                 <div className="text-xs font-semibold text-primary/70 uppercase tracking-wide mb-1">Clinic In-Time</div>
                 <div className="text-4xl font-black text-primary">~{issuedToken.estimated_wait_minutes || "25"} min</div>
                 <div className="text-[10px] text-muted-foreground mt-2 italic font-medium">Estimated wait may change based on urgency</div>
              </div>

              <div className="grid grid-cols-2 gap-3 px-2">
                <div className="bg-secondary/80 rounded-2xl p-4 border border-border/40">
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Status</div>
                  <div className="font-bold text-foreground text-sm">Waitlisted</div>
                </div>
                <div className="bg-secondary/80 rounded-2xl p-4 border border-border/40">
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Clinic Date</div>
                  <div className="font-bold text-foreground text-sm">{new Date().toLocaleDateString('en-IN', {day:'numeric', month:'short'})}</div>
                </div>
              </div>

              <div className="space-y-3 px-4 mt-6">
                <button
                  onClick={() => { setIssuedToken(null); setPTab("status"); }}
                  className="w-full py-4 rounded-2xl bg-foreground text-background font-bold text-sm shadow-md"
                >
                  Track Live Queue
                </button>
                <button
                  onClick={() => { setIssuedToken(null); setSelectedDoctor(""); setSelectedTags([]); setCustomSymptoms(""); }}
                  className="w-full py-4 rounded-2xl border border-border text-muted-foreground font-semibold text-sm hover:bg-secondary/50"
                >
                  Book for Family Member
                </button>
              </div>
            </div>
          )}

          {/* STATUS TAB */}
          {pTab === "status" && (
            <div className="animate-fade-up space-y-4">
              <h2 className="text-lg font-bold text-foreground">Live Queue</h2>
              
              <div className="flex gap-2">
                <input
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchPatient()}
                  placeholder="Enter token number (e.g. MQ-001)"
                  className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  onClick={searchPatient}
                  className="gradient-primary rounded-xl px-4 py-3 text-primary-foreground shadow-sm"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>

              {foundPat === "notfound" && (
                <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center text-white/40">
                  <div className="mx-auto w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Search className="w-6 h-6 opacity-20" />
                  </div>
                  <div className="font-bold text-white/80">Token Not Found</div>
                  <p className="text-xs px-10 mt-1 uppercase tracking-wide opacity-60">Double check your input or visit history</p>
                </div>
              )}

              {foundPat && foundPat !== "notfound" && (
                <div className="animate-fade-up rounded-2xl border border-border bg-card p-5 shadow-card">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <div className="text-lg font-bold text-foreground">
                        {foundPat.token_number}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase font-semibold">
                        {foundPat.doctor?.full_name || "Registered Patient"}
                      </div>
                    </div>
                    <BadgeChip className={STATUS_META[foundPat.status]?.badgeClass || ""}>
                      {foundPat.status.toUpperCase()}
                    </BadgeChip>
                  </div>

                  {foundPat.status === "waiting" && (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-warning/20 bg-warning/5 p-4 text-center">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-warning/80">
                          Estimated Wait
                        </div>
                        <div className="text-3xl font-black text-warning">
                          ~{foundPat.estimated_wait_minutes || "—"} min
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-secondary/50 rounded-xl p-3 border border-border/30">
                         <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><User className="w-5 h-5"/></div>
                         <div className="flex-1">
                            <div className="text-xs font-bold text-foreground">Dr. {foundPat.doctor?.full_name || "Assigned Doctor"}</div>
                            <div className="text-[10px] text-muted-foreground">{foundPat.doctor?.specialty || "General Physician"}</div>
                         </div>
                      </div>
                    </div>
                  )}

                  {foundPat.status === "serving" && (
                     <div className="rounded-2xl border border-primary/20 bg-primary/10 p-5 text-center animate-pulse-soft">
                        <div className="text-xs font-black uppercase tracking-widest text-primary mb-1">It's Your Turn!</div>
                        <p className="text-xs text-primary/80">Please proceed to the doctor's cabin</p>
                     </div>
                  )}
                </div>
              )}

              <div className="mt-8">
                 <h3 className="text-sm font-bold text-foreground mb-3 px-1">Your Patient History</h3>
                 <div className="space-y-3">
                   {myTokens.length === 0 ? (
                      <div className="p-10 text-center text-xs text-muted-foreground border border-border/50 rounded-2xl uppercase tracking-widest">No history yet</div>
                   ) : (
                     myTokens.map(t => (
                       <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/50">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-xs">{t.token_number.split('-')[1]}</div>
                             <div>
                                <div className="text-sm font-bold text-foreground capitalize">{t.status}</div>
                                <div className="text-[10px] text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</div>
                             </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground/30"/>
                       </div>
                     ))
                   )}
                 </div>
              </div>
            </div>
          )}

          {/* PRESCRIPTIONS TAB */}
          {pTab === "prescriptions" && (
            <div className="animate-fade-up space-y-4">
              <h2 className="text-lg font-bold text-foreground">My Prescriptions</h2>
              {myPrescriptions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 py-16 text-center text-white/40">
                  <div className="mx-auto w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Pill className="w-6 h-6 opacity-20" />
                  </div>
                  <div className="font-bold text-white/80">No Prescriptions Yet</div>
                  <p className="mt-2 text-xs px-12 opacity-60">After your visit is complete, your doctor's prescriptions will show up here.</p>
                </div>
              ) : (
                myPrescriptions.map((rx) => (
                  <div key={rx.id} className="rounded-3xl border border-border bg-card p-6 shadow-card">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <div className="text-base font-black text-foreground">
                          Dr. {rx.doctor_name || "Clinic Doctor"}
                        </div>
                        <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-0.5">
                          {rx.token_number} ·{" "}
                          {new Date(rx.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                      {rx.diagnosis && (
                        <BadgeChip className="bg-primary/10 text-primary border-primary/20">
                          {rx.diagnosis}
                        </BadgeChip>
                      )}
                    </div>
                    <div className="space-y-2.5">
                      {rx.prescription_medicines.map((m, i) => (
                        <div key={i} className="rounded-2xl border border-border/40 bg-secondary/80 px-4 py-3 shadow-sm hover:shadow-md transition-all">
                          <div className="font-bold text-primary text-sm flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px]"><Pill className="w-3 h-3 text-primary" /></span>
                            {m.medicine_name}
                          </div>
                          <div className="mt-1 text-[11px] text-muted-foreground flex items-center gap-3">
                            <span>{m.dose}</span>
                            <span className="w-1 h-1 rounded-full bg-border"/>
                            <span>{m.frequency}</span>
                            <span className="w-1 h-1 rounded-full bg-border"/>
                            <span className="font-semibold">{m.duration_days} days</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {rx.notes && (
                       <div className="mt-4 pt-4 border-t border-border/30">
                          <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Doctor's Advice</div>
                          <p className="text-xs text-foreground/80 italic">{rx.notes}</p>
                       </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* PROFILE TAB */}
          {pTab === "profile" && (
            <div className="animate-fade-up space-y-4">
              <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-card relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/5 via-primary to-primary/5"/>
                <div className="gradient-primary mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full text-3xl font-black text-primary-foreground shadow-xl ring-4 ring-card">
                  {profile?.full_name?.charAt(0).toUpperCase() || "P"}
                </div>
                <div className="text-xl font-black text-foreground">
                  {profile?.full_name || "Patient User"}
                </div>
                <div className="text-sm font-medium text-muted-foreground bg-secondary/50 rounded-full px-4 py-1 inline-block mt-2">
                  {profile?.phone || profile?.email || "No contact info"}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-3 shadow-card divide-y divide-border/20">
                {[
                  { label: "Active Tokens", value: myTokens.filter(t => t.status === 'waiting').length, icon: ListOrdered },
                  { label: "Family Profiles", value: "Available", icon: User },
                  { label: "Clinic Location", value: "Nearby", icon: MapPin },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4 px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground"><item.icon className="w-4 h-4"/></div>
                      <span className="text-sm font-semibold text-foreground/80">{item.label}</span>
                    </div>
                    <span className="text-sm font-black text-primary">{item.value}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 py-4 text-sm font-bold text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 border-t border-white/10 bg-[#08111f]/80 backdrop-blur-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
          <div className="flex items-center justify-around py-2">
            {bottomNav.map((item) => (
              <button
                key={item.id}
                onClick={() => setPTab(item.id)}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-2 transition-all duration-300 ${
                  pTab === item.id ? "text-primary scale-110" : "text-muted-foreground hover:bg-secondary/50"
                }`}
              >
                <item.icon className={`h-5 w-5 ${pTab === item.id ? "fill-primary/10" : ""}`} />
                <span className={`text-[10px] font-bold ${pTab === item.id ? "opacity-100" : "opacity-60"}`}>{item.label}</span>
                {pTab === item.id && (
                  <div className="bg-primary mt-1 h-1 w-1 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientApp;

