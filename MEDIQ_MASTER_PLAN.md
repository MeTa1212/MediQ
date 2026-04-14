# MEDIQ — COMPLETE IMPLEMENTATION PLAN + PROJECT CONTEXT
> Last updated: Phase 3 — Moving from mock data to real Supabase data
> Paste this entire file at the start of any new chat to resume without re-explaining.

---

## SECTION 1 — WHAT MEDIQ IS

MediQ is a smart clinic platform with two separate interfaces:

- **Doctor Dashboard** — Queue management, digital prescriptions, patient records, analytics, outbreak detection
- **Patient App** — Book tokens, check queue status, view prescriptions, medicine reminders

It is a real production project built with React + TypeScript + Tailwind + Supabase.

---

## SECTION 2 — CURRENT TECH STACK

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui components |
| Routing | React Router v6 |
| State / Server | TanStack Query (installed, not fully used yet) |
| Auth + DB | Supabase (Auth + Postgres + Realtime) |
| IDE | PyCharm |
| Dev server | `npm run dev` |

---

## SECTION 3 — FULL FOLDER STRUCTURE (CURRENT)

```
src/
├── App.tsx                          ← Routes + AuthProvider wrapper
├── main.tsx                         ← ReactDOM.createRoot, no AuthProvider here
├── index.css
├── vite-env.d.ts
│
├── components/
│   ├── BadgeChip.tsx                ← Reusable badge/pill component
│   ├── NavLink.tsx                  ← Nav link helper
│   ├── PrescriptionModal.tsx        ← OLD modal — uses mock Patient type
│   ├── StatCard.tsx                 ← Stats display card
│   ├── ToastNotification.tsx        ← Toast popup component
│   │
│   ├── auth/
│   │   ├── ProtectedRoute.tsx       ← Guards /doctor and /patient routes by role
│   │   └── RoleGuard.tsx            ← (exists, currently unused)
│   │
│   ├── doctor/
│   │   ├── AnalyticsTab.tsx         ← Still on mock WEEKLY_DATA
│   │   ├── AppointmentsTab.tsx      ← Still on mock APPOINTMENTS
│   │   ├── OutbreakTab.tsx          ← Still on mock OUTBREAK_DATA
│   │   ├── OverviewTab.tsx          ← Uses Patient[] + WEEKLY_DATA + APPOINTMENTS
│   │   ├── PatientsTab.tsx          ← Uses Patient[]
│   │   ├── PrescriptionGenerator.tsx ← Uses Patient[] + MEDICINE_DB
│   │   ├── PrescriptionsTab.tsx     ← Uses Patient[] (done ones with medicines)
│   │   ├── QueueTab.tsx             ← Uses Patient[], sortedWait, callNext etc
│   │   └── SettingsTab.tsx          ← Fully static UI, no data
│   │
│   ├── layout/
│   │   ├── AuthLayout.tsx           ← Dark animated canvas bg layout for auth pages
│   │   └── DashboardLayout.tsx      ← Used in PatientApp header/layout
│   │
│   └── ui/                          ← Full shadcn/ui component library (50+ files)
│       └── (accordion, alert, button, card, dialog, input, etc.)
│
├── context/
│   └── AuthContext.tsx              ← EMPTY FILE — not used, safe to ignore
│
├── data/
│   └── mockData.ts                  ← ALL mock data lives here (see Section 5)
│
├── hooks/
│   ├── use-mobile.tsx               ← useIsMobile() breakpoint hook
│   ├── use-toast.ts                 ← shadcn toast system
│   ├── useAuth.tsx                  ← AuthContext + AuthProvider + useAuth hook (ALL IN ONE)
│   ├── usePatientState.ts           ← Current mock-data state manager for doctor dashboard
│   └── usePatientState.ts           ← Also used by PatientApp for queue state
│
├── lib/
│   ├── auth.ts                      ← signUpUser, loginUser, logoutUser, getUserProfile
│   ├── supabase.ts                  ← createClient with VITE_ env vars
│   └── utils.ts                     ← cn() utility from shadcn
│
├── pages/
│   ├── DoctorDashboard.tsx          ← Main doctor page, sidebar nav, renders tab components
│   ├── PatientApp.tsx               ← Mobile-style patient interface, bottom nav tabs
│   ├── Landing.tsx                  ← Animated intro screen + hero + feature cards
│   ├── Index.tsx                    ← Re-exports Landing
│   ├── NotFound.tsx                 ← 404 page
│   │
│   └── auth/
│       ├── DoctorLogin.tsx          ← Real auth via useAuth().login
│       ├── DoctorSignUp.tsx         ← Real auth via useAuth().signUp
│       ├── PatientLogin.tsx         ← Real auth via useAuth().login
│       ├── PatientSignUp.tsx        ← Real auth via useAuth().signUp
│       └── SignUp.tsx               ← Role chooser page (exists)
│
└── test/
    ├── example.test.ts
    └── setup.ts
```

---

## SECTION 4 — HOW AUTH WORKS (COMPLETED & WORKING)

### Flow
1. User visits `/` (Landing) → clicks Doctor Login or Patient Login
2. Goes to `/login/doctor` or `/login/patient`
3. Logs in → `loginUser()` in `auth.ts` calls `supabase.auth.signInWithPassword`
4. `onAuthStateChange` fires → `useAuth` fetches profile from `profiles` table
5. Login page reads role from profile → navigates to `/doctor` or `/patient`
6. `ProtectedRoute` checks: logged in? correct role? approved (for doctors)?
7. If doctor not approved → redirect to `/pending-approval`

### Key files
- `src/hooks/useAuth.tsx` — contains AuthContext, AuthProvider, and useAuth hook ALL IN ONE FILE
- `src/lib/auth.ts` — signUpUser, loginUser, logoutUser, getUserProfile
- `src/components/auth/ProtectedRoute.tsx` — role-based route guard
- `src/context/AuthContext.tsx` — EMPTY, ignore it

### Auth state available via `useAuth()`
```ts
const { user, session, profile, role, loading, approved, signUp, login, logout, refreshProfile } = useAuth();
```

