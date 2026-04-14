import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import {
  ShieldCheck, UserSearch, AlertCircle, CheckCircle2, XCircle, Search,
  Mail, Phone, Stethoscope, Clock, Users, FileText, LogOut, RefreshCw, X,
} from "lucide-react";
import { MedicalLoader } from "@/components/MedicalLoader";

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

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          approval_status: status,
          approved: status === "approved"
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "doctors"] });
      setSelectedDoctor(null);
    },
  });

  const handleStatusChange = (id: string, status: "approved" | "rejected") => {
    if (window.confirm(`Are you sure you want to mark this application as ${status.toUpperCase()}?`)) {
      updateStatusMutation.mutate({ id, status });
    }
  };

  // Counts
  const pendingCount = doctors.filter(d => (d.approval_status || "pending") === "pending").length;
  const approvedCount = doctors.filter(d => d.approval_status === "approved").length;
  const rejectedCount = doctors.filter(d => d.approval_status === "rejected").length;

  // Filter + search
  const filteredDoctors = doctors
    .filter((doc) => {
      if (activeFilter === "all") return true;
      return (doc.approval_status || "pending") === activeFilter;
    })
    .filter((doc) => 
      doc.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-3.5 h-3.5" /> Approved</span>;
      case "rejected":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20"><XCircle className="w-3.5 h-3.5" /> Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock className="w-3.5 h-3.5" /> Pending</span>;
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#08111f] flex items-center justify-center"><MedicalLoader message="Loading Admin Portal..." /></div>;
  }

  return (
    <div className="min-h-screen bg-[#08111f] text-white selection:bg-blue-500/30">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#08111f]/80 backdrop-blur-2xl px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Admin Control Center</h1>
            <p className="text-sm text-white/50 font-medium">MediQ — Manage Doctor Applications & Access</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => refetch()}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-white/60 font-semibold text-sm hover:bg-white/5 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button 
            onClick={() => logout()}
            className="px-5 py-2.5 rounded-xl border border-white/10 text-white/80 font-semibold text-sm hover:bg-white/5 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 animate-fade-up">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none" />
            <div className="flex items-start justify-between mb-3 relative">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div className="text-3xl font-black tracking-tight leading-none mb-1 text-white relative">{doctors.length}</div>
            <div className="text-xs tracking-wider uppercase font-bold text-white/50 relative">Total Doctors</div>
          </div>

          <button 
            onClick={() => setActiveFilter("pending")}
            className={`relative overflow-hidden rounded-[24px] border p-5 shadow-lg text-left transition-all hover:scale-[1.02] ${activeFilter === 'pending' ? 'border-amber-500/40 bg-amber-500/10' : 'border-white/10 bg-white/5'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />
            <div className="flex items-start justify-between mb-3 relative">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div className="text-3xl font-black tracking-tight leading-none mb-1 text-amber-400 relative">{pendingCount}</div>
            <div className="text-xs tracking-wider uppercase font-bold text-white/50 relative">Pending Review</div>
          </button>

          <button 
            onClick={() => setActiveFilter("approved")}
            className={`relative overflow-hidden rounded-[24px] border p-5 shadow-lg text-left transition-all hover:scale-[1.02] ${activeFilter === 'approved' ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-white/10 bg-white/5'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />
            <div className="flex items-start justify-between mb-3 relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div className="text-3xl font-black tracking-tight leading-none mb-1 text-emerald-400 relative">{approvedCount}</div>
            <div className="text-xs tracking-wider uppercase font-bold text-white/50 relative">Approved</div>
          </button>

          <button 
            onClick={() => setActiveFilter("rejected")}
            className={`relative overflow-hidden rounded-[24px] border p-5 shadow-lg text-left transition-all hover:scale-[1.02] ${activeFilter === 'rejected' ? 'border-rose-500/40 bg-rose-500/10' : 'border-white/10 bg-white/5'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent pointer-events-none" />
            <div className="flex items-start justify-between mb-3 relative">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-rose-400" />
              </div>
            </div>
            <div className="text-3xl font-black tracking-tight leading-none mb-1 text-rose-400 relative">{rejectedCount}</div>
            <div className="text-xs tracking-wider uppercase font-bold text-white/50 relative">Rejected</div>
          </button>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input 
              type="text"
              placeholder="Search doctors by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:bg-white/10 focus:outline-none transition-all text-white placeholder:text-white/40"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-2xl p-1">
            {(["all", "pending", "approved", "rejected"] as FilterTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeFilter === tab 
                    ? "bg-white/10 text-white shadow-sm" 
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.16)] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          
          <div className="overflow-x-auto relative">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/20 text-xs uppercase tracking-wider text-white/50">
                  <th className="px-6 py-5 font-semibold">Doctor Profile</th>
                  <th className="px-6 py-5 font-semibold">Specialty</th>
                  <th className="px-6 py-5 font-semibold">Registration</th>
                  <th className="px-6 py-5 font-semibold">Applied On</th>
                  <th className="px-6 py-5 font-semibold">Status</th>
                  <th className="px-6 py-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredDoctors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                       <UserSearch className="w-12 h-12 text-white/20 mx-auto mb-4" />
                       <div className="font-semibold text-white/60">
                         {searchTerm ? "No matching doctors found" : `No ${activeFilter === "all" ? "" : activeFilter} doctor applications`}
                       </div>
                       <p className="text-white/30 text-xs mt-1">
                         {searchTerm ? "Try a different search term" : "New applications will appear here"}
                       </p>
                    </td>
                  </tr>
                ) : (
                  filteredDoctors.map((doc) => (
                    <tr key={doc.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                            {(doc.full_name || "?")[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white mb-0.5 group-hover:text-blue-400 transition-colors">
                              {doc.full_name || "Unknown"}
                            </div>
                            <div className="text-xs text-white/50 flex items-center gap-1.5"><Mail className="w-3 h-3"/> {doc.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                          <Stethoscope className="w-3.5 h-3.5 text-white/40" />
                          {doc.specialty || "General"}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-white/50 font-medium">
                        {doc.registration_id || <span className="text-white/30 italic">Not provided</span>}
                      </td>
                      <td className="px-6 py-5 text-sm text-white/50 font-medium">
                        {new Date(doc.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-6 py-5">
                        {getStatusBadge(doc.approval_status || "pending")}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button 
                          onClick={() => setSelectedDoctor(doc)}
                          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold transition-colors"
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

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-white/30">
          Showing {filteredDoctors.length} of {doctors.length} doctor records
        </div>
      </main>

      {/* Review Detail Side-Sheet */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedDoctor(null)} />
          
          <div className="relative w-full max-w-md bg-[#0a0f1c] border-l border-white/10 shadow-2xl h-full overflow-y-auto animate-slide-left flex flex-col">
            {/* Close button */}
            <button 
              onClick={() => setSelectedDoctor(null)} 
              className="absolute top-6 right-6 z-10 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-8 border-b border-white/10 bg-white/5">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-6">
                <Stethoscope className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{selectedDoctor.full_name}</h2>
              <p className="text-white/60 mb-6">Doctor Application Review</p>
              <div>{getStatusBadge(selectedDoctor.approval_status || "pending")}</div>
            </div>

            <div className="p-8 space-y-6 flex-1">
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest border-b border-white/10 pb-2">Contact Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-white/40 shrink-0" />
                    <span className="font-medium text-white">{selectedDoctor.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-white/40 shrink-0" />
                    <span className="font-medium text-white">{selectedDoctor.phone || "Not provided"}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest border-b border-white/10 pb-2">Professional Info</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Stethoscope className="w-4 h-4 text-white/40 shrink-0" />
                    <span className="font-medium text-white">{selectedDoctor.specialty || "General Practitioner"}</span>
                  </div>
                  {selectedDoctor.registration_id && (
                    <div className="flex items-center gap-3 text-sm">
                      <FileText className="w-4 h-4 text-white/40 shrink-0" />
                      <div>
                        <span className="text-white/40 text-xs">Reg. ID: </span>
                        <span className="font-medium text-white">{selectedDoctor.registration_id}</span>
                      </div>
                    </div>
                  )}
                  {selectedDoctor.clinic_name && (
                    <div className="flex items-center gap-3 text-sm">
                      <FileText className="w-4 h-4 text-white/40 shrink-0" />
                      <div>
                        <span className="text-white/40 text-xs">Clinic: </span>
                        <span className="font-medium text-white">{selectedDoctor.clinic_name}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-white/40 shrink-0" />
                    <span className="font-medium text-white text-xs">Applied: {new Date(selectedDoctor.created_at).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 mb-8">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-500 text-sm mb-1">Verification Required</h4>
                    <p className="text-amber-500/80 text-xs leading-relaxed">
                      Please verify the doctor's identification and clinic details offline before approving their account access.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/10 bg-white/5 flex gap-3 sticky bottom-0">
              <button 
                onClick={() => handleStatusChange(selectedDoctor.id, "approved")}
                disabled={updateStatusMutation.isPending}
                className="flex-1 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve Access
              </button>
              <button 
                onClick={() => handleStatusChange(selectedDoctor.id, "rejected")}
                disabled={updateStatusMutation.isPending}
                className="flex-1 py-3.5 rounded-xl bg-transparent border border-rose-500/50 text-rose-400 hover:bg-rose-500/10 font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
