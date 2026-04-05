export interface Medicine {
  name: string;
  dose: string;
  freq: string;
  days: number;
}

export interface Patient {
  id: number;
  token: string;
  name: string;
  age: number;
  phone: string;
  symptoms: string;
  priority: "critical" | "normal" | "low";
  status: "waiting" | "serving" | "done";
  waitMins: number;
  consultAt: string | null;
  medicines: Medicine[];
  diagnosis: string;
}

export const PATIENTS_INIT: Patient[] = [
  { id: 1, token: "MQ-001", name: "Rajesh Kumar", age: 45, phone: "9876543210", symptoms: "Fever and headache for 2 days. Temperature 101°F.", priority: "critical", status: "waiting", waitMins: 5, consultAt: null, medicines: [], diagnosis: "" },
  { id: 2, token: "MQ-002", name: "Priya Sharma", age: 32, phone: "9765432109", symptoms: "Persistent cough, mild sore throat, nasal congestion.", priority: "normal", status: "waiting", waitMins: 13, consultAt: null, medicines: [], diagnosis: "" },
  { id: 3, token: "MQ-003", name: "Anita Desai", age: 60, phone: "9654321098", symptoms: "Diabetes follow-up. Fasting sugar 210 mg/dL.", priority: "normal", status: "waiting", waitMins: 21, consultAt: null, medicines: [], diagnosis: "" },
  { id: 4, token: "MQ-004", name: "Mohan Patel", age: 28, phone: "9543210987", symptoms: "Lower back pain since 3 days, difficulty in bending.", priority: "low", status: "waiting", waitMins: 29, consultAt: null, medicines: [], diagnosis: "" },
  { id: 5, token: "MQ-005", name: "Sunita Rao", age: 52, phone: "9432109876", symptoms: "High BP, dizziness since this morning.", priority: "critical", status: "waiting", waitMins: 37, consultAt: null, medicines: [], diagnosis: "" },
  {
    id: 6, token: "MQ-006", name: "Vikram Singh", age: 35, phone: "9321098765", symptoms: "Skin rash on forearms, severe itching.", priority: "normal", status: "done", waitMins: 0, consultAt: "10:30 AM",
    medicines: [{ name: "Cetirizine", dose: "10mg", freq: "Once daily", days: 5 }, { name: "Calamine Lotion", dose: "Apply thin layer", freq: "Twice daily", days: 7 }],
    diagnosis: "Allergic dermatitis"
  },
  {
    id: 7, token: "MQ-007", name: "Kavita Joshi", age: 40, phone: "9210987654", symptoms: "Migraine, nausea, sensitivity to light.", priority: "normal", status: "done", waitMins: 0, consultAt: "09:45 AM",
    medicines: [{ name: "Sumatriptan", dose: "50mg", freq: "SOS/As needed", days: 10 }, { name: "Domperidone", dose: "10mg", freq: "Thrice daily", days: 3 }],
    diagnosis: "Migraine with aura"
  },
];

export const MEDICINE_DB = [
  "Paracetamol 500mg", "Amoxicillin 500mg", "Cetirizine 10mg", "Omeprazole 20mg",
  "Metformin 500mg", "Atenolol 50mg", "Azithromycin 500mg", "Ibuprofen 400mg",
  "Pantoprazole 40mg", "Montelukast 10mg", "Calamine Lotion", "ORS Sachet",
  "Vitamin C 500mg", "B-Complex", "Calcium + D3", "Doxycycline 100mg",
  "Sumatriptan 50mg", "Domperidone 10mg", "Prednisolone 5mg", "Salbutamol Inhaler",
];

export const OUTBREAK_DATA = [
  { day: "Mon", fever: 3, cough: 2, other: 1 },
  { day: "Tue", fever: 5, cough: 3, other: 2 },
  { day: "Wed", fever: 7, cough: 4, other: 1 },
  { day: "Thu", fever: 12, cough: 6, other: 3 },
  { day: "Fri", fever: 14, cough: 8, other: 2 },
  { day: "Sat", fever: 9, cough: 5, other: 4 },
  { day: "Sun", fever: 6, cough: 3, other: 2 },
];

export const WEEKLY_DATA = [
  { day: "Mon", value: 18 }, { day: "Tue", value: 22 }, { day: "Wed", value: 30 },
  { day: "Thu", value: 27 }, { day: "Fri", value: 35 }, { day: "Sat", value: 24 },
  { day: "Sun", value: 12 },
];

export const PRIORITY_META = {
  critical: { label: "Critical", dotClass: "bg-destructive", badgeClass: "bg-destructive/10 text-destructive border border-destructive/20", ringClass: "border-l-destructive" },
  normal: { label: "Normal", dotClass: "bg-primary", badgeClass: "bg-primary/10 text-primary border border-primary/20", ringClass: "border-l-primary" },
  low: { label: "Low", dotClass: "bg-success", badgeClass: "bg-success/10 text-success border border-success/20", ringClass: "border-l-success" },
};

export const STATUS_META = {
  waiting: { label: "Waiting", badgeClass: "bg-warning/10 text-warning border border-warning/20" },
  serving: { label: "In Room", badgeClass: "bg-violet/10 text-violet border border-violet/20" },
  done: { label: "Done", badgeClass: "bg-success/10 text-success border border-success/20" },
};

export const APPOINTMENTS = [
  { id: 1, patientName: "Rajesh Kumar", time: "09:00 AM", type: "Follow-up", status: "confirmed" },
  { id: 2, patientName: "Priya Sharma", time: "09:30 AM", type: "New Visit", status: "confirmed" },
  { id: 3, patientName: "Anita Desai", time: "10:00 AM", type: "Follow-up", status: "confirmed" },
  { id: 4, patientName: "Mohan Patel", time: "10:30 AM", type: "New Visit", status: "pending" },
  { id: 5, patientName: "Sunita Rao", time: "11:00 AM", type: "Emergency", status: "confirmed" },
  { id: 6, patientName: "Deepak Verma", time: "11:30 AM", type: "New Visit", status: "cancelled" },
  { id: 7, patientName: "Meera Nair", time: "02:00 PM", type: "Follow-up", status: "pending" },
  { id: 8, patientName: "Amit Gupta", time: "02:30 PM", type: "New Visit", status: "confirmed" },
];