### Profile object shape
```ts
{
  id: string,          // matches auth.users id
  full_name: string,
  email: string,
  phone: string | null,
  role: "doctor" | "patient",
  approved: boolean,   // patients = true immediately, doctors = false until admin approves
  age: number | null,
  specialty: string | null,
  created_at: string
}
```

---

## SECTION 5 — MOCK DATA STRUCTURE (what needs to be replaced)

### `src/data/mockData.ts` exports:
```ts
// Main patient type
export interface Patient {
  id: number;
  token: string;           // "MQ-001"
  name: string;
  age: number;
  phone: string;
  symptoms: string;        // free text
  priority: "critical" | "normal" | "low";
  status: "waiting" | "serving" | "done";
  waitMins: number;
  consultAt: string | null;
  medicines: Medicine[];
  diagnosis: string;
}

export interface Medicine {
  name: string;
  dose: string;
  freq: string;
  days: number;
}

// Other mock exports
export const PATIENTS_INIT: Patient[]     // 6 sample patients
export const APPOINTMENTS: Appointment[] // sample appointments
export const WEEKLY_DATA: {day, value}[] // chart data
export const OUTBREAK_DATA: {day, fever, cough, other}[] // outbreak chart
export const MEDICINE_DB: string[]       // ~20 medicine names for autocomplete
export const PRIORITY_META              // badge styles per priority
export const STATUS_META                // badge styles per status
```

### `src/hooks/usePatientState.ts` — current state manager
```ts
// Wraps PATIENTS_INIT in useState
// Provides: patients, setPatients, waiting, serving, done, sortedWait, callNext, toast, notify
// Used by: DoctorDashboard.tsx, PatientApp.tsx
// Everything is in-memory, resets on page refresh
```

---

## SECTION 6 — SUPABASE TABLES (ALL CREATED)

```sql
profiles              -- all users, role + approved field
doctor_profiles       -- extra doctor info (specialty, clinic, etc)
patient_profiles      -- extra patient info (age, blood group, etc)
tokens                -- the queue system (one row per patient visit)
prescriptions         -- one per consultation
prescription_medicines -- each medicine in a prescription
medicine_reminders    -- patient medicine schedule
symptom_tags          -- master list of symptom chips (seeded)
symptom_reports       -- anonymous daily symptom counts for outbreak detection
clinic_settings       -- per-doctor clinic config
```

### Key `tokens` table columns:
```sql
id uuid
token_number text          -- "MQ-001"
patient_id uuid → profiles
doctor_id uuid → profiles
clinic_date date
status text                -- waiting / serving / done / cancelled / no_show
priority text              -- critical / normal / low
symptom_tags text[]        -- array of selected tag labels
custom_symptoms text       -- free text
estimated_wait_minutes int
called_at timestamptz
serving_started_at timestamptz
completed_at timestamptz
created_at timestamptz
```

### Key `prescriptions` table columns:
```sql
id uuid
token_id uuid → tokens
patient_id uuid → profiles
doctor_id uuid → profiles
diagnosis text
notes text
follow_up_date date
created_at timestamptz
```

### `prescription_medicines`:
```sql
id uuid
prescription_id uuid → prescriptions
medicine_name text
dose text
frequency text
duration_days int
display_order int
```

### DB Functions created:
- `generate_token_number(p_doctor_id, p_date)` → returns "MQ-001" style token
- `get_crowd_level(p_doctor_id)` → returns "low" / "medium" / "high"
- `handle_new_user()` trigger → auto-creates profiles row on auth.users insert

### Realtime enabled on: `tokens`, `symptom_reports`

---

## SECTION 7 — VISUAL/DESIGN SYSTEM

### Theme
- Dark backgrounds: `#0a0f1c`, `#07101b`, `#08111f`
- Glass morphism: `bg-zinc-300/[0.08]`, `border-zinc-300/10`, `backdrop-blur-md`
- Doctor color: sky/blue (`#38bdf8`, `bg-blue-500`, `text-blue-300`)
- Patient color: emerald/green (`#34d399`, `bg-emerald-500`, `text-emerald-300`)
- Canvas animated orbs on auth pages (already built in AuthLayout.tsx)
- Animated intro wave on Landing page

### CSS classes used (custom in index.css):
- `gradient-primary` — primary gradient for buttons/accents
- `gradient-violet` — violet gradient for serving banner
- `shadow-card`, `shadow-card-hover` — card shadows
- `animate-fade-up`, `animate-slide-in`, `animate-pulse-soft`

### shadcn/ui components available:
Button, Input, Label, Checkbox, Dialog, Select, Textarea, Badge, Card, Table, Tabs, Toast, Sonner, Tooltip, Avatar, Calendar, and 30+ more

---

## SECTION 8 — WHAT IS DONE vs WHAT IS NOT DONE

### ✅ DONE
- [x] Full auth system (signup, login, logout, role routing, protected routes)
- [x] Doctor signup → pending approval flow
- [x] Patient signup → immediate access
- [x] All Supabase tables created with RLS policies
- [x] DB trigger for auto profile creation
- [x] DB functions: generate_token_number, get_crowd_level
- [x] Realtime enabled on tokens table
- [x] All frontend UI components built (just on mock data)
- [x] Doctor Dashboard: 9 tabs all rendering
- [x] Patient App: 5 tabs all rendering
- [x] Landing page with animated intro
- [x] AuthLayout with canvas orbs animation

### ❌ NOT DONE — THE ENTIRE NEXT PHASE
- [x] `useQueue.ts` hook — fetch real tokens from Supabase with realtime
- [x] `usePrescriptions.ts` hook — save prescriptions to Supabase
- [x] `usePatientQueue.ts` hook — patient books token, checks status
- [x] `RealPrescriptionModal.tsx` — new modal that saves to Supabase
- [x] `DoctorDashboard.tsx` — swap usePatientState → useQueue
- [x] `QueueTab.tsx` — adapt to QueuePatient type (uuid ids, different field names)
- [x] `PatientsTab.tsx` — adapt field names
- [x] `OverviewTab.tsx` — adapt field names and chart data
- [x] `PrescriptionsTab.tsx` — fetch from prescriptions table
- [x] `PatientApp.tsx` — real token booking + real prescription view
- [x] `AnalyticsTab.tsx` — real queries from tokens table
- [x] `OutbreakTab.tsx` — real queries from symptom_reports table
- [x] `SettingsTab.tsx` — read/write clinic_settings + doctor_profiles
- [x] Symptom tag chip UI on patient booking form
- [x] Doctor selection on patient booking
- [x] Medicine reminder display on patient side

