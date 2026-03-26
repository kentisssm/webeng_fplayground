-- Run this in Supabase SQL Editor
-- Storage bucket name must be exactly: SITE-IMAGES

create extension if not exists pgcrypto;

create table if not exists public.site_content (
  key text primary key,
  hero_title text default '',
  hero_tagline text default '',
  hero_button_text text default '',
  hero_button_url text default '',
  about_title text default '',
  about_mission_title text default '',
  about_body text default '',
  about_body_second text default '',
  contact_title text default '',
  address text default '',
  weekday_hours text default '',
  weekend_hours text default '',
  email text default '',
  facebook_url text default '',
  instagram_url text default '',
  hero_image text default '',
  logo_image text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  description text not null default '',
  image text default '',
  sort_order integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rates (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  front_image text default '',
  back_image text default '',
  sort_order integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  image text not null default '',
  alt_text text default '',
  sort_order integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_site_content_updated_at on public.site_content;
create trigger set_site_content_updated_at
before update on public.site_content
for each row execute function public.set_updated_at();

drop trigger if exists set_services_updated_at on public.services;
create trigger set_services_updated_at
before update on public.services
for each row execute function public.set_updated_at();

drop trigger if exists set_rates_updated_at on public.rates;
create trigger set_rates_updated_at
before update on public.rates
for each row execute function public.set_updated_at();

drop trigger if exists set_gallery_updated_at on public.gallery;
create trigger set_gallery_updated_at
before update on public.gallery
for each row execute function public.set_updated_at();

alter table public.site_content enable row level security;
alter table public.services enable row level security;
alter table public.rates enable row level security;
alter table public.gallery enable row level security;

-- Public website can read content
drop policy if exists "public can read site_content" on public.site_content;
create policy "public can read site_content"
on public.site_content for select
using (true);

drop policy if exists "public can read services" on public.services;
create policy "public can read services"
on public.services for select
using (true);

drop policy if exists "public can read rates" on public.rates;
create policy "public can read rates"
on public.rates for select
using (true);

drop policy if exists "public can read gallery" on public.gallery;
create policy "public can read gallery"
on public.gallery for select
using (true);

-- Admin dashboard uses Firebase Authentication, not Supabase Auth.
-- To allow the static frontend to write to Supabase, these policies allow
-- the anon role to manage content. This is suitable for school/demo use only.

drop policy if exists "anon can manage site_content" on public.site_content;
create policy "anon can manage site_content"
on public.site_content for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "anon can manage services" on public.services;
create policy "anon can manage services"
on public.services for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "anon can manage rates" on public.rates;
create policy "anon can manage rates"
on public.rates for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "anon can manage gallery" on public.gallery;
create policy "anon can manage gallery"
on public.gallery for all
to anon, authenticated
using (true)
with check (true);

-- Storage policies
insert into storage.buckets (id, name, public)
values ('SITE-IMAGES', 'SITE-IMAGES', true)
on conflict (id) do update set public = true;

drop policy if exists "public can read SITE-IMAGES" on storage.objects;
create policy "public can read SITE-IMAGES"
on storage.objects for select
using (bucket_id = 'SITE-IMAGES');

drop policy if exists "authenticated can upload SITE-IMAGES" on storage.objects;
create policy "authenticated can upload SITE-IMAGES"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'SITE-IMAGES');

drop policy if exists "authenticated can update SITE-IMAGES" on storage.objects;
create policy "authenticated can update SITE-IMAGES"
on storage.objects for update
to anon, authenticated
using (bucket_id = 'SITE-IMAGES')
with check (bucket_id = 'SITE-IMAGES');

drop policy if exists "authenticated can delete SITE-IMAGES" on storage.objects;
create policy "authenticated can delete SITE-IMAGES"
on storage.objects for delete
to anon, authenticated
using (bucket_id = 'SITE-IMAGES');
