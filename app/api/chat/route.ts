import { NextRequest, NextResponse } from "next/server";
import type { ChatMessage, Provider } from "@/lib/types";

export const runtime = "nodejs";

interface ChatRequest {
  provider: Provider;
  model: string;
  system: string;
  temperature: number;
  messages: ChatMessage[];
}

export async function POST(req: NextRequest) {
  let body: ChatRequest;
  try {
    body = (await req.json()) as ChatRequest;
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const { provider, model, system, temperature, messages } = body;
  if (!provider || !model || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "provider, model, messages는 필수입니다." }, { status: 400 });
  }

  try {
    let text: string;
    if (provider === "anthropic") text = await callAnthropic(model, system, temperature, messages);
    else if (provider === "openai") text = await callOpenAI(model, system, temperature, messages);
    else if (provider === "google") text = await callGoogle(model, system, temperature, messages);
    else return NextResponse.json({ error: `지원하지 않는 provider: ${provider}` }, { status: 400 });

    return NextResponse.json({ text });
  } catch (e) {
    const message = e instanceof Error ? e.message : "알 수 없는 오류";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function requireKey(name: string): string {
  const key = process.env[name];
  if (!key) throw new Error(`${name} 환경 변수가 설정되지 않았습니다. .env.local을 확인하세요.`);
  return key;
}

async function callAnthropic(model: string, system: string, temperature: number, messages: ChatMessage[]) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": requireKey("ANTHROPIC_API_KEY"),
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      temperature,
      system: system || undefined,
      messages
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? `Anthropic API 오류 (${res.status})`);
  return (data.content as { type: string; text?: string }[])
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("\n");
}

async function callOpenAI(model: string, system: string, temperature: number, messages: ChatMessage[]) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${requireKey("OPENAI_API_KEY")}`
    },
    body: JSON.stringify({
      model,
      temperature,
      messages: [...(system ? [{ role: "system", content: system }] : []), ...messages]
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? `OpenAI API 오류 (${res.status})`);
  return data.choices?.[0]?.message?.content ?? "";
}

async function callGoogle(model: string, system: string, temperature: number, messages: ChatMessage[]) {
  const key = requireKey("GOOGLE_API_KEY");
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: system ? { parts: [{ text: system }] } : undefined,
        generationConfig: { temperature },
        contents: messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }]
        }))
      })
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? `Google API 오류 (${res.status})`);
  const parts = data.candidates?.[0]?.content?.parts as { text?: string }[] | undefined;
  return parts?.map((p) => p.text ?? "").join("") ?? "";
}
