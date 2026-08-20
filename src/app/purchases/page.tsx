"use client";
import { useMemo, useState } from "react";
import { useRealtimeList } from "@/lib/useRealtimeList";
import { PurchaseBatch } from "@/lib/types";
import { fmtDay } from "@/lib/date";

function money(n: number) {
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 0 }) + " ₽";
}
function daysBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export default function PurchasesPage() {
  const { items: batches, refetch } = useRealtimeList<PurchaseBatch>("purchase_batches", "/api/batches");
  const [showAdd, setShowAdd] = useState(false);

  const totals = useMemo(() => {
    let spent = 0, revenue = 0, soldDays = 0, soldCount = 0;
    for (const b of batches) {
      spent += b.purchase_cost + b.delivery_cost + b.ad_cost;
      revenue += b.sale_revenue;
      if (b.sold_date) {
        soldDays += daysBetween(b.purchase_date, b.sold_date);
        soldCount++;
      }
    }
    return {
      spent,
      revenue,
      profit: revenue - spent,
      inProgress: batches.length - soldCount,
      sold: soldCount,
      avgDays: soldCount ? Math.round(soldDays / soldCount) : null,
    };
  }, [batches]);

  async function del(id: string) {
    await fetch(`/api/batches/${id}`, { method: "DELETE" });
    refetch();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">📦 Закупки из Китая</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 hover:bg-blue-500 rounded-lg px-4 py-2 text-xs font-semibold"
        >
          + Партия
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Tile label="Потрачено всего" value={money(totals.spent)} color="#EF9F27" />
        <Tile label="Выручка" value={money(totals.revenue)} color="#378ADD" />
        <Tile label="Прибыль" value={money(totals.profit)} color={totals.profit >= 0 ? "#1D9E75" : "#E24B4A"} />
        <Tile
          label="Ср. срок реализации"
          value={totals.avgDays === null ? "—" : `${totals.avgDays} дн.`}
          color="#7F77DD"
        />
      </div>

      {batches.length === 0 ? (
        <div className="card p-3 text-center text-slate-500 text-sm py-16">
          Нет закупок.<br />Добавь первую партию товара!
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {batches.map((b) => (
            <BatchCard key={b.id} batch={b} onSaved={refetch} onDelete={() => del(b.id)} />
          ))}
        </div>
      )}

      {showAdd && <AddBatchDialog onClose={() => setShowAdd(false)} onSaved={refetch} />}
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

function BatchCard({
  batch,
  onSaved,
  onDelete,
}: {
  batch: PurchaseBatch;
  onSaved: () => void;
  onDelete: () => void;
}) {
  const [local, setLocal] = useState(batch);
  const [error, setError] = useState<string | null>(null);

  async function patch(fields: Partial<PurchaseBatch>) {
    const prev = local;
    setLocal({ ...local, ...fields });
    setError(null);
    try {
      const res = await fetch(`/api/batches/${batch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) throw new Error();
      onSaved();
    } catch {
      setLocal(prev);
      setError("Не сохранилось — проверьте связь и попробуйте ещё раз.");
    }
  }

  const totalCost = local.purchase_cost + local.delivery_cost + local.ad_cost;
  const profit = local.sale_revenue - totalCost;
  const days = local.sold_date ? daysBetween(local.purchase_date, local.sold_date) : null;

  return (
    <div className="card p-3">
      <div className="flex items-center justify-between mb-2 gap-2">
        <input
          value={local.name}
          onChange={(e) => setLocal({ ...local, name: e.target.value })}
          onBlur={() => patch({ name: local.name })}
          className="flex-1 bg-transparent font-bold text-sm outline-none border-b border-transparent focus:border-white/20"
        />
        <button onClick={onDelete} className="text-slate-600 hover:text-red-400 text-xs shrink-0">✕ удалить</button>
      </div>

      <div className="flex flex-wrap gap-3 mb-2">
        <NumberField label="Закупка" value={local.purchase_cost} onCommit={(v) => patch({ purchase_cost: v })} />
        <NumberField label="Доставка" value={local.delivery_cost} onCommit={(v) => patch({ delivery_cost: v })} />
        <NumberField label="Реклама" value={local.ad_cost} onCommit={(v) => patch({ ad_cost: v })} />
        <NumberField label="Продано за" value={local.sale_revenue} onCommit={(v) => patch({ sale_revenue: v })} />
      </div>

      <div className="flex flex-wrap items-center gap-4 text-[11px]">
        <span className="text-slate-500">
          Закуплено:{" "}
          <input
            type="date"
            value={local.purchase_date}
            onChange={(e) => patch({ purchase_date: e.target.value })}
            className="bg-transparent text-slate-300 outline-none"
          />
        </span>
        <span className="text-slate-500">
          Продано:{" "}
          {local.sold_date ? (
            <input
              type="date"
              value={local.sold_date}
              onChange={(e) => patch({ sold_date: e.target.value || null })}
              className="bg-transparent text-slate-300 outline-none"
            />
          ) : (
            <button
              onClick={() => patch({ sold_date: fmtDay(new Date()) })}
              className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
            >
              отметить проданным
            </button>
          )}
        </span>
        {days !== null && <span className="text-slate-500">Срок реализации: <b className="text-slate-300">{days} дн.</b></span>}
      </div>

      <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap gap-4 text-[11px]">
        <span className="text-slate-500">Расходы: <b className="text-slate-300">{money(totalCost)}</b></span>
        <span className="text-slate-500">
          Прибыль: <b style={{ color: profit >= 0 ? "#1D9E75" : "#E24B4A" }}>{money(profit)}</b>
        </span>
      </div>
      {error && <div className="mt-2 text-[10px] text-red-400">{error}</div>}
    </div>
  );
}

function NumberField({
  label,
  value,
  onCommit,
}: {
  label: string;
  value: number;
  onCommit: (v: number) => void;
}) {
  const [text, setText] = useState(String(value));

  return (
    <label className="text-[10px] text-slate-500 flex flex-col gap-0.5">
      {label}
      <input
        type="number"
        inputMode="decimal"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => onCommit(Number(text) || 0)}
        className="w-24 bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-200 outline-none focus:border-blue-500"
      />
    </label>
  );
}

function AddBatchDialog({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [purchaseCost, setPurchaseCost] = useState("");
  const [date, setDate] = useState(fmtDay(new Date()));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!name.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          purchase_cost: Number(purchaseCost) || 0,
          purchase_date: date,
        }),
      });
      if (!res.ok) throw new Error();
      onSaved();
      onClose();
    } catch {
      setError("Не удалось сохранить — проверьте связь и попробуйте ещё раз.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="card p-6 w-80" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold mb-3">Новая партия товара</h3>
        <label className="text-xs text-slate-400">Название</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          placeholder="Например: Наушники TWS x50"
          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm mt-1 mb-3 outline-none focus:border-blue-500"
        />
        <label className="text-xs text-slate-400">Сумма закупки, ₽</label>
        <input
          type="number"
          inputMode="decimal"
          value={purchaseCost}
          onChange={(e) => setPurchaseCost(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          placeholder="0"
          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm mt-1 mb-3 outline-none focus:border-blue-500"
        />
        <label className="text-xs text-slate-400">Дата закупки</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm mt-1 mb-4 outline-none focus:border-blue-500"
        />
        {error && <div className="text-[10px] text-red-400 mb-3">{error}</div>}
        <div className="flex gap-2">
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg py-2 text-sm font-semibold"
          >
            {saving ? "Сохраняю…" : "Добавить"}
          </button>
          <button onClick={onClose} className="px-4 border border-white/10 rounded-lg text-sm hover:bg-white/10">
            Отмена
          </button>
        </div>
        <div className="text-[10px] text-slate-500 mt-3">
          Доставку, рекламу и выручку можно будет добавить позже прямо в карточке партии.
        </div>
      </div>
    </div>
  );
}
