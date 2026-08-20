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

export type DailyTask = {
  id: string;
  project_id: string;
  day: string; // YYYY-MM-DD
  text: string;
  done: boolean;
  created_at: string;
};

export const KANBAN_COLUMNS: KanbanColumn[] = ["Бэклог", "В работе", "Готово"];

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
