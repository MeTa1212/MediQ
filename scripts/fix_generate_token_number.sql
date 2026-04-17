-- Fix for generate_token_number returning null/empty values
-- Run this in Supabase SQL Editor.

create or replace function public.generate_token_number(
  p_doctor_id uuid,
  p_date date
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next_number integer;
begin
  if p_doctor_id is null then
    raise exception 'p_doctor_id cannot be null';
  end if;

  if p_date is null then
    raise exception 'p_date cannot be null';
  end if;

  select
    coalesce(
      max(nullif(substring(token_number from '([0-9]+)$'), '')::integer),
      0
    ) + 1
  into v_next_number
  from public.tokens
  where doctor_id = p_doctor_id
    and clinic_date = p_date;

  return 'MQ-' || lpad(v_next_number::text, 3, '0');
end;
$$;

grant execute on function public.generate_token_number(uuid, date) to authenticated;

-- Optional quick test (replace with a real doctor UUID)
-- select public.generate_token_number('00000000-0000-0000-0000-000000000000', current_date);
