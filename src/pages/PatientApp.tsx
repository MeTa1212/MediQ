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
  ChevronDown,
  Pill,
  Droplets,
  AlertCircle,
} from "lucide-react";
import { usePatientQueue } from "@/hooks/usePatientQueue";
import { useAuth } from "@/hooks/useAuth";

const STATUS_META: Record<string, { badgeClass: string; label?: string }> = {
  waiting:   { badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  serving:   { badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  completed: { badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  skipped:   { badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
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
  const [expandedTokenId, setExpandedTokenId] = useState<string | null>(null);

  const navigate = useNavigate();

  const notify = (msg: string, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleBookToken = async () => {
    if (!selectedDoctor) { notify("Please select a doctor", "err"); return; }
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

  const currentServingToken = issuedToken
    ? myTokens.find((t) => t.doctor_id === issuedToken.doctor_id && t.status === "serving")
    : myTokens.find((t) => t.status === "serving");

  const bottomNav: { id: Tab; label: string; icon: typeof Home }[] = [
    { id: "home",          label: "Home",    icon: Home },
    { id: "book",          label: "Book",    icon: CalendarPlus },
    { id: "status",        label: "Queue",   icon: ListOrdered },
    { id: "prescriptions", label: "Rx",      icon: FileText },
    { id: "profile",       label: "Profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#080e1a] text-white">
      <ToastNotification toast={toast} />

      <div className="mx-auto flex min-h-screen max-w-md flex-col pb-20">

        {/* ── Header ───────────────────────────────────── */}
        <div className="relative border-b border-white/[0.07] bg-[#060b15]">
          {/* Thin blue top accent */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

          <div className="px-5 pb-5 pt-5">
            <div className="mb-4 flex items-center justify-between">
              {/* Brand */}
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 border border-blue-500/20">
                  <Activity className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white/90 leading-none">MediQ</div>
                  <div className="text-[10px] text-white/35 leading-none mt-0.5">Patient App</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button className="relative rounded-lg bg-white/[0.05] p-2 border border-white/[0.07] transition-colors hover:bg-white/[0.08]">
                  <Bell className="h-3.5 w-3.5 text-white/50" />
                  <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-rose-500" />
                </button>
                <Link
                  to="/"
                  className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-medium text-white/40 transition-colors hover:text-white/70"
                >
                  <ArrowLeft className="h-3 w-3" /> Back
                </Link>
              </div>
            </div>

            {/* Live status bar */}
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.04] px-4 py-3">
              <div className="flex-1">
                <div className="text-[10px] text-white/35 mb-0.5">
                  {issuedToken ? "Serving for your Doctor" : "Now Serving"}
                </div>
                <div className="text-sm font-semibold text-white/80 truncate">
                  {currentServingToken
                    ? `${currentServingToken.token_number} — ${currentServingToken.doctor?.full_name || "Patient"}`
                    : "No one currently"}
                </div>
              </div>
              <div className="text-right border-l border-white/[0.07] pl-3 ml-1">
                <div className="text-[10px] text-white/35 mb-0.5">My Appointments</div>
                <div className="text-xl font-bold text-white/90">{myTokens.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ──────────────────────────────────── */}
        <div className="flex-1 space-y-4 px-4 py-5">

          {/* HOME TAB */}
          {pTab === "home" && (
            <div className="space-y-4" style={{ animation: "fadeUp 0.3s ease forwards" }}>
              {/* Welcome card */}
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0f1520] p-6 shadow-[var(--shadow-card)]">
                <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-white/[0.08]" />
                <h2 className="text-base font-semibold text-white/90">
                  Welcome back, {profile?.full_name?.split(" ")[0] || "Patient"}
                </h2>
                <p className="mt-1 text-sm text-white/40">
                  Book clinic tokens and track your wait time in real-time.
                </p>
                <button
                  onClick={() => setPTab("book")}
                  className="mt-5 w-full rounded-xl bg-blue-500/15 border border-blue-500/25 py-3 text-sm font-semibold text-blue-300 transition-all duration-200 hover:bg-blue-500/20 hover:border-blue-500/35 hover:-translate-y-0.5"
                >
                  <CalendarPlus className="mr-2 inline h-4 w-4" />
                  Get New Token
                </button>
              </div>

              {/* Active tokens */}
              {myTokens.length > 0 && (
                <div className="rounded-2xl border border-white/[0.07] bg-[#0f1520] p-5 shadow-[var(--shadow-card)]">
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                    <ListOrdered className="h-3.5 w-3.5" /> Your Active Tokens
                  </h3>
                  <div className="space-y-2.5">
                    {myTokens.slice(0, 2).map((token) => (
                      <div key={token.id} className="rounded-xl bg-white/[0.04] border border-white/[0.07] p-3.5">
                        <div className="flex justify-between items-start mb-1.5">
                          <span className="font-mono text-sm font-semibold text-blue-300">{token.token_number}</span>
                          <BadgeChip className={`${STATUS_META[token.status]?.badgeClass || ""} border text-[10px]`}>
                            {token.status.toUpperCase()}
                          </BadgeChip>
                        </div>
                        <div className="text-[11px] text-white/35">
                          Dr. {token.doctor?.full_name || "General Doctor"}
                        </div>
                        {token.status === "waiting" && (
                          <div className="mt-1.5 text-xs font-medium text-amber-400">
                            {token.estimated_wait_minutes === 0
                              ? "You're next!"
                              : token.estimated_wait_minutes != null
                                ? `~${token.estimated_wait_minutes} min wait`
                                : "Calculating…"}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medicine reminders */}
              {myReminders.length > 0 && (
                <div className="rounded-2xl border border-white/[0.07] bg-[#0f1520] p-5 shadow-[var(--shadow-card)]">
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                    <Bell className="h-3.5 w-3.5" /> Medicine Reminders
                  </h3>
                  <div className="space-y-1">
                    {myReminders.slice(0, 3).map((r) => (
                      <div key={r.id} className="flex items-center gap-3 py-2.5 border-b border-white/[0.05] last:border-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/15">
                          <Pill className="h-3.5 w-3.5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white/80">{r.medicine_name}</div>
                          <div className="text-[11px] text-white/35">{r.dose} · {r.reminder_times.join(", ")}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Health highlights */}
              <div className="rounded-2xl border border-white/[0.07] bg-[#0f1520] p-5">
                <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/35">
                  Health Highlights
                </div>
                <div className="space-y-2.5">
                  {[
                    { icon: <AlertCircle className="h-3.5 w-3.5 text-amber-400" />, tip: "Health alerts for your region will appear here." },
                    { icon: <Droplets className="h-3.5 w-3.5 text-blue-400" />,   tip: "Remember to stay hydrated throughout the day." },
                  ].map((h, i) => (
                    <div key={i} className="flex items-start gap-3 border-b border-white/[0.05] pb-2.5 last:border-0 last:pb-0">
                      <div className="mt-0.5 shrink-0">{h.icon}</div>
                      <div className="text-xs leading-relaxed text-white/45">{h.tip}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* BOOK TAB */}
          {pTab === "book" && !issuedToken && (
            <div className="space-y-5 px-1" style={{ animation: "fadeUp 0.3s ease forwards" }}>
              <div>
                <h2 className="text-lg font-semibold text-white/90">Book Your Token</h2>
                <p className="text-sm text-white/40 mt-1">Skip the waiting room. Book from home.</p>
              </div>

              <div className="space-y-5">
                {/* Doctor Selection */}
                <div>
                  <label className="mb-2.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Select Doctor
                  </label>
                  <div className="grid gap-2">
                    {doctors.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-white/[0.10] p-5 text-center text-xs text-white/30">
                        No doctors available currently
                      </div>
                    ) : (
                      doctors.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => setSelectedDoctor(d.id)}
                          className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all duration-150 ${
                            selectedDoctor === d.id
                              ? "border-blue-500/40 bg-blue-500/10"
                              : "border-white/[0.08] bg-[#0f1520] hover:border-white/[0.14]"
                          }`}
                        >
                          <div>
                            <div className="text-sm font-semibold text-white/90">{d.full_name}</div>
                            <div className="text-[11px] text-white/40 mt-0.5">{d.specialty} · {d.clinic_name || "MediQ Clinic"}</div>
                          </div>
                          {selectedDoctor === d.id && (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                              <div className="h-2 w-2 rounded-full bg-white" />
                            </div>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Symptom Tags */}
                <div>
                  <label className="mb-2.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Chief Complaint
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {loadingTags ? (
                      <div className="flex gap-2">
                        {[1, 2, 3].map((i) => (<div key={i} className="h-8 w-20 rounded-full bg-white/[0.05] animate-pulse" />))}
                      </div>
                    ) : (
                      symptomTags.map((tag) => {
                        const isSelected = selectedTags.includes(tag.label);
                        return (
                          <button
                            key={tag.id}
                            onClick={() =>
                              setSelectedTags((prev) =>
                                isSelected ? prev.filter((t) => t !== tag.label) : [...prev, tag.label]
                              )
                            }
                            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-all duration-150 ${
                              isSelected
                                ? tag.is_emergency
                                  ? "border-rose-500/40 bg-rose-500/15 text-rose-300"
                                  : "border-blue-500/40 bg-blue-500/15 text-blue-300"
                                : "border-white/[0.08] bg-[#0f1520] text-white/50 hover:border-white/[0.14] hover:text-white/70"
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
                  <label className="mb-2.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Additional Details
                  </label>
                  <textarea
                    placeholder="Describe how you're feeling…"
                    value={customSymptoms}
                    onChange={(e) => setCustomSymptoms(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-white/[0.08] bg-[#0f1520] px-4 py-3 text-sm text-white/80 placeholder:text-white/25 outline-none transition-colors focus:border-blue-500/40 resize-none"
                  />
                </div>

                <button
                  onClick={handleBookToken}
                  disabled={booking || !selectedDoctor}
                  className="w-full rounded-xl bg-blue-500/15 border border-blue-500/30 py-4 text-sm font-semibold text-blue-300 transition-all duration-200 hover:bg-blue-500/22 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
                >
                  {booking ? "Confirming…" : "Generate Token →"}
                </button>
              </div>
            </div>
          )}

          {/* ISSUED TOKEN VIEW */}
          {pTab === "book" && issuedToken && (
            <div className="space-y-5 text-center py-4" style={{ animation: "fadeUp 0.3s ease forwards" }}>
              {/* Token display */}
              <div className="mx-auto flex h-32 w-32 flex-col items-center justify-center rounded-3xl border border-blue-500/25 bg-blue-500/12">
                <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-blue-400/60 mb-1">Token</span>
                <span className="text-3xl font-bold text-blue-300">{issuedToken.token_number}</span>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white/90">Successfully Booked</h2>
                <p className="text-sm text-white/40 mt-1">Visit MediQ Clinic today</p>
              </div>

              <div className="rounded-2xl border border-blue-500/15 bg-blue-500/8 p-6 mx-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-400/60 mb-1">Estimated Wait</div>
                {issuedToken.estimated_wait_minutes === 0 ? (
                  <div className="text-2xl font-bold text-emerald-400">You're next!</div>
                ) : (
                  <div className="text-4xl font-bold text-blue-300">~{issuedToken.estimated_wait_minutes ?? "—"} min</div>
                )}
                <div className="text-[10px] text-white/30 mt-2">May change based on urgency</div>
              </div>

              <div className="grid grid-cols-2 gap-3 px-2">
                <div className="rounded-xl border border-white/[0.07] bg-[#0f1520] p-4">
                  <div className="text-[10px] text-white/30 uppercase font-semibold tracking-wider mb-1">Status</div>
                  <div className="text-sm font-semibold text-white/80">Waitlisted</div>
                </div>
                <div className="rounded-xl border border-white/[0.07] bg-[#0f1520] p-4">
                  <div className="text-[10px] text-white/30 uppercase font-semibold tracking-wider mb-1">Date</div>
                  <div className="text-sm font-semibold text-white/80">
                    {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 px-4 mt-4">
                <button
                  onClick={() => { setIssuedToken(null); setPTab("status"); }}
                  className="w-full rounded-xl border border-white/[0.10] bg-white/[0.06] py-3.5 text-sm font-semibold text-white/80 transition-all hover:bg-white/[0.08]"
                >
                  Track Live Queue
                </button>
                <button
                  onClick={() => { setIssuedToken(null); setSelectedDoctor(""); setSelectedTags([]); setCustomSymptoms(""); }}
                  className="w-full rounded-xl border border-white/[0.07] py-3.5 text-sm font-medium text-white/40 transition-colors hover:text-white/60"
                >
                  Book for Family Member
                </button>
              </div>
            </div>
          )}

          {/* STATUS TAB */}
          {pTab === "status" && (
            <div className="space-y-4" style={{ animation: "fadeUp 0.3s ease forwards" }}>
              <h2 className="text-base font-semibold text-white/90">Live Queue</h2>

              <div className="flex gap-2">
                <input
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchPatient()}
                  placeholder="Enter token number (e.g. MQ-001)"
                  className="flex-1 rounded-xl border border-white/[0.08] bg-[#0f1520] px-4 py-3 text-sm text-white/80 placeholder:text-white/25 outline-none focus:border-blue-500/40"
                />
                <button
                  onClick={searchPatient}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.05] px-4 py-3 text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white/80"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>

              {foundPat === "notfound" && (
                <div className="rounded-2xl border border-dashed border-white/[0.08] py-12 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.04] mb-3">
                    <Search className="h-5 w-5 text-white/20" />
                  </div>
                  <div className="text-sm font-medium text-white/50">Token Not Found</div>
                  <p className="text-xs text-white/25 mt-1">Double check your input</p>
                </div>
              )}

              {foundPat && foundPat !== "notfound" && (
                <div className="rounded-2xl border border-white/[0.07] bg-[#0f1520] p-5 shadow-[var(--shadow-card)]" style={{ animation: "fadeUp 0.25s ease forwards" }}>
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <div className="text-base font-semibold text-white/90">{foundPat.token_number}</div>
                      <div className="text-xs text-white/35 mt-0.5">{foundPat.doctor?.full_name || "Registered Patient"}</div>
                    </div>
                    <BadgeChip className={`${STATUS_META[foundPat.status]?.badgeClass || ""} border text-[10px]`}>
                      {foundPat.status.toUpperCase()}
                    </BadgeChip>
                  </div>

                  {foundPat.status === "waiting" && (
                    <div className="space-y-3">
                      <div className="rounded-xl border border-amber-500/15 bg-amber-500/8 p-4 text-center">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/60">Estimated Wait</div>
                        {foundPat.estimated_wait_minutes === 0 ? (
                          <div className="text-xl font-bold text-emerald-400 mt-1">You're next!</div>
                        ) : (
                          <div className="text-2xl font-bold text-amber-400 mt-1">
                            {foundPat.estimated_wait_minutes != null ? `~${foundPat.estimated_wait_minutes} min` : "—"}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] border border-white/[0.07] p-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/15">
                          <User className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white/80">Dr. {foundPat.doctor?.full_name || "Assigned Doctor"}</div>
                          <div className="text-[10px] text-white/35">{foundPat.doctor?.specialty || "General Physician"}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {foundPat.status === "serving" && (
                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-5 text-center">
                      <div className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">It's Your Turn!</div>
                      <p className="text-[11px] text-blue-400/70">Please proceed to the doctor's cabin</p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/35 mb-3 px-1">Your Queue & History</h3>
                <div className="space-y-2">
                  {myTokens.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/[0.08] p-8 text-center text-xs text-white/25 uppercase tracking-widest">
                      No history yet
                    </div>
                  ) : (
                    myTokens.map((t) => {
                      const isExpanded = expandedTokenId === t.id;
                      const isActive = t.status === "waiting" || t.status === "serving";
                      return (
                        <div key={t.id} className="rounded-xl bg-[#0f1520] border border-white/[0.07] overflow-hidden">
                          <button
                            onClick={() => setExpandedTokenId(isExpanded ? null : t.id)}
                            className="flex items-center justify-between w-full p-4 text-left transition-colors hover:bg-white/[0.02]"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold ${
                                isActive ? "bg-blue-500/10 border-blue-500/20 text-blue-300" : "bg-white/[0.05] border-white/[0.07] text-white/60"
                              }`}>
                                {t.token_number.split("-")[1] || t.token_number}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-white/80">
                                  {t.token_number}
                                  <BadgeChip className={`ml-2 ${STATUS_META[t.status]?.badgeClass || STATUS_META["waiting"]?.badgeClass} border text-[9px]`}>
                                    {t.status === "done" ? "COMPLETED" : t.status.toUpperCase()}
                                  </BadgeChip>
                                </div>
                                <div className="text-[10px] text-white/30 mt-0.5">Dr. {t.doctor?.full_name || "Clinic Doctor"} · {new Date(t.created_at).toLocaleDateString()}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isActive && (
                                <span className="text-xs font-semibold text-amber-400">
                                  {t.status === "serving" ? "Your turn!" : t.estimated_wait_minutes === 0 ? "Next!" : `~${t.estimated_wait_minutes ?? 0} min`}
                                </span>
                              )}
                              <ChevronDown className={`h-4 w-4 text-white/20 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="px-4 pb-4 pt-1 border-t border-white/[0.05] space-y-2.5" style={{ animation: "fadeUp 0.2s ease forwards" }}>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
                                  <div className="text-[9px] text-white/30 uppercase font-semibold tracking-wider">Doctor</div>
                                  <div className="text-xs font-medium text-white/80 mt-0.5">Dr. {t.doctor?.full_name || "Clinic Doctor"}</div>
                                  <div className="text-[10px] text-white/35">{t.doctor?.specialty || "General Physician"}</div>
                                </div>
                                <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
                                  <div className="text-[9px] text-white/30 uppercase font-semibold tracking-wider">Token</div>
                                  <div className="text-xs font-semibold text-blue-300 mt-0.5">{t.token_number}</div>
                                  <div className="text-[10px] text-white/35">Priority: {t.priority}</div>
                                </div>
                                <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
                                  <div className="text-[9px] text-white/30 uppercase font-semibold tracking-wider">Date</div>
                                  <div className="text-xs font-medium text-white/80 mt-0.5">{new Date(t.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                                  <div className="text-[10px] text-white/35">{new Date(t.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
                                </div>
                                <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
                                  <div className="text-[9px] text-white/30 uppercase font-semibold tracking-wider">Est. Wait</div>
                                  {t.status === "serving" ? (
                                    <div className="text-xs font-semibold text-emerald-400 mt-0.5">Your turn!</div>
                                  ) : t.status === "waiting" ? (
                                    <div className="text-xs font-semibold text-amber-400 mt-0.5">
                                      {t.estimated_wait_minutes === 0 ? "You're next!" : `~${t.estimated_wait_minutes ?? 0} min`}
                                    </div>
                                  ) : (
                                    <div className="text-xs font-medium text-white/50 mt-0.5">
                                      {t.completed_at ? new Date(t.completed_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                                    </div>
                                  )}
                                  <div className="text-[10px] text-white/35">{t.status === "done" ? "Completed" : "Live estimate"}</div>
                                </div>
                              </div>
                              {t.status === "serving" && (
                                <div className="rounded-lg border border-blue-500/20 bg-blue-500/8 p-3 text-center">
                                  <div className="text-xs font-semibold text-blue-300">Please proceed to the doctor's cabin</div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PRESCRIPTIONS TAB */}
          {pTab === "prescriptions" && (
            <div className="space-y-4" style={{ animation: "fadeUp 0.3s ease forwards" }}>
              <h2 className="text-base font-semibold text-white/90">My Prescriptions</h2>

              {myPrescriptions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] py-14 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.05] mb-3">
                    <Pill className="h-5 w-5 text-white/20" />
                  </div>
                  <div className="text-sm font-medium text-white/50">No Prescriptions Yet</div>
                  <p className="mt-1.5 text-xs text-white/25 px-10">After your visit, your doctor's prescriptions will appear here.</p>
                </div>
              ) : (
                myPrescriptions.map((rx) => (
                  <div key={rx.id} className="rounded-2xl border border-white/[0.07] bg-[#0f1520] p-6 shadow-[var(--shadow-card)]">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <div className="text-sm font-semibold text-white/90">Dr. {rx.doctor_name || "Clinic Doctor"}</div>
                        <div className="text-[10px] text-white/35 mt-0.5 uppercase font-medium tracking-wider">
                          {rx.token_number} · {new Date(rx.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </div>
                      {rx.diagnosis && (
                        <BadgeChip className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px]">
                          {rx.diagnosis}
                        </BadgeChip>
                      )}
                    </div>

                    <div className="space-y-2">
                      {rx.prescription_medicines.map((m, i) => (
                        <div key={i} className="rounded-xl border border-white/[0.07] bg-white/[0.04] px-4 py-3">
                          <div className="flex items-center gap-2 text-sm font-semibold text-blue-300">
                            <Pill className="h-3.5 w-3.5" />
                            {m.medicine_name}
                          </div>
                          <div className="mt-1 text-[11px] text-white/35 flex items-center gap-2">
                            <span>{m.dose}</span>
                            <span className="text-white/20">·</span>
                            <span>{m.frequency}</span>
                            <span className="text-white/20">·</span>
                            <span className="font-medium text-white/50">{m.duration_days}d</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {rx.notes && (
                      <div className="mt-4 pt-4 border-t border-white/[0.07]">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-1">Doctor's Advice</div>
                        <p className="text-xs text-white/55 italic leading-relaxed">{rx.notes}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* PROFILE TAB */}
          {pTab === "profile" && (
            <div className="space-y-4" style={{ animation: "fadeUp 0.3s ease forwards" }}>
              {/* Profile card */}
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0f1520] p-6 text-center shadow-[var(--shadow-card)]">
                <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-white/[0.10]" />
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/15 border border-blue-500/20 text-2xl font-bold text-blue-300">
                  {profile?.full_name?.charAt(0).toUpperCase() || "P"}
                </div>
                <div className="text-base font-semibold text-white/90">{profile?.full_name || "Patient User"}</div>
                <div className="mt-1.5 inline-block rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs text-white/40">
                  {profile?.phone || profile?.email || "No contact info"}
                </div>
              </div>

              {/* Stats list */}
              <div className="rounded-2xl border border-white/[0.07] bg-[#0f1520] divide-y divide-white/[0.05] shadow-[var(--shadow-card)]">
                {[
                  { label: "Active Tokens",    value: myTokens.filter((t) => t.status === "waiting").length, icon: ListOrdered },
                  { label: "Family Profiles",  value: "Available", icon: User },
                  { label: "Clinic Location",  value: "Nearby",    icon: MapPin },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.07]">
                        <item.icon className="h-3.5 w-3.5 text-white/40" />
                      </div>
                      <span className="text-sm text-white/60">{item.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-blue-300">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Sign out */}
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] py-3.5 text-sm font-medium text-rose-400 transition-colors hover:bg-rose-500/[0.10]"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          )}
        </div>

        {/* ── Bottom Navigation ─────────────────────────── */}
        <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 border-t border-white/[0.07] bg-[#060b15]/95 backdrop-blur-xl">
          <div className="flex items-center justify-around py-2 px-2">
            {bottomNav.map((item) => {
              const isActive = pTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setPTab(item.id)}
                  className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-2 transition-all duration-200 ${
                    isActive ? "text-blue-400" : "text-white/30 hover:text-white/55"
                  }`}
                >
                  {/* Active pill indicator */}
                  <div className={`mb-1 h-0.5 w-4 rounded-full transition-all duration-200 ${isActive ? "bg-blue-400" : "bg-transparent"}`} />
                  <item.icon className="h-[18px] w-[18px]" />
                  <span className={`text-[10px] font-medium leading-none mt-0.5 ${isActive ? "opacity-100" : "opacity-60"}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PatientApp;
