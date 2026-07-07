"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Assistant, Provider } from "@/lib/types";
import { PROVIDERS, modelsOf } from "@/lib/models";
import ChatPanel from "@/components/ChatPanel";

export default function BuilderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [a, setA] = useState<Assistant | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [playgroundKey, setPlaygroundKey] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      const { data } = await supabase.from("assistants").select("*").eq("id", id).single();
      if (!data) {
        router.replace("/dashboard");
        return;
      }
      setA(data as Assistant);
    })();
  }, [id, router]);

  function patch(p: Partial<Assistant>) {
    if (a) setA({ ...a, ...p });
  }

  async function save(extra?: Partial<Assistant>) {
    if (!a) return;
    setSaving(true);
    const next = { ...a, ...extra };
    const { error } = await supabase
      .from("assistants")
      .update({
        name: next.name,
        description: next.description,
        provider: next.provider,
        model: next.model,
        system_prompt: next.system_prompt,
        temperature: next.temperature,
        is_published: next.is_published,
        slug: next.slug
      })
      .eq("id", a.id);
    setSaving(false);
    if (!error) {
      setA(next);
      setSavedAt(new Date().toLocaleTimeString("ko-KR"));
    } else {
      alert(`저장 실패: ${error.message}`);
    }
  }

  async function togglePublish() {
    if (!a) return;
    if (a.is_published) {
      await save({ is_published: false });
    } else {
      const slug = a.slug ?? `${a.name.replace(/\s+/g, "-").toLowerCase()}-${a.id.slice(0, 6)}`;
      await save({ is_published: true, slug });
    }
  }

  if (!a) return <main className="p-10 text-sm text-ink/50">불러오는 중…</main>;

  const publicUrl = a.slug ? `/a/${a.slug}` : null;

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/dashboard" className="text-sm text-pine hover:underline">← 대시보드</Link>
          <h1 className="mt-1 text-2xl font-extrabold">Assistant Builder</h1>
        </div>
        <div className="flex items-center gap-3">
          {savedAt && <span className="text-xs text-ink/40">{savedAt} 저장됨</span>}
          <button className="btn-ghost" onClick={() => save()} disabled={saving}>
            {saving ? "저장 중…" : "저장"}
          </button>
          <button className="btn-primary" onClick={togglePublish} disabled={saving}>
            {a.is_published ? "게시 취소" : "게시하기"}
          </button>
        </div>
      </header>

      {a.is_published && publicUrl && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-lg bg-pine-soft px-4 py-3 text-sm">
          <span>
            공개 링크: <Link className="font-semibold text-pine underline" href={publicUrl}>{publicUrl}</Link>
          </span>
          <button
            className="btn-ghost"
            onClick={() => navigator.clipboard.writeText(location.origin + publicUrl)}
          >
            링크 복사
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 설정 */}
        <section className="card space-y-5 p-6">
          <div>
            <label className="label">이름</label>
            <input className="field" value={a.name} onChange={(e) => patch({ name: e.target.value })} />
          </div>
          <div>
            <label className="label">설명</label>
            <input
              className="field"
              value={a.description}
              placeholder="이 어시스턴트가 하는 일"
              onChange={(e) => patch({ description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Provider</label>
              <select
                className="field"
                value={a.provider}
                onChange={(e) => {
                  const provider = e.target.value as Provider;
                  patch({ provider, model: modelsOf(provider)[0]?.id ?? "" });
                }}
              >
                {PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">모델</label>
              <select className="field" value={a.model} onChange={(e) => patch({ model: e.target.value })}>
                {modelsOf(a.provider).map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Temperature — {a.temperature.toFixed(1)}</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={a.temperature}
              className="w-full accent-pine"
              onChange={(e) => patch({ temperature: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="label">System Prompt</label>
            <textarea
              className="field min-h-52 font-mono text-xs leading-relaxed"
              value={a.system_prompt}
              placeholder="어시스턴트의 역할, 말투, 규칙을 정의하세요."
              onChange={(e) => patch({ system_prompt: e.target.value })}
            />
          </div>
        </section>

        {/* Playground */}
        <section className="card flex min-h-[560px] flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="text-sm font-bold">Playground</h2>
            <button className="text-xs font-semibold text-pine hover:underline" onClick={() => setPlaygroundKey((k) => k + 1)}>
              대화 초기화
            </button>
          </div>
          <ChatPanel
            key={playgroundKey}
            provider={a.provider}
            model={a.model}
            system={a.system_prompt}
            temperature={a.temperature}
            assistantName={a.name}
            placeholder="저장하지 않아도 현재 설정으로 바로 테스트됩니다."
          />
        </section>
      </div>
    </main>
  );
}
