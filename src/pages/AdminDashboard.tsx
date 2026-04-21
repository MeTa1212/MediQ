import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import {
  ShieldCheck, UserSearch, AlertCircle, CheckCircle2, XCircle, Search,
  Mail, Phone, Stethoscope, Clock, Users, FileText, LogOut, RefreshCw, X,
} from "lucide-react";
import { MedicalLoader } from "@/components/MedicalLoader";
import { toast } from "@/hooks/use-toast";

interface DoctorProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  specialty: string;
  registration_id: string | null;
  clinic_name: string | null;
  qualification: string | null;
  approval_status: "pending" | "approved" | "rejected";
  created_at: string;
}

type FilterTab = "all" | "pending" | "approved" | "rejected";

export default function AdminDashboard() {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);

  const { data: doctors = [], isLoading, refetch } = useQuery({
    queryKey: ["admin", "doctors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "doctor")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DoctorProfile[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("admin-doctor-requests-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        void refetch();
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [refetch]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const { data, error } = await supabase
        .from("profiles")
        .update({ approval_status: status, approved: status === "approved" })
        .eq("id", id)
        .eq("role", "doctor")
        .select("id")
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Approval update was blocked. Run fix_rls_policies.sql in Supabase to allow admin updates.");
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "doctors"] });
      setSelectedDoctor(null);
      toast({ title: "Status updated", description: `Doctor application marked as ${variables.status}.` });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to update doctor approval status.";
      toast({ title: "Approval update failed", description: message, variant: "destructive" });
    },
  });

  const handleStatusChange = (id: string, status: "approved" | "rejected") => {
    if (window.confirm(`Are you sure you want to mark this application as ${status.toUpperCase()}?`)) {
      updateStatusMutation.mutate({ id, status });
    }
  };

  const pendingCount  = doctors.filter((d) => (d.approval_status || "pending") === "pending").length;
  const approvedCount = doctors.filter((d) => d.approval_status === "approved").length;
  const rejectedCount = doctors.filter((d) => d.approval_status === "rejected").length;

  const filteredDoctors = doctors
    .filter((doc) => activeFilter === "all" || (doc.approval_status || "pending") === activeFilter)
    .filter((doc) =>
      doc.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-400"><CheckCircle2 className="h-3 w-3" /> Approved</span>;
      case "rejected":
        return <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-[11px] font-semibold text-rose-400"><XCircle className="h-3 w-3" /> Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-400"><Clock className="h-3 w-3" /> Pending</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080e1a] flex items-center justify-center">
        <MedicalLoader message="Loading Admin Portal…" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080e1a] text-white selection:bg-blue-500/25">

      {/* ── Header ─────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#080e1a]/95 backdrop-blur-xl px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/12 border border-blue-500/20">
            <ShieldCheck className="h-[18px] w-[18px] text-blue-400" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white/90 leading-none">Admin Control Center</h1>
            <p className="mt-0.5 text-[11px] text-white/35 leading-none">MediQ — Doctor Applications &amp; Access</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-white/50 transition-colors hover:bg-white/[0.07] hover:text-white/80"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-white/50 transition-colors hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8" style={{ animation: "fadeUp 0.35s ease forwards" }}>

        {/* ── Stat Cards ─────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0f1520] p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]">
            <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-white/[0.08]" />
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/15 mb-4">
              <Users className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white/90 leading-none mb-1.5">{doctors.length}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-white/30">Total Doctors</div>
          </div>

          {/* Pending */}
          <button
            onClick={() => setActiveFilter("pending")}
            className={`relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] ${
              activeFilter === "pending"
                ? "border-amber-500/25 bg-amber-500/8 shadow-[var(--shadow-card)]"
                : "border-white/[0.07] bg-[#0f1520] shadow-[var(--shadow-card)]"
            }`}
          >
            <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-white/[0.08]" />
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/15 mb-4">
              <Clock className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400 leading-none mb-1.5">{pendingCount}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-white/30">Pending Review</div>
          </button>

          {/* Approved */}
          <button
            onClick={() => setActiveFilter("approved")}
            className={`relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] ${
              activeFilter === "approved"
                ? "border-emerald-500/25 bg-emerald-500/8 shadow-[var(--shadow-card)]"
                : "border-white/[0.07] bg-[#0f1520] shadow-[var(--shadow-card)]"
            }`}
          >
            <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-white/[0.08]" />
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/15 mb-4">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 leading-none mb-1.5">{approvedCount}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-white/30">Approved</div>
          </button>

          {/* Rejected */}
          <button
            onClick={() => setActiveFilter("rejected")}
            className={`relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] ${
              activeFilter === "rejected"
                ? "border-rose-500/25 bg-rose-500/8 shadow-[var(--shadow-card)]"
                : "border-white/[0.07] bg-[#0f1520] shadow-[var(--shadow-card)]"
            }`}
          >
            <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-white/[0.08]" />
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/15 mb-4">
              <XCircle className="h-4 w-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-rose-400 leading-none mb-1.5">{rejectedCount}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-white/30">Rejected</div>
          </button>
        </div>

        {/* ── Actions Bar ────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#0f1520] border border-white/[0.08] text-sm text-white/80 placeholder:text-white/25 outline-none transition-colors focus:border-blue-500/35 focus:bg-[#111a28]"
            />
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-white/[0.07] bg-[#0f1520] p-1">
            {(["all", "pending", "approved", "rejected"] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-150 ${
                  activeFilter === tab
                    ? "bg-white/[0.08] text-white/90"
                    : "text-white/30 hover:text-white/60"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ──────────────────────────────────────── */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#0f1520] overflow-hidden shadow-[var(--shadow-card)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">Doctor Profile</th>
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">Specialty</th>
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">Registration</th>
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">Applied</th>
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">Status</th>
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filteredDoctors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <UserSearch className="h-10 w-10 text-white/15 mx-auto mb-3" />
                      <div className="text-sm font-medium text-white/40">
                        {searchTerm ? "No matching doctors found" : `No ${activeFilter === "all" ? "" : activeFilter} applications`}
                      </div>
                      <p className="text-xs text-white/20 mt-1">
                        {searchTerm ? "Try a different search term" : "New applications will appear here"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredDoctors.map((doc) => (
                    <tr key={doc.id} className="group transition-colors hover:bg-white/[0.025]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/15 text-sm font-semibold text-blue-400">
                            {(doc.full_name || "?")[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white/85 group-hover:text-blue-300 transition-colors">
                              {doc.full_name || "Unknown"}
                            </div>
                            <div className="text-[11px] text-white/35 flex items-center gap-1 mt-0.5">
                              <Mail className="h-2.5 w-2.5" /> {doc.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-white/60">
                          <Stethoscope className="h-3 w-3 text-white/25" />
                          {doc.specialty || "General"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/40">
                        {doc.registration_id || <span className="italic text-white/20">Not provided</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-white/40">
                        {new Date(doc.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(doc.approval_status || "pending")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedDoctor(doc)}
                          className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-white/55 transition-all hover:bg-white/[0.08] hover:text-white/90"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-5 text-center text-xs text-white/20">
          Showing {filteredDoctors.length} of {doctors.length} doctor records
        </div>
      </main>

      {/* ── Review Side Sheet ──────────────────────────── */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedDoctor(null)}
          />

          <div className="relative flex h-full w-full max-w-sm flex-col border-l border-white/[0.07] bg-[#090e1a] shadow-[var(--shadow-modal)] animate-slide-left overflow-y-auto">
            {/* Close */}
            <button
              onClick={() => setSelectedDoctor(null)}
              className="absolute right-5 top-5 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] border border-white/[0.08] transition-colors hover:bg-white/[0.10]"
            >
              <X className="h-4 w-4 text-white/60" />
            </button>

            {/* Doctor header */}
            <div className="border-b border-white/[0.07] bg-white/[0.03] p-7 pt-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/12 border border-blue-500/20 mb-5">
                <Stethoscope className="h-6 w-6 text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-white/90 mb-1">{selectedDoctor.full_name}</h2>
              <p className="text-sm text-white/40 mb-4">Doctor Application Review</p>
              {getStatusBadge(selectedDoctor.approval_status || "pending")}
            </div>

            {/* Details */}
            <div className="flex-1 p-7 space-y-6">
              <div>
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25 border-b border-white/[0.07] pb-2 mb-3">
                  Contact Details
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-white/25 shrink-0" />
                    <span className="text-white/75">{selectedDoctor.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-white/25 shrink-0" />
                    <span className="text-white/75">{selectedDoctor.phone || "Not provided"}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25 border-b border-white/[0.07] pb-2 mb-3">
                  Professional Info
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-sm">
                    <Stethoscope className="h-4 w-4 text-white/25 shrink-0" />
                    <span className="text-white/75">{selectedDoctor.specialty || "General Practitioner"}</span>
                  </div>
                  {selectedDoctor.registration_id && (
                    <div className="flex items-center gap-3 text-sm">
                      <FileText className="h-4 w-4 text-white/25 shrink-0" />
                      <div>
                        <span className="text-white/30 text-[11px]">Reg. ID: </span>
                        <span className="text-white/75">{selectedDoctor.registration_id}</span>
                      </div>
                    </div>
                  )}
                  {selectedDoctor.clinic_name && (
                    <div className="flex items-center gap-3 text-sm">
                      <FileText className="h-4 w-4 text-white/25 shrink-0" />
                      <div>
                        <span className="text-white/30 text-[11px]">Clinic: </span>
                        <span className="text-white/75">{selectedDoctor.clinic_name}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-white/25 shrink-0" />
                    <span className="text-white/50 text-xs">Applied: {new Date(selectedDoctor.created_at).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Warning notice */}
              <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.06] p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-amber-400 mb-1">Verification Required</h4>
                    <p className="text-xs text-amber-400/60 leading-relaxed">
                      Please verify the doctor's identification and clinic details offline before approving account access.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="border-t border-white/[0.07] bg-white/[0.03] p-5 flex gap-3 sticky bottom-0">
              <button
                onClick={() => handleStatusChange(selectedDoctor.id, "approved")}
                disabled={updateStatusMutation.isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500/15 border border-emerald-500/25 py-3 text-sm font-semibold text-emerald-400 transition-all duration-200 hover:bg-emerald-500/22 hover:border-emerald-500/35 disabled:opacity-40"
              >
                <CheckCircle2 className="h-4 w-4" /> Approve
              </button>
              <button
                onClick={() => handleStatusChange(selectedDoctor.id, "rejected")}
                disabled={updateStatusMutation.isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-500/[0.07] border border-rose-500/20 py-3 text-sm font-semibold text-rose-400 transition-all duration-200 hover:bg-rose-500/[0.12] disabled:opacity-40"
              >
                <XCircle className="h-4 w-4" /> Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
