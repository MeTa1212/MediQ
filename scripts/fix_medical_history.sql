-- ============================================================
-- Issue 8: Medical History Table & RLS
-- Safe to run multiple times (IF NOT EXISTS / DROP IF EXISTS).
-- Run in Supabase SQL Editor.
-- ============================================================

-- ============================================================
-- PART 1: CREATE TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.medical_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  doctor_id uuid REFERENCES auth.users(id) NOT NULL,
  token_id uuid REFERENCES public.tokens(id),
  diagnosis text,
  notes text,
  visit_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- PART 2: ENABLE RLS
-- ============================================================

ALTER TABLE public.medical_history ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PART 3: RLS POLICIES
-- ============================================================

-- Patients can read their own medical history
DROP POLICY IF EXISTS "patients_read_own_history" ON public.medical_history;
CREATE POLICY "patients_read_own_history"
ON public.medical_history
FOR SELECT
USING (auth.uid() = patient_id);

-- Doctors can read medical history they wrote
DROP POLICY IF EXISTS "doctors_read_history" ON public.medical_history;
CREATE POLICY "doctors_read_history"
ON public.medical_history
FOR SELECT
USING (auth.uid() = doctor_id);

-- Any doctor can read history for patients in their queue (cross-doctor history)
DROP POLICY IF EXISTS "doctors_read_queue_patient_history" ON public.medical_history;
CREATE POLICY "doctors_read_queue_patient_history"
ON public.medical_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tokens t
    WHERE t.patient_id = medical_history.patient_id
      AND t.doctor_id = auth.uid()
  )
);

-- Doctors can insert medical history entries
DROP POLICY IF EXISTS "doctors_insert_history" ON public.medical_history;
CREATE POLICY "doctors_insert_history"
ON public.medical_history
FOR INSERT
WITH CHECK (auth.uid() = doctor_id);

-- ============================================================
-- DONE ✅ Medical history table ready with proper RLS
-- ============================================================
