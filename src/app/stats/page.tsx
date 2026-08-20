"use client";
import { useRealtimeList } from "@/lib/useRealtimeList";
import { PROJECTS, projectColor } from "@/lib/projects";
import { Goal, KanbanTask, PurchaseBatch } from "@/lib/types";
import {
BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid,
} from "recharts";

function money(n: number) {
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 0 }) + " ₽";
}

export default function StatsPage() {
const { items: goals } = useRealtimeList<Goal>("goals", "/api/goals");
const { items: kanban } = useRealtimeList<KanbanTask>("kanban_tasks", "/api/kanban");
const { items: batches } = useRealtimeList<PurchaseBatch>("purchase_batches", "/api/batches");

const goalStats = PROJECTS.map((p) => {
const pg = goals.filter((g) => g.project_id === p.id);
return { name: p.name, color: p.color, done: pg.filter((g) => g.done).length, total: pg.length };
});

const kanbanDist = ["Бэклог", "В работе", "Готово"].map((col) => ({
name: col,
value: kanban.filter((t) => t.column_name === col).length,
}));

const totalGoalsDone = goals.filter((g) => g.done).length;
const totalKanbanDone = kanban.filter((t) => t.column_name === "Готово").length;

const PIE_COLORS = ["#888888", "#378ADD", "#1D9E75"];

const batchSpent = batches.reduce((s, b) => s + b.purchase_cost + b.delivery_cost + b.ad_cost, 0);
const batchRevenue = batches.reduce((s, b) => s + b.sale_revenue, 0);
const batchProfit = batchRevenue - batchSpent;
const batchChart = batches
  .slice()
  .sort((a, b) => a.purchase_date.localeCompare(b.purchase_date))
  .slice(-10)
  .map((b) => ({
    name: b.name.length > 10 ? b.name.slice(0, 10) + "…" : b.name,
    Расходы: b.purchase_cost + b.delivery_cost + b.ad_cost,
    Выручка: b.sale_revenue,
  }));

return (
<div>
<h1 className="text-2xl font-bold mb-4">📊 Статистика</h1>
<div className="grid grid-cols-2 sm:grid-cols-2 gap-3 mb-6">
<StatTile label="Целей выполнено" value={totalGoalsDone} color="#378ADD" />
<StatTile label="Задач готово (канбан)" value={totalKanbanDone} color="#1D9E75" />
</div>
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
<div className="card p-4">
<div className="text-sm font-bold mb-3">Прогресс по целям</div>
<ResponsiveContainer width="100%" height={240}>
<BarChart data={goalStats}>
<CartesianGrid strokeDasharray="3 3" stroke="#333" />
<XAxis dataKey="name" stroke="#888" fontSize={10} />
<YAxis stroke="#888" fontSize={10} allowDecimals={false} />
<Tooltip contentStyle={{ background: "#1c1c1c", border: "1px solid #333" }} />
<Bar dataKey="done" name="Выполнено" radius={[4, 4, 0, 0]}>
{goalStats.map((g, i) => <Cell key={i} fill={g.color} />)}
</Bar>
<Bar dataKey="total" name="Всего" fill="#333" radius={[4, 4, 0, 0]} />
</BarChart>
</ResponsiveContainer>
</div>
<div className="card p-4">
<div className="text-sm font-bold mb-3">Канбан: распределение задач</div>
<ResponsiveContainer width="100%" height={240}>
<PieChart>
<Pie data={kanbanDist} dataKey="value" nameKey="name" outerRadius={80} label>
{kanbanDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
</Pie>
<Tooltip contentStyle={{ background: "#1c1c1c", border: "1px solid #333" }} />
</PieChart>
</ResponsiveContainer>
</div>
</div>

<h2 className="text-lg font-bold mb-3">📦 Закупки из Китая</h2>
<div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
<StatTileText label="Потрачено всего" value={money(batchSpent)} color="#EF9F27" />
<StatTileText label="Выручка" value={money(batchRevenue)} color="#378ADD" />
<StatTileText label="Прибыль" value={money(batchProfit)} color={batchProfit >= 0 ? "#1D9E75" : "#E24B4A"} />
</div>
{batchChart.length > 0 && (
<div className="card p-4">
<div className="text-sm font-bold mb-3">Расходы и выручка по партиям (последние 10)</div>
<ResponsiveContainer width="100%" height={240}>
<BarChart data={batchChart}>
<CartesianGrid strokeDasharray="3 3" stroke="#333" />
<XAxis dataKey="name" stroke="#888" fontSize={10} />
<YAxis stroke="#888" fontSize={10} />
<Tooltip contentStyle={{ background: "#1c1c1c", border: "1px solid #333" }} />
<Bar dataKey="Расходы" fill="#EF9F27" radius={[4, 4, 0, 0]} />
<Bar dataKey="Выручка" fill="#378ADD" radius={[4, 4, 0, 0]} />
</BarChart>
</ResponsiveContainer>
</div>
)}
</div>
);
}

function StatTile({ label, value, color }: { label: string; value: number; color: string }) {
return (
<div className="card p-4 text-center">
<div className="text-2xl font-bold" style={{ color }}>{value}</div>
<div className="text-[10px] text-slate-400 mt-1">{label}</div>
</div>
);
}

function StatTileText({ label, value, color }: { label: string; value: string; color: string }) {
return (
<div className="card p-4 text-center">
<div className="text-lg font-bold" style={{ color }}>{value}</div>
<div className="text-[10px] text-slate-400 mt-1">{label}</div>
</div>
);
}
