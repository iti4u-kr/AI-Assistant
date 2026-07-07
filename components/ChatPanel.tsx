"use client";

import { useRef, useState } from "react";
import type { ChatMessage, Provider } from "@/lib/types";

interface Props {
  provider: Provider;
  model: string;
  system: string;
  temperature: number;
  assistantName: string;
  placeholder?: string;
}

export default function ChatPanel({ provider, model, system, temperature, assistantName, placeholder }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function send() {
    const content = input.trim();
    if (!content || loading) return;
    setError(null);
    const next: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ provider, model, system, temperature, messages: next })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "응답을 받지 못했습니다.");
      setMessages([...next, { role: "assistant", content: data.text }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="pt-10 text-center text-sm text-ink/40">
            {placeholder ?? `${assistantName}에게 첫 메시지를 보내 보세요.`}
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={
                m.role === "user"
                  ? "max-w-[85%] rounded-2xl rounded-br-sm bg-pine px-4 py-2.5 text-sm text-white"
                  : "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-sm border border-line bg-white px-4 py-2.5 text-sm"
              }
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && <p className="text-sm text-ink/40">{assistantName} 응답 생성 중…</p>}
        {error && <p className="text-sm text-red-600">오류: {error}</p>}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 border-t border-line p-3">
        <input
          className="field"
          value={input}
          placeholder="메시지 입력"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) send();
          }}
        />
        <button className="btn-primary shrink-0" onClick={send} disabled={loading || !input.trim()}>
          보내기
        </button>
      </div>
    </div>
  );
}
