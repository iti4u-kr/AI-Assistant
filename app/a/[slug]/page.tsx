"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Assistant } from "@/lib/types";
import ChatPanel from "@/components/ChatPanel";

export default function PublicAssistantPage() {
  const { slug } = useParams<{ slug: string }>();
  const [a, setA] = useState<Assistant | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("assistants")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (!data) setNotFound(true);
      else setA(data as Assistant);
    })();
  }, [slug]);

  if (notFound) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <div>
          <h1 className="text-xl font-bold">어시스턴트를 찾을 수 없습니다</h1>
          <p className="mt-2 text-sm text-ink/50">링크가 잘못되었거나 게시가 취소되었습니다.</p>
        </div>
      </main>
    );
  }

  if (!a) return <main className="p-10 text-sm text-ink/50">불러오는 중…</main>;

  return (
    <main className="mx-auto flex h-screen max-w-2xl flex-col px-4 py-6">
      <header className="mb-4 px-1">
        <h1 className="text-xl font-extrabold">{a.name}</h1>
        {a.description && <p className="mt-1 text-sm text-ink/55">{a.description}</p>}
      </header>
      <div className="card flex min-h-0 flex-1 flex-col overflow-hidden">
        <ChatPanel
          provider={a.provider}
          model={a.model}
          system={a.system_prompt}
          temperature={a.temperature}
          assistantName={a.name}
        />
      </div>
      <p className="mt-3 text-center text-xs text-ink/35">Assistant Studio로 제작됨</p>
    </main>
  );
}
