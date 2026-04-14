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
import { useQueue, type QueuePatient } from "@/hooks/useQueue"; // NEW
import { ToastNotification } from "@/components/ToastNotification";
import  RealPrescriptionModal  from "@/components/RealPrescriptionModal"; 
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

// REMOVED: usePatientState, Patient, Medicine, PrescriptionModal

const navItems = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "appointments", label: "Appointments", icon: Calendar },
  { id: "patients", label: "Patients", icon: Users },
  { id: "queue", label: "Queue Management", icon: ListOrdered },
  { id: "prescriptions", label: "Prescriptions", icon: FileText },
  { id: "rx-generator", label: "Rx Generator", icon: ClipboardList },
  { id: "analytics", label: "Reports", icon: BarChart3 },
  { id: "outbreak", label: "Outbreak", icon: Bug },
  { id: "settings", label: "Settings", icon: Settings },
];

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rxPatient, setRxPatient] = useState<QueuePatient | null>(null); // CHANGED: Patient → QueuePatient

  // REPLACED: usePatientState() → useQueue()
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

  // SIMPLIFIED: onPrescribe only sets state, no more mock saving logic
  const onPrescribe = (p: QueuePatient) => setRxPatient(p);

  // REMOVED: onSaveRx, onChangePriority, skipPatient, completePatient
  // These now come from useQueue hook automatically

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login/doctor");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* CHANGED: toast from useQueue */}
      <ToastNotification toast={toast} />

      {/* CHANGED: RealPrescriptionModal, simplified props */}
      {rxPatient && (
        <RealPrescriptionModal
          patient={rxPatient}
          onClose={() => setRxPatient(null)}
          onSaved={() => setRxPatient(null)}
        />
      )}

      <aside
        className={`sticky top-0 flex h-screen shrink-0 flex-col bg-zinc-950/80 backdrop-blur-2xl border-r border-white/10 text-zinc-100 transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-[68px]"
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border p-4">
          <div className="gradient-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>

          {sidebarOpen && (
            <div className="overflow-hidden">
              <div className="text-lg font-extrabold tracking-tight text-sidebar-foreground">
                MediQ
              </div>
              <div className="-mt-0.5 text-[10px] text-sidebar-foreground/50">
                Smart Clinic Platform
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          <div
            className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30 ${
              !sidebarOpen ? "hidden" : ""
            }`}
          >
            Menu
          </div>

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                activeTab === item.id
                  ? "bg-primary/20 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border border-primary/20"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="space-y-0.5 border-t border-sidebar-border p-3">
          {sidebarOpen && (
            <div className="mb-1 rounded-xl bg-sidebar-accent/50 px-3 py-3">
              <div className="flex items-center gap-2.5">
                <div className="gradient-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-primary-foreground">
                  {doctorInitials}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold text-sidebar-foreground">
                    {doctorName}
                  </div>
                  <div className="truncate text-[10px] text-sidebar-foreground/40">
                    {doctorSpecialty}
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent"
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
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-zinc-950/50 backdrop-blur-2xl px-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search patients, records..."
                className="w-72 rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-zinc-500 transition-all hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white/10"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* CHANGED: state.waiting.length → waiting.length */}
            <div className="flex items-center gap-2 rounded-full border border-success/20 bg-success/10 px-3 py-1.5">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse-soft" />
              <span className="text-xs font-semibold text-success">
                {waiting.length} in queue
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5">
              <Calendar className="h-3 w-3 text-primary" />
              <span className="text-xs font-semibold text-primary">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            <button className="relative rounded-xl p-2.5 transition-colors hover:bg-secondary">
              <Bell className="h-[18px] w-[18px] text-muted-foreground" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
            </button>

            <div className="gradient-primary flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-primary-foreground shadow-sm">
              {doctorInitials}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 p-6">
          {queueLoading ? (
             <div className="h-full flex items-center justify-center mt-20">
               <MedicalLoader message="Syncing with Clinic..." />
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
              patients={queue}                    // CHANGED
              waiting={waiting}                   // CHANGED
              serving={serving}                   // CHANGED
              done={done}                         // CHANGED
              sortedWait={sortedWait}             // CHANGED: state.sortedWait → sortedWait
              callNext={callNext}                 // CHANGED
              onPrescribe={onPrescribe}
              onChangePriority={changePriority}   // CHANGED
              onSkip={skipPatient}                // CHANGED
              onComplete={completePatient}        // CHANGED
            />
          )}

          {activeTab === "appointments" && <AppointmentsTab patients={queue} />}
          {activeTab === "patients" && <PatientsTab patients={queue} />}     {/* CHANGED */}
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