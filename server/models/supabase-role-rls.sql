-- Supabase role-based access control and admin RLS example
-- Run this in the Supabase SQL editor after reviewing it against your schema.
--
-- Manual admin promotion:
-- UPDATE public.users
-- SET role = 'admin'
-- WHERE email = 'admin@email.com';

-- Align public.users with the frontend/auth expectations before attaching
-- auth triggers and RLS policies.
alter table public.users
add column if not exists name text;

alter table public.users
add column if not exists role text;

alter table public.users
add column if not exists coins integer;

alter table public.users
alter column role set default 'student';

alter table public.users
alter column coins set default 0;

update public.users
set role = 'student'
where role is null or btrim(role) = '';

update public.users
set coins = 0
where coins is null;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'users'
      and column_name = 'full_name'
  ) then
    execute $sql$
      update public.users
      set name = coalesce(name, full_name, split_part(email, '@', 1))
      where name is null or btrim(name) = ''
    $sql$;
  else
    update public.users
    set name = coalesce(name, split_part(email, '@', 1))
    where name is null or btrim(name) = '';
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'users_role_check'
  ) then
    alter table public.users
    add constraint users_role_check
    check (role in ('student', 'admin'));
  end if;
end;
$$;

-- Optional but recommended: create the public.users row automatically whenever
-- a Supabase auth user is created. This avoids client-side RLS issues during
-- sign-up when email confirmation is enabled and no authenticated session
-- exists yet in the browser.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name, role, coins)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'name',
      new.raw_user_meta_data ->> 'full_name',
      split_part(new.email, '@', 1)
    ),
    'student',
    0
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_auth_user();

create or replace function public.is_admin(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = coalesce(check_user_id, auth.uid())
      and role = 'admin'
  );
$$;

grant execute on function public.is_admin(uuid) to authenticated;

alter table public.users enable row level security;
alter table public.materials enable row level security;
alter table public.transactions enable row level security;
alter table public.calendar_events enable row level security;

-- The frontend uses user_id across these tables. Add the columns if an older
-- schema was created without them so the policies below can compile.
alter table public.materials
add column if not exists user_id uuid references public.users(id) on delete set null;

alter table public.transactions
add column if not exists user_id uuid references public.users(id) on delete cascade;

alter table public.calendar_events
add column if not exists user_id uuid references public.users(id) on delete set null;

drop policy if exists "Users can read own profile and admins can read all" on public.users;
create policy "Users can read own profile and admins can read all"
on public.users
for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "Users can create their own student profile" on public.users;
create policy "Users can create their own student profile"
on public.users
for insert
to authenticated
with check (id = auth.uid() and role = 'student');

drop policy if exists "Users can update their own profile and admins can update all" on public.users;
create policy "Users can update their own profile and admins can update all"
on public.users
for update
to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

drop policy if exists "Authenticated users can read approved materials and admins can read all" on public.materials;
create policy "Authenticated users can read approved materials and admins can read all"
on public.materials
for select
to authenticated
using (status = 'approved' or user_id = auth.uid() or public.is_admin());

drop policy if exists "Authenticated users can insert their own materials" on public.materials;
create policy "Authenticated users can insert their own materials"
on public.materials
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Material owners and admins can update materials" on public.materials;
create policy "Material owners and admins can update materials"
on public.materials
for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users can read their own transactions and admins can read all" on public.transactions;
create policy "Users can read their own transactions and admins can read all"
on public.transactions
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Admins can insert transactions" on public.transactions;
create policy "Admins can insert transactions"
on public.transactions
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Authenticated users can read calendar events" on public.calendar_events;
create policy "Authenticated users can read calendar events"
on public.calendar_events
for select
to authenticated
using (true);

drop policy if exists "Users can insert their own events and admins can insert all" on public.calendar_events;
create policy "Users can insert their own events and admins can insert all"
on public.calendar_events
for insert
to authenticated
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users can update their own events and admins can update all" on public.calendar_events;
create policy "Users can update their own events and admins can update all"
on public.calendar_events
for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users can delete their own events and admins can delete all" on public.calendar_events;
create policy "Users can delete their own events and admins can delete all"
on public.calendar_events
for delete
to authenticated
using (user_id = auth.uid() or public.is_admin());
