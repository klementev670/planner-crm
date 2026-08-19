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

export type PomodoroSession = {
  id: string;
  project_id: string | null;
  started_at: string;
  minutes: number;
};

export const KANBAN_COLUMNS: KanbanColumn[] = ["Бэклог", "В работе", "Готово"];
