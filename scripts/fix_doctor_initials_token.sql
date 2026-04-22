-- ============================================================
-- Issue 3: Doctor-Specific Token Prefixes
-- Token format: [DOCTOR_INITIALS]-[3-digit-number]
-- Example: "Rahul Sharma" → RS-001, RS-002
-- Example: single name "Priya" → PR-001
-- Each doctor has their own sequence starting from 001 per day.
--
-- Safe to run multiple times (CREATE OR REPLACE).
-- Run in Supabase SQL Editor.
-- ============================================================

CREATE OR REPLACE FUNCTION public.generate_token_number(
  p_doctor_id uuid,
  p_date date
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_next_number integer;
  v_full_name text;
  v_initials text;
  v_parts text[];
BEGIN
  IF p_doctor_id IS NULL THEN
    RAISE EXCEPTION 'p_doctor_id cannot be null';
  END IF;

  IF p_date IS NULL THEN
    RAISE EXCEPTION 'p_date cannot be null';
  END IF;

  -- Fetch doctor's full name
  SELECT full_name INTO v_full_name
  FROM public.profiles
  WHERE id = p_doctor_id;

  -- Derive initials from full name
  IF v_full_name IS NULL OR trim(v_full_name) = '' THEN
    v_initials := 'MQ'; -- fallback if no name
  ELSE
    v_parts := string_to_array(trim(v_full_name), ' ');

    IF array_length(v_parts, 1) >= 2 THEN
      -- Two or more names: first letter of first + first letter of last
      v_initials := upper(left(v_parts[1], 1) || left(v_parts[array_length(v_parts, 1)], 1));
    ELSE
      -- Single name: first two letters
      v_initials := upper(left(v_parts[1], 2));
    END IF;
  END IF;

  -- Count existing tokens for this doctor on this date
  SELECT
    coalesce(
      max(nullif(substring(token_number FROM '([0-9]+)$'), '')::integer),
      0
    ) + 1
  INTO v_next_number
  FROM public.tokens
  WHERE doctor_id = p_doctor_id
    AND clinic_date = p_date;

  RETURN v_initials || '-' || lpad(v_next_number::text, 3, '0');
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_token_number(uuid, date) TO authenticated;

-- ============================================================
-- DONE ✅ Tokens now use doctor initials: RS-001, PS-001, etc.
-- ============================================================
