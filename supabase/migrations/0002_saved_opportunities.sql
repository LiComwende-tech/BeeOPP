-- A saved advert is a user-owned bookmark, not an application submission.
create table public.saved_opportunities (
  user_id uuid not null references auth.users (id) on delete cascade,
  opportunity_slug text not null
    check (char_length(opportunity_slug) between 1 and 100)
    check (opportunity_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  created_at timestamptz not null default now(),
  primary key (user_id, opportunity_slug)
);

alter table public.saved_opportunities enable row level security;

grant select, insert, delete on public.saved_opportunities to authenticated;

create policy "Users can view their own saved opportunities"
  on public.saved_opportunities for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can save opportunities for themselves"
  on public.saved_opportunities for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can remove their own saved opportunities"
  on public.saved_opportunities for delete to authenticated
  using ((select auth.uid()) = user_id);
