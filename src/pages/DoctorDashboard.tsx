import { useState } from "react";
import {
  Activity,
  LayoutDashboard,
  ListOrdered,
  FileText,
  BarChart3,
  Bug,
  Calendar,
  Bell,
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  Settings,
  ClipboardList,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQueue, type QueuePatient } from "@/hooks/useQueue";
import { ToastNotification } from "@/components/ToastNotification";
import RealPrescriptionModal from "@/components/RealPrescriptionModal";
import { MedicalLoader } from "@/components/MedicalLoader";
import { OverviewTab } from "@/components/doctor/OverviewTab";
import { QueueTab } from "@/components/doctor/QueueTab";
import { PrescriptionsTab } from "@/components/doctor/PrescriptionsTab";
import { AnalyticsTab } from "@/components/doctor/AnalyticsTab";
import { OutbreakTab } from "@/components/doctor/OutbreakTab";
import { AppointmentsTab } from "@/components/doctor/AppointmentsTab";
import { PatientsTab } from "@/components/doctor/PatientsTab";
import { SettingsTab } from "@/components/doctor/SettingsTab";
import { PrescriptionGeneratorTab } from "@/components/doctor/PrescriptionGeneratorTab";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { id: "overview",      label: "Dashboard",       icon: LayoutDashboard },
  { id: "appointments",  label: "Appointments",     icon: Calendar },
  { id: "patients",      label: "Patients",         icon: Users },
  { id: "queue",         label: "Queue",            icon: ListOrdered },
  { id: "prescriptions", label: "Prescriptions",    icon: FileText },
  { id: "rx-generator",  label: "Rx Generator",     icon: ClipboardList },
  { id: "analytics",     label: "Reports",          icon: BarChart3 },
  { id: "outbreak",      label: "Outbreak",         icon: Bug },
  { id: "settings",      label: "Settings",         icon: Settings },
];

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rxPatient, setRxPatient] = useState<QueuePatient | null>(null);

  const {
    queue,
    waiting,
    serving,
    done,
    sortedWait,
    callNext,
    changePriority,
    skipPatient,
    completePatient,
    loading: queueLoading,
    toast,
  } = useQueue();

  const navigate = useNavigate();
  const { profile, logout } = useAuth();

  const doctorName = profile?.full_name || "Doctor";
  const doctorSpecialty = profile?.specialty || "General Physician";
  const doctorInitials = doctorName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const onPrescribe = (p: QueuePatient) => setRxPatient(p);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login/doctor");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#080e1a]">
      <ToastNotification toast={toast} />

      {rxPatient && (
        <RealPrescriptionModal
          patient={rxPatient}
          onClose={() => setRxPatient(null)}
          onSaved={() => setRxPatient(null)}
        />
      )}

      {/* ── Sidebar ────────────────────────────────────── */}
      <aside
        className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-white/[0.07] bg-[#060b15] text-white transition-all duration-300 ease-out ${
          sidebarOpen ? "w-60" : "w-[60px]"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-white/[0.07] px-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 border border-blue-500/20">
            <Activity className="h-4 w-4 text-blue-400" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <div className="text-sm font-semibold tracking-tight text-white/90">MediQ</div>
              <div className="text-[10px] text-white/30 leading-none mt-0.5">Smart Clinic Platform</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2.5 pt-3">
          {sidebarOpen && (
            <div className="mb-2 px-2.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/25">
              Navigation
            </div>
          )}

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={item.label}
                className={`group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-blue-500/12 text-blue-400 border-l-2 border-blue-500/70"
                    : "text-white/40 hover:bg-white/[0.04] hover:text-white/75 border-l-2 border-transparent"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/[0.07] p-2.5 space-y-0.5">
          {sidebarOpen && (
            <div className="mb-1 rounded-lg bg-white/[0.04] px-3 py-2.5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-[10px] font-semibold text-blue-300">
                  {doctorInitials}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold text-white/80">{doctorName}</div>
                  <div className="truncate text-[10px] text-white/30">{doctorSpecialty}</div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-white/30 transition-colors hover:bg-white/[0.04] hover:text-white/60"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0" />
            )}
            {sidebarOpen && <span>Collapse</span>}
          </button>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-white/30 transition-colors hover:bg-white/[0.04] hover:text-rose-400"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Area ──────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/[0.07] bg-[#080e1a]/95 backdrop-blur-xl px-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />
            <input
              placeholder="Search patients, records…"
              className="w-64 rounded-xl border border-white/[0.08] bg-white/[0.04] py-2 pl-9 pr-4 text-sm text-white/80 placeholder:text-white/25 outline-none transition-colors hover:border-white/[0.12] focus:border-blue-500/40 focus:bg-white/[0.06]"
            />
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2.5">
            {/* Queue indicator */}
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-3 py-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ animation: "pulseSoft 2s ease-in-out infinite" }} />
              <span className="text-xs font-medium text-emerald-400">{waiting.length} waiting</span>
            </div>

            {/* Date chip */}
            <div className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5">
              <Calendar className="h-3 w-3 text-white/35" />
              <span className="text-xs font-medium text-white/50">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            {/* Bell */}
            <button className="relative rounded-lg p-2 text-white/30 transition-colors hover:bg-white/[0.05] hover:text-white/60">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
            </button>

            {/* Avatar */}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 border border-blue-500/20 text-xs font-semibold text-blue-300">
              {doctorInitials}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto w-full max-w-6xl flex-1 p-6">
          {queueLoading ? (
            <div className="flex h-full items-center justify-center mt-16">
              <MedicalLoader message="Syncing with Clinic…" />
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <OverviewTab
                  patients={queue}
                  waiting={waiting}
                  serving={serving}
                  done={done}
                  callNext={callNext}
                  onPrescribe={onPrescribe}
                  doctorName={doctorName}
                />
              )}
              {activeTab === "queue" && (
                <QueueTab
                  patients={queue}
                  waiting={waiting}
                  serving={serving}
                  done={done}
                  sortedWait={sortedWait}
                  callNext={callNext}
                  onPrescribe={onPrescribe}
                  onChangePriority={changePriority}
                  onSkip={skipPatient}
                  onComplete={completePatient}
                />
              )}
              {activeTab === "appointments" && <AppointmentsTab patients={queue} />}
              {activeTab === "patients" && <PatientsTab patients={queue} />}
              {activeTab === "prescriptions" && <PrescriptionsTab />}
              {activeTab === "rx-generator" && (
                <PrescriptionGeneratorTab
                  patients={queue}
                  onPrescribe={(patient: QueuePatient) => {
                    console.log(patient.patient_name);
                    setRxPatient(patient);
                  }}
                />
              )}
              {activeTab === "analytics" && <AnalyticsTab />}
              {activeTab === "outbreak" && <OutbreakTab />}
              {activeTab === "settings" && <SettingsTab />}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;