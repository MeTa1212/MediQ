import { useState } from "react";
import { Activity, LayoutDashboard, ListOrdered, FileText, BarChart3, Bug, Calendar, Bell, LogOut, Search, ChevronLeft, ChevronRight, Users, Settings, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import { usePatientState } from "@/hooks/usePatientState";
import { Patient, Medicine } from "@/data/mockData";
import { ToastNotification } from "@/components/ToastNotification";
import { PrescriptionModal } from "@/components/PrescriptionModal";
import { OverviewTab } from "@/components/doctor/OverviewTab";
import { QueueTab } from "@/components/doctor/QueueTab";
import { PrescriptionsTab } from "@/components/doctor/PrescriptionsTab";
import { AnalyticsTab } from "@/components/doctor/AnalyticsTab";
import { OutbreakTab } from "@/components/doctor/OutbreakTab";
import { AppointmentsTab } from "@/components/doctor/AppointmentsTab";
import { PatientsTab } from "@/components/doctor/PatientsTab";
import { SettingsTab } from "@/components/doctor/SettingsTab";
import { PrescriptionGeneratorTab } from "@/components/doctor/PrescriptionGeneratorTab";

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
  const [rxPatient, setRxPatient] = useState<Patient | null>(null);
  const state = usePatientState();

  const onPrescribe = (p: Patient) => setRxPatient(p);

  const onSaveRx = (medicines: Medicine[], diagnosis: string) => {
    if (!rxPatient) return;
    state.setPatients(prev => prev.map(p =>
      p.id === rxPatient.id
        ? { ...p, medicines, diagnosis, status: "done" as const, consultAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
        : p
    ));
    setRxPatient(null);
    state.notify("✅ Prescription saved successfully!");
  };

  const onChangePriority = (id: number, priority: "critical" | "normal" | "low") => {
    state.setPatients(prev => prev.map(p => p.id === id ? { ...p, priority } : p));
    state.notify("Priority updated");
  };

  const skipPatient = (id: number) => {
    state.setPatients(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, waitMins: p.waitMins + 15 } : p);
      return updated;
    });
    state.notify("⏭ Patient skipped to later in queue");
  };

  const completePatient = (id: number) => {
    state.setPatients(prev => prev.map(p =>
      p.id === id ? { ...p, status: "done" as const, consultAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) } : p
    ));
    state.notify("✅ Patient marked as complete");
  };

  return (
    <div className="min-h-screen flex bg-background">
      <ToastNotification toast={state.toast} />

      {rxPatient && (
        <PrescriptionModal patient={rxPatient} onClose={() => setRxPatient(null)} onSave={onSaveRx} />
      )}

      {/* Sidebar */}
      <aside className={`bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 ${sidebarOpen ? "w-64" : "w-[68px]"} shrink-0 sticky top-0 h-screen`}>
        {/* Logo */}
        <div className="p-4 flex items-center gap-3 border-b border-sidebar-border h-16">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-primary-foreground" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <div className="font-extrabold text-sidebar-foreground text-lg tracking-tight">MediQueue</div>
              <div className="text-sidebar-foreground/50 text-[10px] -mt-0.5">Smart Clinic Platform</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <div className={`text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30 px-3 mb-2 ${!sidebarOpen && "hidden"}`}>Menu</div>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === item.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-sidebar-border space-y-0.5">
          {sidebarOpen && (
            <div className="px-3 py-3 mb-1 rounded-xl bg-sidebar-accent/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">DS</div>
                <div className="min-w-0">
                  <div className="text-sidebar-foreground text-xs font-semibold truncate">Dr. Sharma</div>
                  <div className="text-sidebar-foreground/40 text-[10px] truncate">General Physician</div>
                </div>
              </div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent transition-colors">
            {sidebarOpen ? <ChevronLeft className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
            {sidebarOpen && <span>Collapse</span>}
          </button>
          <Link to="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent transition-colors">
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Exit</span>}
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Nav */}
        <header className="bg-card border-b border-border px-6 h-16 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input placeholder="Search patients, records..." className="pl-9 pr-4 py-2.5 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground w-72 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-success/10 border border-success/20 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse-soft" />
              <span className="text-success text-xs font-semibold">{state.waiting.length} in queue</span>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
              <Calendar className="w-3 h-3 text-primary" />
              <span className="text-primary text-xs font-semibold">{new Date().toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}</span>
            </div>
            <button className="relative p-2.5 rounded-xl hover:bg-secondary transition-colors">
              <Bell className="w-[18px] h-[18px] text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive ring-2 ring-card" />
            </button>
            <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold shadow-sm">
              DS
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
          {activeTab === "overview" && <OverviewTab patients={state.patients} waiting={state.waiting} serving={state.serving} done={state.done} callNext={state.callNext} onPrescribe={onPrescribe} />}
          {activeTab === "queue" && <QueueTab patients={state.patients} waiting={state.waiting} serving={state.serving} done={state.done} sortedWait={state.sortedWait} callNext={state.callNext} onPrescribe={onPrescribe} onChangePriority={onChangePriority} onSkip={skipPatient} onComplete={completePatient} />}
          {activeTab === "appointments" && <AppointmentsTab />}
          {activeTab === "patients" && <PatientsTab patients={state.patients} />}
          {activeTab === "prescriptions" && <PrescriptionsTab done={state.done} />}
          {activeTab === "rx-generator" && <PrescriptionGeneratorTab patients={state.patients} onPrescribe={onPrescribe} />}
          {activeTab === "analytics" && <AnalyticsTab />}
          {activeTab === "outbreak" && <OutbreakTab />}
          {activeTab === "settings" && <SettingsTab />}
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;
