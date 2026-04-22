-- ============================================================
-- FIX: Clean up duplicate RLS policies on profiles table
-- Root cause: infinite recursion from overlapping policies
-- This script drops ALL existing SELECT/INSERT/UPDATE policies
-- and re-creates only the necessary ones.
-- Run in Supabase SQL Editor.
-- ============================================================

-- ============================================================
-- STEP 1: DROP ALL EXISTING POLICIES ON PROFILES
-- ============================================================

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_doctors" ON public.profiles;
DROP POLICY IF EXISTS "users_can_view_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "patients_can_view_approved_doctors" ON public.profiles;
DROP POLICY IF EXISTS "admin_can_view_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "doctors_view_queue_patients" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "admin_update_all" ON public.profiles;
DROP POLICY IF EXISTS "admin_update_all_profiles" ON public.profiles;

-- ============================================================
-- STEP 2: ENSURE is_admin HELPER EXISTS (SECURITY DEFINER = no recursion)
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = uid AND p.role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;

-- ============================================================
-- STEP 3: CREATE CLEAN SELECT POLICIES (no recursion)
-- ============================================================

-- 1. Everyone can read their OWN profile
CREATE POLICY "profiles_select_own"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- 2. Everyone can see approved doctors (for patient doctor selection)
CREATE POLICY "profiles_select_approved_doctors"
ON public.profiles FOR SELECT
USING (role = 'doctor' AND approval_status = 'approved');

-- 3. Admin can see all profiles (uses SECURITY DEFINER function, no recursion)
CREATE POLICY "profiles_select_admin"
ON public.profiles FOR SELECT
USING (public.is_admin(auth.uid()));

-- 4. Doctors can see profiles of patients in their queue
CREATE POLICY "profiles_select_queue_patients"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tokens t
    WHERE t.patient_id = profiles.id
      AND t.doctor_id = auth.uid()
  )
);

-- ============================================================
-- STEP 4: CREATE CLEAN INSERT POLICIES
-- ============================================================

CREATE POLICY "profiles_insert_own"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================================
-- STEP 5: CREATE CLEAN UPDATE POLICIES
-- ============================================================

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Admin can update doctor profiles (for approval)
CREATE POLICY "profiles_update_admin"
ON public.profiles FOR UPDATE
USING (public.is_admin(auth.uid()) AND role = 'doctor')
WITH CHECK (public.is_admin(auth.uid()) AND role = 'doctor');

-- ============================================================
-- VERIFY: Check final policies
-- ============================================================

SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles' ORDER BY cmd, policyname;

-- ============================================================
-- DONE ✅ Clean policies, no recursion
-- Expected output: 7 policies total
--   SELECT: profiles_select_own, profiles_select_approved_doctors,
--           profiles_select_admin, profiles_select_queue_patients
--   INSERT: profiles_insert_own
--   UPDATE: profiles_update_own, profiles_update_admin
-- ============================================================
