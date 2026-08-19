-- Planner CRM schema. Run this once in the Supabase SQL editor.

create extension if not exists "pgcrypto";

create table if not exists projects (
  id text primary key,
  name text not null,
  color text not null,
  sort_order int not null default 0
);

insert into projects (id, name, color, sort_order) values
  ('ai-model', 'AI-модель', '#378ADD', 0),
  ('cargo',    'Карго',     '#1D9E75', 1),
  ('courses',  'Курсы',     '#7F77DD', 2),
  ('tyumgu',   'ТюмГУ',     '#EF9F27', 3)
on conflict (id) do nothing;

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  project_id text not null references projects(id) on delete cascade,
  text text not null,
  done boolean not null default false,
  due_date date,
  created_at timestamptz not null default now(),
  notified boolean not null default false
);

create table if not exists kanban_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id text not null references projects(id) on delete cascade,
  column_name text not null default 'Бэклог', -- Бэклог | В работе | Готово
  text text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists daily_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id text not null references projects(id) on delete cascade,
  day date not null,
  text text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists pomodoro_sessions (
  id uuid primary key default gen_random_uuid(),
  project_id text references projects(id) on delete set null,
  started_at timestamptz not null default now(),
  minutes int not null
);

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  subscription jsonb not null,
  created_at timestamptz not null default now()
);

-- Enable realtime on the tables we sync live
alter publication supabase_realtime add table goals, kanban_tasks, daily_tasks, pomodoro_sessions;
