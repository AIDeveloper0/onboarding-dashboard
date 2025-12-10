-- Create public storage bucket for uploads (used by uploader UI)
do $$
begin
  if not exists (
    select 1 from storage.buckets where name = 'uploads'
  ) then
    -- Insert directly into storage.buckets (works across storage versions)
    insert into storage.buckets (id, name, public)
    values ('uploads', 'uploads', true)
    on conflict (id) do nothing;
  end if;
end$$;
