export type Project = {
  id: string;
  name: string;
  color: string;
  sort_order: number;
};

export type Goal = {
  id: string;
  project_id: string;
  text: string;
  done: boolean;
  due_date: string | null;
  created_at: string;
};

export type KanbanColumn = "Бэклог" | "В работе" | "Готово";

export type KanbanTask = {
  id: string;
  project_id: string;
  column_name: KanbanColumn;
  text: string;
  sort_order: number;
  created_at: string;
};

export const KANBAN_COLUMNS: KanbanColumn[] = ["Бэклог", "В работе", "Готово"];

export type ReminderTier = "day_before" | "hour_before" | "10min_before" | "at_start";

export type CalendarEvent = {
  id: string;
  project_id: string | null;
  day: string; // YYYY-MM-DD, Asia/Yekaterinburg wall-clock date
  time: string; // HH:MM, Asia/Yekaterinburg wall-clock time
  text: string;
  done: boolean;
  remind_day_before: boolean;
  remind_hour_before: boolean;
  remind_10min_before: boolean;
  remind_at_start: boolean;
  notified_day_before: boolean;
  notified_hour_before: boolean;
  notified_10min_before: boolean;
  notified_at_start: boolean;
  created_at: string;
};

export type PurchaseBatch = {
  id: string;
  name: string;
  purchase_cost: number;
  delivery_cost: number;
  ad_cost: number;
  sale_revenue: number;
  purchase_date: string; // YYYY-MM-DD
  sold_date: string | null;
  created_at: string;
};
