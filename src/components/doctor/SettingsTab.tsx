import { Bell, Shield, Clock, User } from "lucide-react";

export function SettingsTab() {
  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-extrabold text-foreground text-2xl">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your clinic preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Profile */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-6">
          <h3 className="font-bold text-foreground text-sm mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> Doctor Profile
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground text-xl font-bold">DS</div>
              <div>
                <div className="font-bold text-foreground">Dr. Priya Sharma</div>
                <div className="text-muted-foreground text-sm">General Physician</div>
                <div className="text-muted-foreground text-xs mt-0.5">MCI Reg: MH-12345</div>
              </div>
            </div>
            {[
              { label: "Email", value: "dr.sharma@mediqueue.in" },
              { label: "Phone", value: "+91 98765 43210" },
              { label: "Clinic", value: "MediCare Clinic, Pune" },
            ].map(f => (
              <div key={f.label}>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{f.label}</label>
                <input defaultValue={f.value} className="w-full mt-1.5 px-4 py-2.5 rounded-xl border border-border bg-secondary text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow" />
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-5">
          <div className="bg-card rounded-2xl border border-border shadow-card p-6">
            <h3 className="font-bold text-foreground text-sm mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" /> Notifications
            </h3>
            <div className="space-y-4">
              {[
                { label: "New patient alerts", desc: "Get notified when a new patient joins the queue", on: true },
                { label: "Critical patient alerts", desc: "Immediate alerts for critical priority patients", on: true },
                { label: "Appointment reminders", desc: "15-min reminder before each appointment", on: false },
                { label: "Daily summary", desc: "End-of-day clinic summary report", on: true },
              ].map(n => (
                <div key={n.label} className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-semibold text-foreground text-sm">{n.label}</div>
                    <div className="text-muted-foreground text-xs mt-0.5">{n.desc}</div>
                  </div>
                  <div className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${n.on ? "bg-primary" : "bg-border"}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-card shadow transition-all ${n.on ? "right-1" : "left-1"}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-card p-6">
            <h3 className="font-bold text-foreground text-sm mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Clinic Hours
            </h3>
            <div className="space-y-2.5">
              {[
                { day: "Mon - Fri", time: "9:00 AM - 6:00 PM" },
                { day: "Saturday", time: "9:00 AM - 2:00 PM" },
                { day: "Sunday", time: "Closed" },
              ].map(h => (
                <div key={h.day} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <span className="font-semibold text-foreground text-sm">{h.day}</span>
                  <span className="text-muted-foreground text-sm">{h.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-card p-6">
            <h3 className="font-bold text-foreground text-sm mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Security
            </h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 rounded-xl border border-border bg-secondary hover:bg-muted text-sm font-medium text-foreground transition-colors">
                Change Password
              </button>
              <button className="w-full text-left px-4 py-3 rounded-xl border border-border bg-secondary hover:bg-muted text-sm font-medium text-foreground transition-colors">
                Two-Factor Authentication
              </button>
              <button className="w-full text-left px-4 py-3 rounded-xl border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 text-sm font-medium text-destructive transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
