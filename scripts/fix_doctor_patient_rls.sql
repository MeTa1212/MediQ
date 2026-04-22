-- ============================================================
-- Issue 2: Allow doctors to see patient profiles in their queue
-- Safe to run multiple times. Does NOT alter existing policies.
-- Run in Supabase SQL Editor.
-- ============================================================

-- Policy 1: Doctors can view profiles of patients who have tokens assigned to them
-- This is secure: only reveals patients actually in the doctor's queue
DROP POLICY IF EXISTS "doctors_view_queue_patients" ON public.profiles;

CREATE POLICY "doctors_view_queue_patients"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tokens t
    WHERE t.patient_id = profiles.id
      AND t.doctor_id = auth.uid()
  )
);

-- Policy 2: Doctors can view patient_profiles (age, blood group, etc.) for their queue patients
DROP POLICY IF EXISTS "doctors_view_queue_patient_profiles" ON public.patient_profiles;

CREATE POLICY "doctors_view_queue_patient_profiles"
ON public.patient_profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tokens t
    WHERE t.patient_id = patient_profiles.id
      AND t.doctor_id = auth.uid()
  )
);

-- ============================================================
-- DONE ✅ Doctors can now see patient names and ages in queue
-- ============================================================
