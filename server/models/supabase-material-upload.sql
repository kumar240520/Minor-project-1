-- EduSure material upload + moderation workflow for Supabase.
-- Run this after server/models/supabase-role-rls.sql.
--
-- This script aligns the public.materials table with the React upload flow,
-- creates a private Storage bucket for files, and applies RLS/storage
-- policies so only approved files are visible to non-admin users.

insert into storage.buckets (id, name, public)
values ('Storage', 'Storage', false)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public;

alter table public.materials
add column if not exists title text;

alter table public.materials
add column if not exists description text;

alter table public.materials
add column if not exists subject text;

alter table public.materials
add column if not exists file_url text;

alter table public.materials
add column if not exists uploaded_by uuid references public.users(id) on delete set null;

alter table public.materials
add column if not exists type text;

alter table public.materials
add column if not exists status text;

alter table public.materials
add column if not exists created_at timestamptz default timezone('utc', now());

alter table public.materials
add column if not exists approved_by uuid references public.users(id) on delete set null;

alter table public.materials
add column if not exists approved_at timestamptz;

alter table public.materials
add column if not exists file_name text;

alter table public.materials
add column if not exists file_type text;

alter table public.materials
add column if not exists uploader_name text;

alter table public.materials
add column if not exists downloads integer default 0;

alter table public.materials
add column if not exists views integer default 0;

alter table public.materials
add column if not exists category text;

alter table public.materials
add column if not exists material_type text;

alter table public.materials
add column if not exists icon_type text;

alter table public.materials
add column if not exists bg_color text;

alter table public.materials
add column if not exists text_color text;

alter table public.materials
add column if not exists storage_bucket text default 'Storage';

alter table public.materials
alter column status set default 'pending';

alter table public.materials
alter column created_at set default timezone('utc', now());

alter table public.materials
alter column downloads set default 0;

alter table public.materials
alter column views set default 0;

alter table public.materials
alter column storage_bucket set default 'Storage';

update public.materials
set uploaded_by = coalesce(uploaded_by, user_id)
where uploaded_by is null
  and user_id is not null;

update public.materials
set type = case
  when lower(coalesce(type, material_type, category, '')) = 'pyq' then 'pyq'
  else 'material'
end
where type is null
   or btrim(type) = '';

update public.materials
set status = 'pending'
where status is null
   or btrim(status) = '';

update public.materials
set created_at = timezone('utc', now())
where created_at is null;

update public.materials
set downloads = 0
where downloads is null;

update public.materials
set views = 0
where views is null;

update public.materials
set storage_bucket = 'Storage'
where storage_bucket is null
   or btrim(storage_bucket) = '';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'materials_type_check'
  ) then
    alter table public.materials
    add constraint materials_type_check
    check (type in ('material', 'pyq'));
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'materials_status_check'
  ) then
    alter table public.materials
    add constraint materials_status_check
    check (status in ('pending', 'approved', 'rejected'));
  end if;
end;
$$;

create index if not exists idx_materials_status_type_created_at
on public.materials (status, type, created_at desc);

create index if not exists idx_materials_uploaded_by
on public.materials (uploaded_by);

alter table public.materials enable row level security;

drop policy if exists "Authenticated users can read approved materials and admins can read all" on public.materials;
drop policy if exists "Authenticated users can insert their own materials" on public.materials;
drop policy if exists "Material owners and admins can update materials" on public.materials;
drop policy if exists "Approved materials are public, uploaders see own, admins see all" on public.materials;
drop policy if exists "Users can upload their own pending materials" on public.materials;
drop policy if exists "Uploaders can update their own pending materials" on public.materials;
drop policy if exists "Admins can moderate all materials" on public.materials;
drop policy if exists "Uploaders can delete pending materials and admins can delete all" on public.materials;

create policy "Approved materials are public, uploaders see own, admins see all"
on public.materials
for select
to authenticated
using (
  status = 'approved'
  or uploaded_by = auth.uid()
  or user_id = auth.uid()
  or public.is_admin()
);

create policy "Users can upload their own pending materials"
on public.materials
for insert
to authenticated
with check (
  coalesce(uploaded_by, user_id) = auth.uid()
  and status = 'pending'
  and type in ('material', 'pyq')
  and approved_by is null
  and approved_at is null
);

create policy "Uploaders can update their own pending materials"
on public.materials
for update
to authenticated
using (
  coalesce(uploaded_by, user_id) = auth.uid()
  and status = 'pending'
)
with check (
  coalesce(uploaded_by, user_id) = auth.uid()
  and status = 'pending'
  and approved_by is null
  and approved_at is null
);

create policy "Admins can moderate all materials"
on public.materials
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Uploaders can delete pending materials and admins can delete all"
on public.materials
for delete
to authenticated
using (
  (
    coalesce(uploaded_by, user_id) = auth.uid()
    and status = 'pending'
  )
  or public.is_admin()
);

drop policy if exists "Users can upload their own material files" on storage.objects;
drop policy if exists "Approved material files are readable by students and admins" on storage.objects;
drop policy if exists "Users can delete their own material files and admins can delete all" on storage.objects;

create policy "Users can upload their own material files"
on storage.objects
for insert
to authenticated
with check (
  lower(bucket_id) = lower('Storage')
);

create policy "Approved material files are readable by students and admins"
on storage.objects
for select
to authenticated
using (
  lower(bucket_id) = lower('Storage')
  and (
    public.is_admin()
    or (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
    or owner_id::text = (select auth.jwt()->>'sub')
    or exists (
      select 1
      from public.materials material
      where material.file_url = name
        and material.status = 'approved'
    )
  )
);

create policy "Users can delete their own material files and admins can delete all"
on storage.objects
for delete
to authenticated
using (
  lower(bucket_id) = lower('Storage')
  and (
    public.is_admin()
    or (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
    or owner_id::text = (select auth.jwt()->>'sub')
  )
);
