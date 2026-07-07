"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Assistant } from "@/lib/types";
import { PROVIDERS } from "@/lib/models";

export default function DashboardPage() {
  const router = useRouter();
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      setEmail(user.email ?? "");
      const { data } = await supabase
        .from("assistants")
        .select("*")
        .eq("owner", user.id)
        .order("updated_at", { ascending: false });
      setAssistants((data as Assistant[]) ?? []);
      setLoading(false);
    })();
  }, [router]);

  async function createAssistant() {
    setCreating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("assistants")
      .insert({ owner: user.id })
      .select()
      .single();
    setCreating(false);
    if (!error && data) router.push(`/builder/${data.id}`);
  }

  async function remove(id: string) {
    if (!confirm("이 어시스턴트를 삭제할까요?")) return;
    await supabase.from("assistants").delete().eq("id", id);
    setAssistants(assistants.filter((a) => a.id !== id));
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  function providerLabel(id: string) {
    return PROVIDERS.find((p) => p.id === id)?.label ?? id;
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">내 어시스턴트</h1>
          <p className="mt-1 text-sm text-ink/50">{email}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={signOut}>로그아웃</button>
          <button className="btn-primary" onClick={createAssistant} disabled={creating}>
            {creating ? "생성 중…" : "+ 새 어시스턴트"}
          </button>
        </div>
      </header>

      {loading ? (
        <p className="text-sm text-ink/50">불러오는 중…</p>
      ) : assistants.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-semibold">아직 어시스턴트가 없습니다</p>
          <p className="mt-1 text-sm text-ink/50">첫 어시스턴트를 만들어 프롬프트와 모델을 설정해 보세요.</p>
          <button className="btn-primary mt-5" onClick={createAssistant} disabled={creating}>
            새 어시스턴트 만들기
          </button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {assistants.map((a) => (
            <li key={a.id} className="card flex flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-bold">{a.name}</h2>
                <span
                  className={
                    a.is_published
                      ? "rounded-full bg-pine-soft px-2 py-0.5 text-xs font-semibold text-pine"
                      : "rounded-full bg-paper px-2 py-0.5 text-xs font-semibold text-ink/40"
                  }
                >
                  {a.is_published ? "게시됨" : "비공개"}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 min-h-10 text-sm text-ink/55">
                {a.description || "설명이 없습니다."}
              </p>
              <p className="mt-2 text-xs font-semibold text-ink/40">
                {providerLabel(a.provider)} · {a.model}
              </p>
              <div className="mt-4 flex gap-2">
                <Link href={`/builder/${a.id}`} className="btn-primary flex-1">편집</Link>
                {a.is_published && a.slug && (
                  <Link href={`/a/${a.slug}`} className="btn-ghost flex-1">공개 링크</Link>
                )}
                <button className="btn-ghost text-red-600" onClick={() => remove(a.id)}>삭제</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
