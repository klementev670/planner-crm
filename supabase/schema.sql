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

-- Deprecated: replaced by calendar_events below. Left in place (unused by
-- the app) so no historical data is dropped.
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

-- Закупки товара из Китая: партия/лот с расходами и итоговой выручкой,
-- чтобы считать прибыль и срок реализации по каждой закупке.
create table if not exists purchase_batches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  purchase_cost numeric not null default 0,
  delivery_cost numeric not null default 0,
  ad_cost numeric not null default 0,
  sale_revenue numeric not null default 0,
  purchase_date date not null default current_date,
  sold_date date,
  created_at timestamptz not null default now()
);

-- Задачи/встречи на день с точным временем и напоминаниями (за день, за
-- час — независимые тумблеры). Без привязки к проекту — это бытовые/личные
-- задачи; то, что относится к проекту, идёт через "Цели".
-- day/time хранятся как wall-clock время в Asia/Yekaterinburg; notified_*
-- флаги не дают крону слать одно и то же напоминание повторно.
create table if not exists calendar_events (
  id uuid primary key default gen_random_uuid(),
  day date not null,
  time text not null, -- 'HH:MM'
  text text not null,
  done boolean not null default false,
  remind_day_before boolean not null default false,
  remind_hour_before boolean not null default false,
  notified_day_before boolean not null default false,
  notified_hour_before boolean not null default false,
  created_at timestamptz not null default now()
);

-- Личные финансы: разовые операции дохода/расхода по категориям,
-- отдельно от закупок из Китая (те про себестоимость товара, эти — про
-- личный бюджет в целом).
create table if not exists finance_transactions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('income', 'expense')),
  amount numeric not null,
  category text not null,
  note text,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

-- Enable realtime on the tables we sync live
alter publication supabase_realtime add table goals, kanban_tasks, daily_tasks, pomodoro_sessions;
alter publication supabase_realtime add table purchase_batches;
alter publication supabase_realtime add table calendar_events;
alter publication supabase_realtime add table finance_transactions;
