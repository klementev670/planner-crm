"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const [code, setCode] = useState("");
  const [err, setErr] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode: code }),
    });
    if (res.ok) {
      router.push(params.get("next") || "/");
      router.refresh();
    } else {
      setErr(true);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="bg-panel border border-white/10 rounded-2xl p-8 w-80 flex flex-col gap-4"
    >
      <h1 className="text-lg font-bold text-blue-400">📋 Планировщик</h1>
      <input
        type="password"
        autoFocus
        value={code}
        onChange={(e) => { setCode(e.target.value); setErr(false); }}
        placeholder="Код доступа"
        className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
      />
      {err && <p className="text-red-400 text-xs">Неверный код</p>}
      <button className="bg-blue-600 hover:bg-blue-500 rounded-lg py-2 text-sm font-semibold transition">
        Войти
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
