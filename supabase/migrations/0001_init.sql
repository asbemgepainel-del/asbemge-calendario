-- ============================================================
-- Asbemge · Sistema de Gestão de Calendário de Eventos
-- Schema inicial para Supabase (Postgres)
-- Portado de reference/asbemge-schema.sql
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Tipos ----------
create type event_category as enum ('esportivo', 'social');
create type event_status   as enum ('rascunho', 'confirmado', 'cancelado', 'concluido');
create type event_size     as enum ('pequeno', 'medio', 'grande');
create type conflict_severity as enum ('direto', 'proximidade');

-- ---------- Locais / recursos do clube ----------
create table locations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  capacity    int,
  notes       text,
  created_at  timestamptz not null default now()
);

-- ---------- Diretores / usuários com acesso ao admin ----------
create table directors (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  role        text not null default 'diretor', -- 'admin' | 'diretor'
  created_at  timestamptz not null default now()
);

-- ---------- Eventos ----------
create table events (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  description     text,
  category        event_category not null,
  modality        text,
  start_date      date not null,
  end_date        date,
  start_time      time,
  end_time        time,
  location_id     uuid references locations(id) on delete set null,
  responsible     text,
  size            event_size not null default 'medio',
  status          event_status not null default 'confirmado',
  capacity        int,
  attachment_url  text,
  created_by      uuid references directors(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_events_start_date on events (start_date);
create index idx_events_category   on events (category);

create function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger events_set_updated_at
  before update on events
  for each row execute function set_updated_at();

-- ---------- Regras de espaçamento entre categorias ----------
create table spacing_rules (
  id           uuid primary key default gen_random_uuid(),
  category_a   event_category not null,
  category_b   event_category not null,
  min_days     int not null default 3,
  unique (category_a, category_b)
);

insert into spacing_rules (category_a, category_b, min_days) values
  ('esportivo', 'esportivo', 3),
  ('social',    'social',    5),
  ('esportivo', 'social',    1);

-- ---------- Configuração geral ----------
create table settings (
  key   text primary key,
  value jsonb not null
);

insert into settings (key, value) values
  ('consider_size_in_conflicts', 'true'),
  ('size_bonus_days', '{"pequeno": 0, "medio": 0, "grande": 2}');

-- ---------- Conflitos detectados (cache, recalculado no app) ----------
create table event_conflicts (
  id            uuid primary key default gen_random_uuid(),
  event_id_a    uuid references events(id) on delete cascade,
  event_id_b    uuid references events(id) on delete cascade,
  days_apart    int not null,
  rule_min_days int not null,
  severity      conflict_severity not null,
  created_at    timestamptz not null default now()
);

-- ---------- Notificações / lembretes ----------
create table notifications (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid references events(id) on delete cascade,
  notify_date  date not null,
  channel      text not null default 'email',
  message      text,
  sent         boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ---------- Row Level Security ----------
alter table events        enable row level security;
alter table locations     enable row level security;
alter table spacing_rules enable row level security;
alter table settings      enable row level security;
alter table notifications enable row level security;
alter table event_conflicts enable row level security;
alter table directors     enable row level security;

-- Leitura pública dos dados do calendário (dashboard público sem login)
create policy "public_read_events" on events
  for select using (true);
create policy "public_read_locations" on locations
  for select using (true);

-- Diretores autenticados podem gerenciar tudo
create policy "directors_write_events" on events
  for insert to authenticated with check (true);
create policy "directors_update_events" on events
  for update to authenticated using (true) with check (true);
create policy "directors_delete_events" on events
  for delete to authenticated using (true);

create policy "directors_write_locations" on locations
  for all to authenticated using (true) with check (true);

create policy "directors_read_rules" on spacing_rules
  for select using (true);
create policy "directors_write_rules" on spacing_rules
  for all to authenticated using (true) with check (true);

create policy "directors_read_settings" on settings
  for select using (true);
create policy "directors_write_settings" on settings
  for all to authenticated using (true) with check (true);

create policy "directors_all_notifications" on notifications
  for all to authenticated using (true) with check (true);

create policy "directors_all_conflicts" on event_conflicts
  for all to authenticated using (true) with check (true);

create policy "directors_read_self" on directors
  for select to authenticated using (true);

-- ---------- Locais de exemplo ----------
insert into locations (name, capacity) values
  ('Quadra Poliesportiva', 200),
  ('Salão de Festas', 300),
  ('Piscina', 100),
  ('Campo Society', 150),
  ('Quadra de Tênis', 40);

-- ---------- Storage: arte/pôster dos eventos ----------
insert into storage.buckets (id, name, public)
values ('event-art', 'event-art', true)
on conflict (id) do nothing;

create policy "public_read_event_art" on storage.objects
  for select using (bucket_id = 'event-art');

create policy "directors_upload_event_art" on storage.objects
  for insert to authenticated with check (bucket_id = 'event-art');

create policy "directors_update_event_art" on storage.objects
  for update to authenticated using (bucket_id = 'event-art')
  with check (bucket_id = 'event-art');

create policy "directors_delete_event_art" on storage.objects
  for delete to authenticated using (bucket_id = 'event-art');
