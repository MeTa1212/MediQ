-- RUN THIS IN YOUR SUPABASE SQL EDITOR
-- This script fixes the permission issues that prevent Patients from seeing approved Doctors.

-- 1. Enable RLS on profiles if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Allow everyone to see profiles that have the 'doctor' role
-- This is essential so patients can choose a doctor to book with.
-- Drop if exists to avoid conflicts
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (role = 'doctor' OR auth.uid() = id);

-- 3. Enable RLS on doctor_profiles if not already enabled
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Allow everyone to see doctor_profiles (extra info like specialty, clinic name)
-- Drop if exists to avoid conflicts
DROP POLICY IF EXISTS "Doctor profiles are viewable by everyone" ON public.doctor_profiles;
CREATE POLICY "Doctor profiles are viewable by everyone" 
ON public.doctor_profiles 
FOR SELECT 
USING (true);

-- 5. Notify the user
COMMENT ON TABLE public.profiles IS 'Doctor profiles made visible to patients via RLS policy.';