---

## SECTION 9 — COMPLETE IMPLEMENTATION PLAN

### STEP 1 — Create `src/hooks/useQueue.ts`

This replaces `usePatientState.ts` for the **doctor side**.

```ts
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export interface QueuePatient {
  id: string;                         // uuid — NOT a number like mock
  token_number: string;               // "MQ-001"
  status: "waiting" | "serving" | "done" | "cancelled" | "no_show";
  priority: "critical" | "normal" | "low";
  symptom_tags: string[];
  custom_symptoms: string | null;
  estimated_wait_minutes: number | null;
  created_at: string;
  called_at: string | null;
  completed_at: string | null;
  patient_id: string;
  // joined from profiles + patient_profiles
  patient_name: string;
  patient_phone: string | null;
  patient_age: number | null;
}

export function useQueue() {
  const { profile } = useAuth();
  const [queue, setQueue] = useState<QueuePatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const notify = (msg: string, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchQueue = useCallback(async () => {
    if (!profile?.id) return;

    const { data, error } = await supabase
      .from("tokens")
      .select(`
        id,
        token_number,
        status,
        priority,
        symptom_tags,
        custom_symptoms,
        estimated_wait_minutes,
        created_at,
        called_at,
        completed_at,
        patient_id,
        profiles!tokens_patient_id_fkey (
          full_name,
          phone,
          patient_profiles ( age )
        )
      `)
      .eq("doctor_id", profile.id)
      .eq("clinic_date", today)
      .order("created_at", { ascending: true });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const mapped: QueuePatient[] = (data || []).map((row: any) => ({
      id: row.id,
      token_number: row.token_number,
      status: row.status,
      priority: row.priority,
      symptom_tags: row.symptom_tags || [],
      custom_symptoms: row.custom_symptoms,
      estimated_wait_minutes: row.estimated_wait_minutes,
      created_at: row.created_at,
      called_at: row.called_at,
      completed_at: row.completed_at,
      patient_id: row.patient_id,
      patient_name: row.profiles?.full_name ?? "Unknown",
      patient_phone: row.profiles?.phone ?? null,
      patient_age: row.profiles?.patient_profiles?.age ?? null,
    }));

    setQueue(mapped);
    setLoading(false);
  }, [profile?.id, today]);

  // Realtime subscription
  useEffect(() => {
    if (!profile?.id) return;
    fetchQueue();

    const channel = supabase
      .channel(`queue-doctor-${profile.id}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "tokens",
        filter: `doctor_id=eq.${profile.id}`,
      }, () => { fetchQueue(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile?.id, fetchQueue]);

  // Derived
  const waiting = queue.filter(p => p.status === "waiting");
  const serving = queue.find(p => p.status === "serving");
  const done = queue.filter(p => p.status === "done");
  const sortedWait = [...waiting].sort((a, b) =>
    ({ critical: 0, normal: 1, low: 2 }[a.priority]) -
    ({ critical: 0, normal: 1, low: 2 }[b.priority])
  );

  // Actions
  const callNext = async () => {
    const next = sortedWait[0];
    if (!next) { notify("Queue is empty!", "warn"); return; }

    if (serving) {
      await supabase.from("tokens").update({
        status: "done",
        completed_at: new Date().toISOString(),
      }).eq("id", serving.id);
    }

    await supabase.from("tokens").update({
      status: "serving",
      called_at: new Date().toISOString(),
    }).eq("id", next.id);

    notify(`📢 Calling ${next.token_number} — ${next.patient_name}`);
  };

  const changePriority = async (id: string, priority: "critical" | "normal" | "low") => {
    await supabase.from("tokens").update({ priority }).eq("id", id);
    notify("Priority updated");
  };

  const skipPatient = async (id: string) => {
    const p = queue.find(x => x.id === id);
    if (!p) return;
    const newWait = (p.estimated_wait_minutes ?? 0) + 15;
    await supabase.from("tokens").update({ estimated_wait_minutes: newWait }).eq("id", id);
    notify("⏭ Patient moved later in queue");
  };

  const completePatient = async (id: string) => {
    await supabase.from("tokens").update({
      status: "done",
      completed_at: new Date().toISOString(),
    }).eq("id", id);
    notify("✅ Patient marked as complete");
  };

  return {
    queue, waiting, serving, done, sortedWait,
    loading, error, toast, notify,
    callNext, changePriority, skipPatient, completePatient,
    refetch: fetchQueue,
  };
}
```

---

### STEP 2 — Create `src/hooks/usePrescriptions.ts`

```ts
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export interface MedicineInput {
  name: string;
  dose: string;
  freq: string;
  days: number;
}

