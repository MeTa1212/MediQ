# MediQ

MediQ is a premium, state-of-the-art healthcare SaaS platform designed to streamline the interaction between patients and medical professionals. It features a modern, glassmorphic UI/UX and real-time capabilities to manage medical appointments and patient queues effectively.

## 🚀 Features

### 👥 Multi-Role Architecture
* **Patients:** Dedicated portal to discover doctors, book appointments, and monitor real-time queue status and wait times.
* **Doctors:** Professional dashboard to manage availability, oversee daily schedules, and handle patient queues efficiently.
* **Administrators:** Secure backend access to approve new doctor registrations, monitor platform statistics, and manage users.

### ⚡ Core Functionality
* **Real-time Queue Management:** Live updates on patient wait times and queue positions using Supabase Realtime.
* **Advanced Authentication:** Robust email-based signup/login flow with role-specific redirection and multi-table data synchronization (using Supabase triggers).
* **Premium UI/UX:** High-end, responsive design built with Tailwind CSS, leveraging glassmorphism, dynamic animations, and curated modern typography.
* **Secure Data Access:** Strict Row Level Security (RLS) policies ensuring patients and doctors only access their respective data.

## 🛠️ Technology Stack

* **Frontend Framework:** React 18 with TypeScript, built using Vite for blazing-fast performance.
* **Styling & UI:** Tailwind CSS, shadcn/ui (Radix UI primitives), and Lucide React icons.
* **Backend & Database:** Supabase (PostgreSQL, Authentication, Realtime subscriptions).
* **State Management & Data Fetching:** React Query (@tanstack/react-query) and React Context.
* **Routing:** React Router DOM v6.
* **Form Handling:** React Hook Form with Zod validation.

## 🔄 Application Workflow

### 1. Authentication Flow
* Users navigate to the landing page and choose to sign up or log in.
* During registration, users select their role (Patient or Doctor).
* Supabase Auth handles the initial user creation. A database trigger automatically populates the corresponding `profiles`, `patient_profiles`, or `doctor_profiles` tables based on the selected role.
* Email verification is required before accessing the platform.

### 2. Patient Journey
* **Dashboard:** Upon login, patients land on `PatientApp`, displaying their current status and upcoming appointments.
* **Discovery:** Patients can browse a directory of verified, available doctors.
* **Queueing:** Patients can join a doctor's queue. The system calculates an estimated wait time dynamically. If the queue is empty, wait times accurately reflect 0 minutes.
* **Real-time Updates:** As the doctor processes the queue, the patient's dashboard updates in real-time without requiring a page refresh.

### 3. Doctor Journey
* **Onboarding:** New doctors must wait for an Administrator to approve their profile before they appear in the patient-facing directory.
* **Dashboard:** Once approved, doctors access `DoctorDashboard` to view their daily schedule and active patient queue.
* **Management:** Doctors can start consultations, mark them as complete, and manage their availability status, which instantly reflects on the patient side.

### 4. Admin Journey
* **Secure Access:** Hidden, restricted routing for administrative tasks (`AdminDashboard`).
* **Verification:** Admins review pending doctor applications and approve/reject them to maintain platform quality.
* **Analytics:** Platform-wide statistics (total users, active appointments, etc.) are available for monitoring.

## 📁 Project Structure

```text
src/
├── components/     # Reusable UI components (buttons, dialogs, layouts, loaders)
├── context/        # React Context providers (AuthContext, etc.)
├── hooks/          # Custom React hooks (e.g., usePatientQueue)
├── lib/            # Utility functions and Supabase client configuration
├── pages/          # Main application views
│   ├── auth/       # Login, Signup, and verification pages
│   ├── AdminDashboard.tsx
│   ├── DoctorDashboard.tsx
│   ├── PatientApp.tsx
│   └── Landing.tsx
├── index.css       # Global styles and Tailwind configurations
└── main.tsx        # Application entry point
```

## 💻 Local Development Setup

### Prerequisites
* Node.js (v18 or higher)
* npm or yarn
* Supabase project (for backend services)

### Installation

1. **Clone the repository** (if applicable):
   ```bash
   git clone <repository-url>
   cd mediQ/MediQ
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

## 🧪 Testing and Linting
* Run linting: `npm run lint`
* Run tests: `npm run test`

---
*Built with ❤️ for a better healthcare experience.*
