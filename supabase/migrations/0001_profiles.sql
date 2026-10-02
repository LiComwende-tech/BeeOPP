-- User profile basics and onboarding intents.
-- Intents describe what the person wants to do; they are not authorization roles.
create type public.account_intent as enum ('seeker', 'employer', 'service_provider');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) between 1 and 80),
  country_code text check (country_code is null or country_code in ('KE', 'UG', 'TZ')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_account_intents (
  user_id uuid not null references auth.users (id) on delete cascade,
  intent public.account_intent not null,
  created_at timestamptz not null default now(),
  primary key (user_id, intent)
);

alter table public.profiles enable row level security;
alter table public.user_account_intents enable row level security;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, delete on public.user_account_intents to authenticated;

create policy "Users can view their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "Users can create their own profile"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Users can view their own onboarding intents"
  on public.user_account_intents for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own onboarding intents"
  on public.user_account_intents for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can remove their own onboarding intents"
  on public.user_account_intents for delete to authenticated
  using ((select auth.uid()) = user_id);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  intent_value text;
  allowed_intents text[] := array['seeker', 'employer', 'service_provider'];
  supplied_intents jsonb := new.raw_user_meta_data -> 'account_intents';
begin
  insert into public.profiles (id, display_name, country_code)
  values (
    new.id,
    nullif(left(trim(new.raw_user_meta_data ->> 'display_name'), 80), ''),
    case when new.raw_user_meta_data ->> 'country_code' in ('KE', 'UG', 'TZ') then new.raw_user_meta_data ->> 'country_code' else null end
  ) on conflict (id) do nothing;

  if jsonb_typeof(supplied_intents) = 'array' then
    for intent_value in select jsonb_array_elements_text(supplied_intents)
    loop
      if intent_value = any (allowed_intents) then
        insert into public.user_account_intents (user_id, intent)
        values (new.id, intent_value::public.account_intent)
        on conflict do nothing;
      end if;
    end loop;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();