export function usePrescriptions() {
  const { profile } = useAuth();
  const [saving, setSaving] = useState(false);

  const savePrescription = async (
    tokenId: string,
    patientId: string,
    diagnosis: string,
    notes: string,
    medicines: MedicineInput[]
  ) => {
    if (!profile?.id) throw new Error("Not authenticated");
    setSaving(true);

    try {
      // 1. Create prescription record
      const { data: rx, error: rxError } = await supabase
        .from("prescriptions")
        .insert({
          token_id: tokenId,
          patient_id: patientId,
          doctor_id: profile.id,
          diagnosis: diagnosis || null,
          notes: notes || null,
        })
        .select()
        .single();

      if (rxError) throw rxError;

      // 2. Insert medicines
      if (medicines.length > 0) {
        const { error: medError } = await supabase
          .from("prescription_medicines")
          .insert(medicines.map((m, i) => ({
            prescription_id: rx.id,
            medicine_name: m.name,
            dose: m.dose || null,
            frequency: m.freq,
            duration_days: m.days,
            display_order: i,
          })));
        if (medError) throw medError;
      }

      // 3. Mark token as done
      await supabase.from("tokens").update({
        status: "done",
        completed_at: new Date().toISOString(),
      }).eq("id", tokenId);

      // 4. Create medicine reminders for patient
      if (medicines.length > 0) {
        const startDate = new Date().toISOString().split("T")[0];
        const reminders = medicines.map(m => {
          const end = new Date();
          end.setDate(end.getDate() + m.days);
          return {
            patient_id: patientId,
            medicine_name: m.name,
            dose: m.dose || null,
            reminder_times: freqToTimes(m.freq),
            start_date: startDate,
            end_date: end.toISOString().split("T")[0],
            is_active: true,
          };
        });
        // Don't throw if reminders fail — non-critical
        await supabase.from("medicine_reminders").insert(reminders).then(() => {});
      }

      return rx;
    } finally {
      setSaving(false);
    }
  };

  // Fetch all prescriptions for a doctor (today or all time)
  const fetchDoctorPrescriptions = async (todayOnly = true) => {
    if (!profile?.id) return [];

    let query = supabase
      .from("prescriptions")
      .select(`
        id, diagnosis, notes, created_at,
        patient_id,
        profiles!prescriptions_patient_id_fkey ( full_name, phone ),
        tokens ( token_number, completed_at ),
        prescription_medicines (
          medicine_name, dose, frequency, duration_days, display_order
        )
      `)
      .eq("doctor_id", profile.id)
      .order("created_at", { ascending: false });

    if (todayOnly) {
      const today = new Date().toISOString().split("T")[0];
      query = query.gte("created_at", `${today}T00:00:00`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };

  return { savePrescription, fetchDoctorPrescriptions, saving };
}

function freqToTimes(freq: string): string[] {
  const map: Record<string, string[]> = {
    "Once daily":   ["09:00"],
    "Twice daily":  ["09:00", "21:00"],
    "Thrice daily": ["08:00", "14:00", "20:00"],
    "At night":     ["21:00"],
    "SOS/As needed": [],
  };
  return map[freq] ?? ["09:00"];
}
```

---

### STEP 3 — Create `src/hooks/usePatientQueue.ts`

```ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export interface SymptomTag {
  id: string;
  label: string;
  emoji: string;
  category: string;
  is_emergency: boolean;
  display_order: number;
}

export interface AvailableDoctor {
  id: string;
  full_name: string;
  specialty: string | null;
  clinic_name: string | null;
}

export function usePatientQueue() {
  const { profile } = useAuth();
  const [booking, setBooking] = useState(false);
  const [myTokens, setMyTokens] = useState<any[]>([]);
  const [myPrescriptions, setMyPrescriptions] = useState<any[]>([]);
  const [myReminders, setMyReminders] = useState<any[]>([]);
  const [symptomTags, setSymptomTags] = useState<SymptomTag[]>([]);
  const [doctors, setDoctors] = useState<AvailableDoctor[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);

  // Load symptom tags from DB on mount
  useEffect(() => {
    supabase
      .from("symptom_tags")
      .select("*")
      .order("display_order")
      .then(({ data }) => {
        setSymptomTags(data || []);
        setLoadingTags(false);
      });
  }, []);

  // Load available doctors
  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, full_name, doctor_profiles(specialty, clinic_name)")
      .eq("role", "doctor")
      .eq("approved", true)
      .then(({ data }) => {
        setDoctors((data || []).map((d: any) => ({
          id: d.id,
          full_name: d.full_name,
          specialty: d.doctor_profiles?.specialty ?? null,
          clinic_name: d.doctor_profiles?.clinic_name ?? null,
        })));
      });
  }, []);

  const bookToken = async (
    doctorId: string,
    selectedTags: string[],
    customSymptoms: string
  ) => {
    if (!profile?.id) throw new Error("Not logged in");
    setBooking(true);

    try {
      const today = new Date().toISOString().split("T")[0];

      // Generate token number via DB function
      const { data: tokenNum, error: fnError } = await supabase
        .rpc("generate_token_number", { p_doctor_id: doctorId, p_date: today });
      if (fnError) throw fnError;

      const EMERGENCY_TAGS = ["Emergency", "Injury / Wound", "Chest Pain"];
      const isEmergency = selectedTags.some(t => EMERGENCY_TAGS.includes(t));

      const { data, error } = await supabase
        .from("tokens")
        .insert({
          token_number: tokenNum,
          patient_id: profile.id,
          doctor_id: doctorId,
          clinic_date: today,
          status: "waiting",
          priority: isEmergency ? "critical" : "normal",
          symptom_tags: selectedTags,
          custom_symptoms: customSymptoms || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Also log to symptom_reports for outbreak tracking (anonymous)
      if (selectedTags.length > 0) {
        const today2 = new Date().toISOString().split("T")[0];
        for (const tag of selectedTags) {
          await supabase.rpc("upsert_symptom_report", {
            p_date: today2,
            p_symptom: tag,
          }).then(() => {}); // non-critical
        }
      }

      await fetchMyTokens();
      return data;
    } finally {
      setBooking(false);
    }
  };

  const fetchMyTokens = async () => {
    if (!profile?.id) return;
    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
      .from("tokens")
      .select(`
        *,
        profiles!tokens_doctor_id_fkey ( full_name, specialty )
      `)
      .eq("patient_id", profile.id)
      .eq("clinic_date", today)
      .order("created_at", { ascending: false });

    setMyTokens(data || []);
  };

  const fetchMyPrescriptions = async () => {
    if (!profile?.id) return;

    const { data } = await supabase
      .from("prescriptions")
      .select(`
        id, diagnosis, notes, created_at,
        profiles!prescriptions_doctor_id_fkey ( full_name ),
        tokens ( token_number ),
        prescription_medicines (
          medicine_name, dose, frequency, duration_days, display_order
        )
      `)
      .eq("patient_id", profile.id)
      .order("created_at", { ascending: false });

    setMyPrescriptions(data || []);
  };

  const fetchMyReminders = async () => {
    if (!profile?.id) return;

    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("medicine_reminders")
      .select("*")
      .eq("patient_id", profile.id)
      .eq("is_active", true)
      .gte("end_date", today)
      .order("start_date", { ascending: false });

    setMyReminders(data || []);
  };

  useEffect(() => {
    if (profile?.id) {
      fetchMyTokens();
      fetchMyPrescriptions();
      fetchMyReminders();
    }
  }, [profile?.id]);

  return {
    bookToken, booking,
    myTokens, fetchMyTokens,
    myPrescriptions, fetchMyPrescriptions,
    myReminders, fetchMyReminders,
    symptomTags, loadingTags,
    doctors,
  };
}
```

---

### STEP 4 — Create `src/components/RealPrescriptionModal.tsx`

This replaces `PrescriptionModal.tsx` for real data. Uses the dark glass theme from AuthLayout.

```tsx
import { useState } from "react";
import { QueuePatient } from "@/hooks/useQueue";
import { MedicineInput, usePrescriptions } from "@/hooks/usePrescriptions";
import { MEDICINE_DB } from "@/data/mockData";
import { X, Plus, Stethoscope } from "lucide-react";

interface Props {
  patient: QueuePatient;
  onClose: () => void;
  onSaved: () => void;
}

export function RealPrescriptionModal({ patient, onClose, onSaved }: Props) {
  const { savePrescription, saving } = usePrescriptions();
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState<MedicineInput[]>([]);
  const [medInput, setMedInput] = useState("");
  const [medDose, setMedDose] = useState("");
  const [medFreq, setMedFreq] = useState("Once daily");
  const [medDays, setMedDays] = useState("5");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState("");

  const handleMedInput = (v: string) => {
    setMedInput(v);
    setSuggestions(v.length > 1
      ? MEDICINE_DB.filter(m => m.toLowerCase().includes(v.toLowerCase())).slice(0, 6)
      : []
    );
  };

  const addMed = () => {
    if (!medInput.trim()) return;
    setMedicines(prev => [...prev, {
      name: medInput,
      dose: medDose,
      freq: medFreq,
      days: parseInt(medDays) || 5,
    }]);
    setMedInput(""); setMedDose(""); setMedFreq("Once daily"); setMedDays("5");
    setSuggestions([]);
  };

  const handleSave = async () => {
    setError("");
    try {
      await savePrescription(patient.id, patient.patient_id, diagnosis, notes, medicines);
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save. Please try again.");
    }
  };

  const symptomDisplay = patient.symptom_tags.length > 0
    ? patient.symptom_tags.join(", ")
    : patient.custom_symptoms || "No symptoms noted";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(7, 16, 27, 0.75)", backdropFilter: "blur(8px)" }}>

      <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-[28px] border border-zinc-300/10 bg-zinc-300/[0.07] backdrop-blur-xl shadow-[0_24px_64px_rgba(0,0,0,0.5)]">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-[28px] border-b border-zinc-300/10 bg-zinc-900/80 backdrop-blur-md px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-sky-400" />
              <span className="font-bold text-white text-base">Write Prescription</span>
            </div>
            <p className="text-white/50 text-xs mt-0.5">
              {patient.patient_name} · {patient.token_number}
              {patient.patient_age ? ` · Age ${patient.patient_age}` : ""}
            </p>
          </div>
          <button onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-300/10 bg-zinc-300/[0.07] text-white/60 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">

          {/* Symptoms */}
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.07] p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-300/80 mb-1.5">
              Reported Symptoms
            </p>
            <p className="text-white/80 text-sm leading-relaxed">{symptomDisplay}</p>
          </div>

          {/* Diagnosis */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">
              Diagnosis
            </label>
            <input value={diagnosis} onChange={e => setDiagnosis(e.target.value)}
              placeholder="Enter diagnosis..."
              className="w-full rounded-xl border border-zinc-300/10 bg-zinc-300/[0.06] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-sky-400/40 focus:ring-1 focus:ring-sky-400/20 transition-all" />
          </div>

          {/* Add Medicine */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">
              Add Medicine
            </label>
            <div className="relative mb-3">
              <input value={medInput} onChange={e => handleMedInput(e.target.value)}
                placeholder="Search or type medicine name..."
                className="w-full rounded-xl border border-zinc-300/10 bg-zinc-300/[0.06] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-sky-400/40 focus:ring-1 focus:ring-sky-400/20 transition-all" />
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 z-20 rounded-xl border border-zinc-300/10 bg-zinc-900/95 backdrop-blur-md shadow-xl overflow-hidden">
                  {suggestions.map(m => (
                    <button key={m} onClick={() => { setMedInput(m); setSuggestions([]); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:bg-zinc-300/[0.08] transition-colors border-b border-zinc-300/[0.06] last:border-0">
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <input value={medDose} onChange={e => setMedDose(e.target.value)} placeholder="Dose (500mg)"
                className="px-3 py-2.5 rounded-xl border border-zinc-300/10 bg-zinc-300/[0.06] text-white text-xs placeholder:text-white/25 outline-none focus:border-sky-400/40 transition-all" />
              <select value={medFreq} onChange={e => setMedFreq(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-zinc-300/10 bg-zinc-900 text-white text-xs outline-none focus:border-sky-400/40 transition-all cursor-pointer">
                {["Once daily", "Twice daily", "Thrice daily", "At night", "SOS/As needed"].map(f =>
                  <option key={f}>{f}</option>
                )}
              </select>
              <input type="number" value={medDays} onChange={e => setMedDays(e.target.value)}
                placeholder="Days"
                className="px-3 py-2.5 rounded-xl border border-zinc-300/10 bg-zinc-300/[0.06] text-white text-xs placeholder:text-white/25 outline-none focus:border-sky-400/40 transition-all" />
            </div>
            <button onClick={addMed}
              className="inline-flex items-center gap-2 rounded-xl border border-sky-400/25 bg-sky-500/[0.18] px-4 py-2.5 text-sm font-semibold text-sky-200 hover:bg-sky-500/[0.28] transition-colors">
              <Plus className="h-3.5 w-3.5" /> Add Medicine
            </button>
          </div>

          {/* Medicine list */}
          {medicines.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-white/50">
                Medicines ({medicines.length})
              </label>
              {medicines.map((m, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-sky-400/20 bg-sky-500/[0.08] px-4 py-3">
                  <div>
                    <span className="font-semibold text-sky-300 text-sm">{m.name}</span>
                    <span className="text-white/50 text-xs ml-2">
                      {m.dose} · {m.freq} · {m.days}d
                    </span>
                  </div>
                  <button onClick={() => setMedicines(prev => prev.filter((_, j) => j !== i))}
                    className="text-white/30 hover:text-red-400 text-xl leading-none ml-3 transition-colors">
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">
              Doctor's Notes (optional)
            </label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              placeholder="Advice, follow-up instructions..."
              className="w-full rounded-xl border border-zinc-300/10 bg-zinc-300/[0.06] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-sky-400/40 resize-none transition-all" />
          </div>

          {error && (
            <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button onClick={handleSave} disabled={saving}
            className="group relative h-12 w-full overflow-hidden rounded-2xl border border-blue-300/35 bg-[linear-gradient(180deg,#60a5fa_0%,#3b82f6_42%,#2563eb_100%)] text-base font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(59,130,246,0.34)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
            <span className="relative z-10">
              {saving ? "Saving prescription..." : "Save & Complete Consultation"}
            </span>
            <span className="pointer-events-none absolute inset-x-3 top-[1px] h-[46%] rounded-[14px] bg-white/12 blur-md" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### STEP 5 — Update `DoctorDashboard.tsx`

Replace the top imports and state. Keep all JSX exactly as is.

**Remove these imports:**
```ts
import { usePatientState } from "@/hooks/usePatientState";
import { Patient, Medicine } from "@/data/mockData";
import { PrescriptionModal } from "@/components/PrescriptionModal";
```

**Add these imports:**
```ts
import { useQueue, QueuePatient } from "@/hooks/useQueue";
import { RealPrescriptionModal } from "@/components/RealPrescriptionModal";
```

**Replace the state block** (everything from `const state = usePatientState()` down to `const completePatient`):
```ts
const {
  queue, waiting, serving, done, sortedWait,
  callNext, changePriority, skipPatient, completePatient,
  loading: queueLoading, toast,
} = useQueue();

const [rxPatient, setRxPatient] = useState<QueuePatient | null>(null);
const onPrescribe = (p: QueuePatient) => setRxPatient(p);

// Remove onSaveRx — no longer needed (RealPrescriptionModal handles saving internally)
// Remove onChangePriority, skipPatient, completePatient definitions — now from useQueue
```

**Replace the PrescriptionModal JSX:**
```tsx
// Old:
{rxPatient && (
  <PrescriptionModal patient={rxPatient} onClose={() => setRxPatient(null)} onSave={onSaveRx} />
)}

// New:
{rxPatient && (
  <RealPrescriptionModal
    patient={rxPatient}
    onClose={() => setRxPatient(null)}
    onSaved={() => setRxPatient(null)}
  />
)}
```

**Update ToastNotification** — it now uses `toast` from `useQueue`:
```tsx
<ToastNotification toast={toast} />
```

**Update the header "in queue" badge:**
```tsx
// was: state.waiting.length
// now:
{waiting.length} in queue
```

**Update tab renders** — pass real data:
```tsx
{activeTab === "overview" && (
  <OverviewTab
    patients={queue}          // QueuePatient[] instead of Patient[]
    waiting={waiting}
    serving={serving}
    done={done}
    callNext={callNext}
    onPrescribe={onPrescribe}
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

{activeTab === "patients" && <PatientsTab patients={queue} />}
{activeTab === "prescriptions" && <PrescriptionsTab done={done} />}
{activeTab === "rx-generator" && (
  <PrescriptionGenerator patients={queue} onPrescribe={onPrescribe} />
)}
// AppointmentsTab, AnalyticsTab, OutbreakTab, SettingsTab — leave unchanged for now
```

---

### STEP 6 — Update `QueueTab.tsx` for real data types

**Change the props interface:**
```ts
// Old:
import { Patient, PRIORITY_META, STATUS_META } from "@/data/mockData";
interface QueueTabProps {
  patients: Patient[];
  waiting: Patient[];
  serving: Patient | undefined;
  done: Patient[];
  sortedWait: Patient[];
  callNext: () => string | null;
  onPrescribe: (p: Patient) => void;
  onChangePriority: (id: number, priority: "critical" | "normal" | "low") => void;
  onSkip: (id: number) => void;
  onComplete: (id: number) => void;
}

// New:
import { QueuePatient } from "@/hooks/useQueue";
import { PRIORITY_META, STATUS_META } from "@/data/mockData"; // keep these for badge styles
interface QueueTabProps {
  patients: QueuePatient[];
  waiting: QueuePatient[];
  serving: QueuePatient | undefined;
  done: QueuePatient[];
  sortedWait: QueuePatient[];
  callNext: () => Promise<void>;
  onPrescribe: (p: QueuePatient) => void;
  onChangePriority: (id: string, priority: "critical" | "normal" | "low") => Promise<void>;
  onSkip: (id: string) => Promise<void>;
  onComplete: (id: string) => Promise<void>;
}
```

**Field name replacements in JSX:**
```
p.id          → p.id          (same, but now string not number)
p.token       → p.token_number
p.name        → p.patient_name
p.symptoms    → p.symptom_tags.join(", ") || p.custom_symptoms || "—"
p.waitMins    → p.estimated_wait_minutes ?? 0
p.consultAt   → p.completed_at ? new Date(p.completed_at).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}) : null
```

---

### STEP 7 — Update `PatientsTab.tsx` field names

Same field name changes as Step 6. Also update the props:
```ts
import { QueuePatient } from "@/hooks/useQueue";
interface PatientsTabProps {
  patients: QueuePatient[];
}
```

Replace field references:
- `p.name` → `p.patient_name`
- `p.token` → `p.token_number`
- `p.age` → `p.patient_age ?? "—"`
- `p.phone` → `p.patient_phone ?? "—"`
- `p.symptoms` → `p.symptom_tags.join(", ") || p.custom_symptoms || "No symptoms"`

---

### STEP 8 — Update `OverviewTab.tsx` field names

Same pattern. The `WEEKLY_DATA` and `APPOINTMENTS` can stay as mock data for now.

Props change:
```ts
import { QueuePatient } from "@/hooks/useQueue";
interface OverviewTabProps {
  patients: QueuePatient[];
  waiting: QueuePatient[];
  serving: QueuePatient | undefined;
  done: QueuePatient[];
  callNext: () => Promise<void>;
  onPrescribe: (p: QueuePatient) => void;
}
```

Field updates:
- `serving.token` → `serving.token_number`
- `serving.name` → `serving.patient_name`
- `serving.symptoms` → `serving.symptom_tags.join(", ") || serving.custom_symptoms`
- `p.token` → `p.token_number`
- `p.name` → `p.patient_name`
- `p.waitMins` → `p.estimated_wait_minutes`
- `withRx = done.filter(p => p.medicines.length > 0)` → **remove this**, prescriptions are now separate table

---

### STEP 9 — Update `PrescriptionsTab.tsx` to fetch real data

```tsx
import { useEffect, useState } from "react";
import { usePrescriptions } from "@/hooks/usePrescriptions";
import { BadgeChip } from "@/components/BadgeChip";
import { Download, Search } from "lucide-react";

export function PrescriptionsTab() {
  const { fetchDoctorPrescriptions } = usePrescriptions();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctorPrescriptions(true).then(data => {
      setPrescriptions(data);
      setLoading(false);
    });
  }, []);

  const filtered = prescriptions.filter(rx =>
    rx.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    rx.tokens?.token_number?.toLowerCase().includes(search.toLowerCase())
  );

  // Keep same JSX structure, map new fields:
  // rx.profiles.full_name → patient name
  // rx.tokens.token_number → token
  // rx.diagnosis → diagnosis
  // rx.prescription_medicines → medicines array
  // rx.created_at → date
  // medicine.medicine_name, medicine.dose, medicine.frequency, medicine.duration_days
}
```

---

### STEP 10 — Update `PatientApp.tsx` for real data

**Replace imports:**
```ts
// Remove:
import { usePatientState } from "@/hooks/usePatientState";
import { Patient, STATUS_META, APPOINTMENTS } from "@/data/mockData";

// Add:
import { usePatientQueue } from "@/hooks/usePatientQueue";
import { useAuth } from "@/hooks/useAuth";
import { STATUS_META } from "@/data/mockData"; // keep for badge styles
```

**Replace state setup:**
```ts
// Remove: const state = usePatientState();
// Add:
const { profile } = useAuth();
const {
  bookToken, booking,
  myTokens, fetchMyTokens,
  myPrescriptions, fetchMyPrescriptions,
  myReminders,
  symptomTags, loadingTags,
  doctors,
} = usePatientQueue();

const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
const [selectedDoctor, setSelectedDoctor] = useState<string>("");
const [selectedTags, setSelectedTags] = useState<string[]>([]);
const [customSymptoms, setCustomSymptoms] = useState("");
const [issuedToken, setIssuedToken] = useState<any | null>(null);

const notify = (msg: string, type = "ok") => {
  setToast({ msg, type });
  setTimeout(() => setToast(null), 3000);
};
```

**Replace `bookToken` function:**
```ts
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
```

**Replace BOOK TAB JSX** — add doctor selector + symptom tag chips:
```tsx
{/* Doctor Selection */}
<div>
  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
    Select Doctor
  </label>
  <select value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)}
    className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
    <option value="">Choose a doctor...</option>
    {doctors.map(d => (
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
    {symptomTags.map(tag => {
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
```

**Replace PRESCRIPTIONS TAB** to use `myPrescriptions` state:
```tsx
{pTab === "prescriptions" && (
  <div className="animate-fade-up space-y-4">
    <h2 className="font-bold text-foreground text-lg">My Prescriptions</h2>
    {myPrescriptions.length === 0 ? (
      <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border border-border">
        <div className="text-4xl mb-2">💊</div>
        <div className="font-semibold">No prescriptions yet</div>
      </div>
    ) : (
      myPrescriptions.map(rx => (
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
    )}
  </div>
)}
```

**Update STATUS TAB** — use `myTokens` instead of `state.patients`:
```tsx
{/* In queue status search, search myTokens array */}
const searchPatient = () => {
  const q = searchQ.trim().toLowerCase();
  const p = myTokens.find(x =>
    x.token_number.toLowerCase() === q || x.profiles?.phone === q
  );
  setFoundPat(p || "notfound");
};

{/* Update foundPat display fields */}
// foundPat.patient_name or profile lookup
// foundPat.token_number
// foundPat.estimated_wait_minutes
// foundPat.status
```

**Update PROFILE TAB** — use real profile data:
```tsx
{pTab === "profile" && (
  <div className="animate-fade-up space-y-4">
    <div className="bg-card rounded-2xl border border-border shadow-card p-6 text-center">
      <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold mx-auto mb-4">
        {profile?.full_name?.charAt(0)?.toUpperCase() || "P"}
      </div>
      <div className="font-bold text-foreground text-lg">{profile?.full_name}</div>
      <div className="text-muted-foreground text-sm">{profile?.phone || profile?.email}</div>
    </div>
    ...
  </div>
)}
```

---

### STEP 11 — Add upsert_symptom_report DB function in Supabase

Run this SQL in Supabase SQL Editor:

```sql
create or replace function upsert_symptom_report(p_date date, p_symptom text)
returns void as $$
begin
  insert into symptom_reports (report_date, symptom_tag, count)
  values (p_date, p_symptom, 1)
  on conflict (report_date, symptom_tag)
  do update set count = symptom_reports.count + 1;
end;
$$ language plpgsql security definer;
```

---

### STEP 12 — Update `OutbreakTab.tsx` to use real symptom_reports

```tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function OutbreakTab() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    supabase
      .from("symptom_reports")
      .select("*")
      .gte("report_date", sevenDaysAgo.toISOString().split("T")[0])
      .order("report_date", { ascending: true })
      .then(({ data }) => {
        setReports(data || []);
        setLoading(false);
      });
  }, []);

  // Transform reports into chart data
  // Group by date, then by symptom_tag
  // Keep existing JSX structure, replace OUTBREAK_DATA with transformed reports
}
```

---

### STEP 13 — Update `AnalyticsTab.tsx` to use real tokens data

```tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export function AnalyticsTab() {
  const { profile } = useAuth();
  const [weeklyData, setWeeklyData] = useState<{day: string, value: number}[]>([]);
  const [conditions, setConditions] = useState<{name: string, count: number}[]>([]);

  useEffect(() => {
    if (!profile?.id) return;

    // Get last 7 days token counts
    const days = Array.from({length: 7}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });

    supabase
      .from("tokens")
      .select("clinic_date")
      .eq("doctor_id", profile.id)
      .in("clinic_date", days)
      .then(({ data }) => {
        const counts = days.map(day => ({
          day: new Date(day).toLocaleDateString("en", { weekday: "short" }),
          value: (data || []).filter(t => t.clinic_date === day).length,
        }));
        setWeeklyData(counts);
      });
  }, [profile?.id]);

  // Replace WEEKLY_DATA with weeklyData in chart JSX
}
```

---

## SECTION 10 — EXECUTION ORDER (do these in sequence, test after each)

```
1.  Create src/hooks/useQueue.ts
2.  Create src/hooks/usePrescriptions.ts
3.  Create src/hooks/usePatientQueue.ts
4.  Create src/components/RealPrescriptionModal.tsx
5.  Run SQL: upsert_symptom_report function in Supabase
6.  Update DoctorDashboard.tsx (swap usePatientState → useQueue, swap modal)
7.  Update QueueTab.tsx (types + field names)
8.  TEST: Doctor dashboard loads queue from real DB, call next works
9.  Update PatientsTab.tsx (field names)
10. Update OverviewTab.tsx (field names)
11. Update PrescriptionsTab.tsx (real data fetch)
12. TEST: Doctor can write prescription, it saves to DB
13. Update PatientApp.tsx (real booking + prescriptions)
14. TEST: Patient books token, appears in doctor queue
15. Update OutbreakTab.tsx (real symptom_reports)
16. Update AnalyticsTab.tsx (real token counts)
17. Update SettingsTab.tsx (read/write clinic_settings)
```

---

## SECTION 11 — FIELD NAME MAPPING CHEAT SHEET

| Mock `Patient` field | Real `QueuePatient` field |
|---|---|
| `p.id` (number) | `p.id` (string uuid) |
| `p.token` | `p.token_number` |
| `p.name` | `p.patient_name` |
| `p.age` | `p.patient_age` |
| `p.phone` | `p.patient_phone` |
| `p.symptoms` | `p.symptom_tags.join(", ") \|\| p.custom_symptoms` |
| `p.waitMins` | `p.estimated_wait_minutes` |
| `p.medicines` | (separate prescriptions table) |
| `p.diagnosis` | (separate prescriptions table) |
| `p.consultAt` | `p.completed_at` |
| `p.status` | `p.status` (same values) |
| `p.priority` | `p.priority` (same values) |

---

## SECTION 12 — ENVIRONMENT VARIABLES

```env
# .env file in project root
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## SECTION 13 — KEY THINGS TO KNOW FOR NEXT CHAT

1. **`useAuth` is in `src/hooks/useAuth.tsx`** — it contains AuthContext, AuthProvider, AND the hook all in one file. `AuthContext.tsx` in `/context/` is empty and unused.

2. **`AuthProvider` is inside `BrowserRouter` in `App.tsx`** — NOT in `main.tsx`.

3. **`usePatientState.ts` is the current mock state manager** — it gets fully replaced by `useQueue.ts` on the doctor side and `usePatientQueue.ts` on the patient side.

4. **`PrescriptionModal.tsx`** (old) uses `Patient` from mockData. **`RealPrescriptionModal.tsx`** (new) uses `QueuePatient` from `useQueue`. Both can coexist during migration.

5. **`PRIORITY_META` and `STATUS_META`** from `mockData.ts` are CSS class mappings — keep them, they are not data.

6. **`MEDICINE_DB`** from `mockData.ts` is the autocomplete list — keep it.

7. **RLS policies are on** — all Supabase queries must be from an authenticated user or they will return empty/error.

8. **Realtime is enabled on `tokens` table** — `useQueue.ts` subscribes to changes, so when patient books a token, it appears in doctor's queue automatically.

9. **Doctor approval** — when a doctor signs up, `approved = false`. Admin must manually set `approved = true` in Supabase Dashboard → Table Editor → profiles table. Then the doctor can log in to the dashboard.

10. **The visual design** — dark glass morphism (`bg-zinc-300/[0.08]`, `border-zinc-300/10`, `backdrop-blur-md`) on auth pages. Light card-based theme with Tailwind CSS variables on dashboard. Both use `Outfit` or the existing font stack.

---

## SECTION 14 — COMMON ERRORS AND FIXES

| Error | Cause | Fix |
|---|---|---|
| `Cannot read properties of undefined (reading 'id')` | `profile` is null — auth still loading | Wrap in `if (!profile?.id) return` |
| Empty queue on doctor dashboard | RLS policy blocking — doctor not approved | Check `approved = true` in profiles table |
| `generate_token_number` function not found | DB function not created yet | Run SQL from Section 9 Step 11 |
| Token booked but not showing in queue | Realtime not subscribed or wrong doctor_id | Check `useQueue` subscription filter |
| `PGRST116` error | No rows found — not an error, handle gracefully | Already handled in `getUserProfile` |
| Prescriptions not saving | RLS policy — user is patient not doctor | Make sure you're testing with doctor account |
