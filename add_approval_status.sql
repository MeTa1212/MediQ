-- Run this snippet in your Supabase SQL Editor to safely upgrade your profiles table

-- 1. Add the new status field (safely handling if it already exists)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='approval_status') THEN
    ALTER TABLE public.profiles ADD COLUMN approval_status TEXT DEFAULT 'pending';
  END IF;
END $$;

-- 2. Migrate existing 'approved' boolean data over to the new status text field
UPDATE public.profiles 
SET approval_status = 'approved' 
WHERE approved = true;

-- 3. (Optional but recommended) After verifying the new system works perfectly, 
-- you can drop the old boolean column to stay clean. I recommend doing this LATER.
-- ALTER TABLE public.profiles DROP COLUMN approved;
