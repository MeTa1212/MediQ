import { useState } from "react";
import { Bell, Shield, Clock, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
export function SettingsTab() {
  const { profile, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: profile?.phone ?? "",
    specialty: profile?.specialty ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleSave = async () => {
    if (!profile?.id) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      phone: formData.phone,
      specialty: formData.specialty,
    }).eq("id", profile.id);
    
    if (!error) {
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-extrabold text-foreground text-2xl">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your clinic preferences</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-sm font-bold hover:bg-destructive/20 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Profile */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-6">
          <h3 className="font-bold text-foreground text-sm mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> Doctor Profile
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground text-xl font-bold shadow-lg">
                {profile?.full_name?.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-foreground text-lg">{profile?.full_name}</div>
                <div className="text-muted-foreground text-sm">{profile?.specialty || "Clinic Doctor"}</div>
                <div className="text-muted-foreground text-xs mt-0.5">{profile?.clinic_name || "MediQ Network"}</div>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Email (Read-only)</label>
              <input disabled defaultValue={profile?.email ?? ""} className="w-full mt-1.5 px-4 py-2.5 rounded-xl border border-border bg-secondary/50 text-muted-foreground text-sm cursor-not-allowed" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Phone</label>
              <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full mt-1.5 px-4 py-2.5 rounded-xl border border-border bg-secondary text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Specialty</label>
              <input value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} className="w-full mt-1.5 px-4 py-2.5 rounded-xl border border-border bg-secondary text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow" />
            </div>
            <button onClick={handleSave} disabled={saving} className="w-full py-3 rounded-xl gradient-primary text-white font-bold text-sm shadow-md mt-2 disabled:opacity-50">
               {saving ? "Saving..." : saved ? "Saved!" : "Save Profile Changes"}
            </button>
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
                { label: "Daily summary", desc: "End-of-day clinic summary report", on: true },
              ].map(n => (
                <div key={n.label} className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-semibold text-foreground text-sm">{n.label}</div>
                    <div className="text-muted-foreground text-[10px] mt-0.5">{n.desc}</div>
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
                { day: "Sat", time: "9:00 AM - 2:00 PM" },
              ].map(h => (
                <div key={h.day} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <span className="font-semibold text-foreground text-sm">{h.day}</span>
                  <span className="text-muted-foreground text-xs">{h.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-card p-6">
            <h3 className="font-bold text-foreground text-sm mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Privacy & Security
            </h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 rounded-xl border border-border bg-secondary hover:bg-muted text-xs font-bold text-foreground transition-colors uppercase tracking-wide">
                Update Security Credentials
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
