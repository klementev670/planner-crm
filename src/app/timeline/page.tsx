"use client";
import { projectColor } from "@/lib/projects";

const TIMELINE = [
  { name: "Май 2026", date: "2026-05-01", tasks: { "AI-модель": "Выбрать хостинг, грант YC", "Карго": "Найти поставщика F30 с подогревом", "Курсы": "Структура курса (8 тем)", "ТюмГУ": "🔥 СЕССИЯ — 2 предмета" } },
  { name: "Июнь 2026", date: "2026-06-01", tasks: { "AI-модель": "Деплой MVP, 2–3 тест. клиента", "Карго": "Первый самостоятельный заказ", "Курсы": "Контакт Опора России", "ТюмГУ": "🔥 Сдать оба предмета" } },
  { name: "Июль 2026", date: "2026-07-01", tasks: { "AI-модель": "5+ платящих клиентов МСБ", "Карго": "Получить 1-ю поставку, продать", "Курсы": "Бесплатный МК — 20+ чел.", "ТюмГУ": "Каникулы — работа на проекты" } },
  { name: "Август 2026", date: "2026-08-01", tasks: { "AI-модель": "Партнёрство IT-компании, 10+ клиентов", "Карго": "2–3 дропшиппера, Тг-канал", "Курсы": "Встреча кафедра ТюмГУ", "ТюмГУ": "Подготовка к 3-му курсу" } },
  { name: "Сентябрь 2026", date: "2026-09-01", tasks: { "AI-модель": "🎯 Питч ФРИИ/Сколково", "Карго": "1 поставка/мес. стабильно", "Курсы": "🎯 Старт потока 1 (10–15 чел.)", "ТюмГУ": "Начало 3-го курса — без хвостов" } },
  { name: "Октябрь 2026", date: "2026-10-01", tasks: { "AI-модель": "20+ клиентов, переговоры", "Карго": "Оборот 100 т.р., расширение", "Курсы": "Завершить поток 1, платный поток 2", "ТюмГУ": "Держать ритм" } },
  { name: "Ноябрь 2026", date: "2026-11-01", tasks: { "AI-модель": "Term sheet / LOI", "Карго": "Оборот 150–200 т.р./мес.", "Курсы": "Эксперт Опоры России", "ТюмГУ": "Подготовка к сессии" } },
  { name: "Декабрь 2026", date: "2026-12-01", tasks: { "AI-модель": "🏆 Закрыть раунд $2M!", "Карго": "Система без тебя", "Курсы": "Онлайн-формат, продажа записей", "ТюмГУ": "🔥 Зимняя сессия" } },
  { name: "Январь 2027", date: "2027-01-01", tasks: { "AI-модель": "Нанять команду, новые фичи", "Карго": "Делегировать операции", "Курсы": "Поток 3 — другой город/онлайн", "ТюмГУ": "Каникулы, отдых и план" } },
  { name: "Февраль 2027", date: "2027-02-01", tasks: { "AI-модель": "50+ клиентов", "Карго": "Тг-бот автоматизация", "Курсы": "Договор с ТюмГУ официально", "ТюмГУ": "Весенний семестр 3-го курса" } },
  { name: "Март 2027", date: "2027-03-01", tasks: { "AI-модель": "Series A подготовка", "Карго": "Оборот 300+ т.р./мес.", "Курсы": "Стабильный ежемес. доход", "ТюмГУ": "Проекты = кейсы для диплома" } },
  { name: "Апрель 2027", date: "2027-04-01", tasks: { "AI-модель": "Питч Series A", "Карго": "Пассивный доход", "Курсы": "Другие вузы, онлайн РФ", "ТюмГУ": "🔥 Сессия — готовиться заранее" } },
  { name: "Май 2027", date: "2027-05-01", tasks: { "AI-модель": "🏁 ГОД ЗАКРЫТ", "Карго": "Оборот × 10 от старта", "Курсы": "3+ потока, доход стабилен", "ТюмГУ": "3-й курс закрыт" } },
];

const PID: Record<string, string> = { "AI-модель": "ai-model", "Карго": "cargo", "Курсы": "courses", "ТюмГУ": "tyumgu" };

export default function TimelinePage() {
  const now = new Date();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">🗓️ Таймлайн — 12 месяцев</h1>
      <div className="flex flex-col gap-3">
        {TIMELINE.map((m) => {
          const md = new Date(m.date);
          const isCur = md.getFullYear() === now.getFullYear() && md.getMonth() === now.getMonth();
          return (
            <div key={m.name} className={`card p-3 flex gap-4 ${isCur ? "border-2" : ""}`}
              style={{ borderColor: isCur ? "#EF9F27" : undefined }}>
              <div className={`w-28 shrink-0 rounded-lg flex flex-col items-center justify-center text-center text-xs font-bold ${isCur ? "bg-[#EF9F27] text-black" : "bg-white/5 text-slate-300"}`}>
                {m.name}
                {isCur && <span className="text-[9px] font-normal mt-1">← сейчас</span>}
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {Object.entries(m.tasks).map(([proj, txt]) => (
                  <div key={proj} className="rounded-md border p-2 bg-black/20" style={{ borderColor: projectColor(PID[proj]) }}>
                    <div className="text-[10px] font-bold mb-1" style={{ color: projectColor(PID[proj]) }}>{proj}</div>
                    <div className="text-[10px] text-slate-300">{txt}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
