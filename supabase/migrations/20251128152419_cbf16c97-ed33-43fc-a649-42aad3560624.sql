-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Create scripts table (owner-only access)
create table public.scripts (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  script_name text not null,
  script_key text unique not null,
  hwid_list text[] default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.scripts enable row level security;

create policy "Owners can view their own scripts"
  on public.scripts for select
  using (auth.uid() = owner_id);

create policy "Owners can insert their own scripts"
  on public.scripts for insert
  with check (auth.uid() = owner_id);

create policy "Owners can update their own scripts"
  on public.scripts for update
  using (auth.uid() = owner_id);

create policy "Owners can delete their own scripts"
  on public.scripts for delete
  using (auth.uid() = owner_id);

-- Create user preferences table for theme settings
create table public.user_preferences (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  theme text default 'soft-blue' check (theme in ('soft-blue', 'lavender', 'mint', 'sunset', 'ocean')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.user_preferences enable row level security;

create policy "Users can view their own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can update their own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id);

create policy "Users can insert their own preferences"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.email);
  
  insert into public.user_preferences (user_id, theme)
  values (new.id, 'soft-blue');
  
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger for updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at_scripts
  before update on public.scripts
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at_preferences
  before update on public.user_preferences
  for each row execute procedure public.handle_updated_at();