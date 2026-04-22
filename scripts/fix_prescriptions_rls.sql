-- ============================================================
-- Issue 6: Prescriptions + Prescription Medicines Tables & RLS
-- Safe to run multiple times (IF NOT EXISTS / DROP IF EXISTS).
-- Run in Supabase SQL Editor.
-- ============================================================

-- ============================================================
-- PART 1: CREATE TABLES (IF NOT EXISTS)
-- ============================================================

-- Prescriptions table
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id uuid REFERENCES public.tokens(id),
  patient_id uuid REFERENCES auth.users(id),
  doctor_id uuid REFERENCES auth.users(id),
  diagnosis text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Prescription medicines table
CREATE TABLE IF NOT EXISTS public.prescription_medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id uuid REFERENCES public.prescriptions(id) ON DELETE CASCADE,
  medicine_name text NOT NULL,
  dose text,
  frequency text NOT NULL,
  duration_days integer NOT NULL DEFAULT 5,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- PART 2: ENABLE RLS
-- ============================================================

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_medicines ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PART 3: RLS POLICIES FOR PRESCRIPTIONS
-- ============================================================

-- Patients can read their own prescriptions
DROP POLICY IF EXISTS "patients_read_own_prescriptions" ON public.prescriptions;
CREATE POLICY "patients_read_own_prescriptions"
ON public.prescriptions
FOR SELECT
USING (auth.uid() = patient_id);

-- Doctors can read prescriptions they wrote
DROP POLICY IF EXISTS "doctors_read_own_prescriptions" ON public.prescriptions;
CREATE POLICY "doctors_read_own_prescriptions"
ON public.prescriptions
FOR SELECT
USING (auth.uid() = doctor_id);

-- Doctors can insert prescriptions
DROP POLICY IF EXISTS "doctors_insert_prescriptions" ON public.prescriptions;
CREATE POLICY "doctors_insert_prescriptions"
ON public.prescriptions
FOR INSERT
WITH CHECK (auth.uid() = doctor_id);

-- ============================================================
-- PART 4: RLS POLICIES FOR PRESCRIPTION MEDICINES
-- ============================================================

-- Patients can read medicines for their prescriptions
DROP POLICY IF EXISTS "patients_read_prescription_medicines" ON public.prescription_medicines;
CREATE POLICY "patients_read_prescription_medicines"
ON public.prescription_medicines
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.prescriptions p
    WHERE p.id = prescription_medicines.prescription_id
      AND p.patient_id = auth.uid()
  )
);

-- Doctors can read medicines for prescriptions they wrote
DROP POLICY IF EXISTS "doctors_read_prescription_medicines" ON public.prescription_medicines;
CREATE POLICY "doctors_read_prescription_medicines"
ON public.prescription_medicines
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.prescriptions p
    WHERE p.id = prescription_medicines.prescription_id
      AND p.doctor_id = auth.uid()
  )
);

-- Doctors can insert prescription medicines
DROP POLICY IF EXISTS "doctors_insert_prescription_medicines" ON public.prescription_medicines;
CREATE POLICY "doctors_insert_prescription_medicines"
ON public.prescription_medicines
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.prescriptions p
    WHERE p.id = prescription_medicines.prescription_id
      AND p.doctor_id = auth.uid()
  )
);

-- ============================================================
-- DONE ✅ Prescriptions now have proper tables and RLS
-- ============================================================
