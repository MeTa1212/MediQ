-- ============================================================
-- Issue 7: Medicine Alerts / Reminders Table & RLS
-- Safe to run multiple times (IF NOT EXISTS / DROP IF EXISTS).
-- Run in Supabase SQL Editor.
-- ============================================================

-- ============================================================
-- PART 1: CREATE TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.medicine_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  medicine_name text NOT NULL,
  dosage text,
  frequency text NOT NULL,
  duration_days integer NOT NULL DEFAULT 5,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- PART 2: ENABLE RLS
-- ============================================================

ALTER TABLE public.medicine_reminders ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PART 3: RLS POLICIES
-- ============================================================

-- Patients can read their own reminders
DROP POLICY IF EXISTS "patients_read_own_reminders" ON public.medicine_reminders;
CREATE POLICY "patients_read_own_reminders"
ON public.medicine_reminders
FOR SELECT
USING (auth.uid() = patient_id);

-- Doctors can insert reminders for patients (usually done via prescription flow)
DROP POLICY IF EXISTS "doctors_insert_reminders" ON public.medicine_reminders;
CREATE POLICY "doctors_insert_reminders"
ON public.medicine_reminders
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'doctor'
  )
);

-- ============================================================
-- DONE ✅ Reminders now have proper tables and RLS
-- ============================================================
