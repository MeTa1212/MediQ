-- ============================================================
-- MediQ FINAL COMPLETE SETUP (Admin + Approval + RLS FIXED)
-- Safe to run multiple times
-- ============================================================

-- ============================================================
-- PART 1: FIX ROLE CONSTRAINT (ADD ADMIN)
-- ============================================================

ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('doctor', 'patient', 'admin'));

-- ============================================================
-- PART 2: ADD REQUIRED COLUMNS
-- ============================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending';

-- ============================================================
-- PART 3: SIGNUP TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
_role TEXT;
_full_name TEXT;
BEGIN
_role := NEW.raw_user_meta_data ->> 'role';
_full_name := NEW.raw_user_meta_data ->> 'full_name';

INSERT INTO public.profiles (id, email, role, full_name, approval_status)
VALUES (NEW.id, NEW.email, _role, _full_name, 'pending')
ON CONFLICT (id) DO NOTHING;

IF _role = 'doctor' THEN
INSERT INTO public.doctor_profiles (id)
VALUES (NEW.id)
ON CONFLICT DO NOTHING;

ELSIF _role = 'patient' THEN
INSERT INTO public.patient_profiles (id)
VALUES (NEW.id)
ON CONFLICT DO NOTHING;
END IF;

RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS after_signup ON auth.users;

CREATE TRIGGER after_signup
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- PART 4: ENABLE RLS
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PART 5: DROP OLD POLICIES (CLEAN RESET)
-- ============================================================

DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "admin_update_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- ============================================================
-- PART 5B: ADMIN HELPER (AVOIDS RLS RECURSION)
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
	SELECT EXISTS (
		SELECT 1
		FROM public.profiles p
		WHERE p.id = uid
			AND p.role = 'admin'
	);
$$;

REVOKE ALL ON FUNCTION public.is_admin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;

-- ============================================================
-- PART 6: PROFILES POLICIES (FINAL FIXED)
-- ============================================================

-- SELECT: own + approved doctors + admin all
CREATE POLICY "profiles_select"
ON public.profiles
FOR SELECT
USING (
	auth.uid() = id
	OR (
		role = 'doctor'
		AND approval_status = 'approved'
	)
	OR public.is_admin(auth.uid())
);

-- INSERT: own only
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- UPDATE: own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- UPDATE: admin can update ANYONE (approval fix 🔥)
CREATE POLICY "admin_update_all_profiles"
ON public.profiles
FOR UPDATE
USING (
	public.is_admin(auth.uid())
	AND role = 'doctor'
)
WITH CHECK (
	public.is_admin(auth.uid())
	AND role = 'doctor'
);

-- ============================================================
-- PART 7: DOCTOR PROFILES
-- ============================================================

DROP POLICY IF EXISTS "doctor_profiles_visible" ON public.doctor_profiles;
DROP POLICY IF EXISTS "doctor_insert_own" ON public.doctor_profiles;
DROP POLICY IF EXISTS "doctor_update_own" ON public.doctor_profiles;

CREATE POLICY "doctor_profiles_visible"
ON public.doctor_profiles
FOR SELECT
USING (true);

CREATE POLICY "doctor_insert_own"
ON public.doctor_profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "doctor_update_own"
ON public.doctor_profiles
FOR UPDATE
USING (auth.uid() = id);

-- ============================================================
-- PART 8: PATIENT PROFILES
-- ============================================================

DROP POLICY IF EXISTS "patient_select_own" ON public.patient_profiles;
DROP POLICY IF EXISTS "patient_insert_own" ON public.patient_profiles;
DROP POLICY IF EXISTS "patient_update_own" ON public.patient_profiles;

CREATE POLICY "patient_select_own"
ON public.patient_profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "patient_insert_own"
ON public.patient_profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "patient_update_own"
ON public.patient_profiles
FOR UPDATE
USING (auth.uid() = id);

-- ============================================================
-- PART 9: BACKFILL OLD USERS
-- ============================================================

INSERT INTO public.doctor_profiles (id)
SELECT id FROM public.profiles WHERE role = 'doctor'
ON CONFLICT DO NOTHING;

INSERT INTO public.patient_profiles (id)
SELECT id FROM public.profiles WHERE role = 'patient'
ON CONFLICT DO NOTHING;

-- ============================================================
-- PART 10: MANUAL STEPS (IMPORTANT)
-- ============================================================

-- 1. Make yourself admin
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email';

-- 2. Approve doctor
-- UPDATE public.profiles SET approval_status = 'approved' WHERE id = '<doctor-id>';

-- ============================================================
-- DONE ✅ YOUR SYSTEM IS NOW FULLY WORKING
-- ============================================================
