"use client";
import { useMemo, useState } from "react";
import { useRealtimeList } from "@/lib/useRealtimeList";
import { FinanceTransaction, FinanceType } from "@/lib/types";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/finance";
import { fmtDay } from "@/lib/date";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

function monthStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function money(n: number) {
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 0 }) + " ₽";
}

const PIE_COLORS = ["#378ADD", "#1D9E75", "#EF9F27", "#7F77DD", "#E24B4A", "#888888", "#4FC3E0", "#C77DFF"];

export default function FinancePage() {
  const [cursor, setCursor] = useState(new Date());
  const mStr = monthStr(cursor);
  const { items: txs, refetch } = useRealtimeList<FinanceTransaction>("finance_transactions", "/api/finance", `?month=${mStr}`);

  const [type, setType] = useState<FinanceType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(fmtDay(new Date()));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function switchType(t: FinanceType) {
    setType(t);
    setCategory(t === "expense" ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
  }

  async function add() {
    if (!amount || Number(amount) <= 0 || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, amount: Number(amount), category, note: note || null, date }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `Ошибка сервера (${res.status})`);
      }
      setAmount("");
      setNote("");
      refetch();
    } catch (e: any) {
      setError(e.message || "Не удалось сохранить, попробуйте ещё раз.");
    } finally {
      setSaving(false);
    }
  }

  async function del(id: string) {
    await fetch(`/api/finance/${id}`, { method: "DELETE" });
    refetch();
  }

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of txs) {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;
    }
    return { income, expense, balance: income - expense };
  }, [txs]);

  const byCategory = useMemo(() => {
    const m: Record<string, number> = {};
    for (const t of txs) if (t.type === "expense") m[t.category] = (m[t.category] || 0) + t.amount;
    return Object.entries(m)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [txs]);

  function shiftMonth(delta: number) {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));
  }

  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const sortedTxs = useMemo(() => txs.slice().sort((a, b) => b.date.localeCompare(a.date)), [txs]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">💰 Финансы</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => shiftMonth(-1)} className="w-7 h-7 border border-white/10 rounded hover:bg-white/10">←</button>
          <span className="text-sm font-semibold w-32 text-center capitalize">
            {cursor.toLocaleDateString("ru-RU", { month: "long", year: "numeric" })}
          </span>
          <button onClick={() => shiftMonth(1)} className="w-7 h-7 border border-white/10 rounded hover:bg-white/10">→</button>
          <button onClick={() => setCursor(new Date())} className="text-xs border border-white/10 rounded px-2 py-1 hover:bg-white/10">Сегодня</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Tile label="Доходы" value={money(totals.income)} color="#1D9E75" />
        <Tile label="Расходы" value={money(totals.expense)} color="#E24B4A" />
        <Tile label="Баланс" value={money(totals.balance)} color={totals.balance >= 0 ? "#378ADD" : "#E24B4A"} />
      </div>

      <div className="card p-3 mb-4">
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => switchType("expense")}
            className={`flex-1 text-xs rounded-lg py-2 font-semibold border transition ${
              type === "expense" ? "bg-red-900/40 border-red-500 text-red-300" : "border-white/10 text-slate-400"
            }`}
          >
            − Расход
          </button>
          <button
            onClick={() => switchType("income")}
            className={`flex-1 text-xs rounded-lg py-2 font-semibold border transition ${
              type === "income" ? "bg-emerald-900/40 border-emerald-500 text-emerald-300" : "border-white/10 text-slate-400"
            }`}
          >
            + Доход
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Сумма, ₽"
            className="w-28 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs"
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="bg-black/30 border border-white/10 rounded-lg px-2 py-2 text-xs">
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-black/30 border border-white/10 rounded-lg px-2 py-2 text-xs"
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Комментарий (необязательно)"
            className="flex-1 min-w-[140px] bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs"
          />
        </div>
        <button
          onClick={add}
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg py-2 text-xs font-semibold"
        >
          {saving ? "Сохраняю…" : "Добавить"}
        </button>
        {error && <div className="text-[11px] text-red-400 mt-2">{error}</div>}
      </div>

      {byCategory.length > 0 && (
        <div className="card p-4 mb-4">
          <div className="text-sm font-bold mb-3">Расходы по категориям</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byCategory} dataKey="value" nameKey="name" outerRadius={80} label>
                {byCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#1c1c1c", border: "1px solid #333" }} formatter={(v: number) => money(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="card p-3">
        {sortedTxs.length === 0 ? (
          <div className="text-center text-slate-500 text-sm py-16">Нет операций в этом месяце.</div>
        ) : (
          sortedTxs.map((t) => (
            <div key={t.id} className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 mb-1">
              <span className="text-[10px] text-slate-500 w-10 shrink-0">{t.date.slice(5)}</span>
              <span className="text-xs text-slate-400 w-24 shrink-0 truncate">{t.category}</span>
              <span className="flex-1 text-xs text-slate-300 truncate min-w-0">{t.note}</span>
              <span className={`text-xs font-semibold shrink-0 ${t.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                {t.type === "income" ? "+" : "−"}{money(t.amount)}
              </span>
              <button onClick={() => del(t.id)} className="text-slate-600 hover:text-red-400 text-xs shrink-0">✕</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Tile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="card p-4 text-center">
      <div className="text-lg font-bold" style={{ color }}>{value}</div>
      <div className="text-[10px] text-slate-400 mt-1">{label}</div>
    </div>
  );
}
