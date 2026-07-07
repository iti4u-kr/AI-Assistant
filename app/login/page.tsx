"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setMessage(null);
    const fn =
      mode === "signin"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });
    const { error } = await fn;
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="card w-full max-w-sm p-8">
        <h1 className="text-xl font-bold">{mode === "signin" ? "로그인" : "회원가입"}</h1>
        <p className="mt-1 text-sm text-ink/50">Assistant Studio 계정으로 계속하기</p>
        <div className="mt-6 space-y-4">
          <div>
            <label className="label">이메일</label>
            <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">비밀번호</label>
            <input className="field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {message && <p className="text-sm text-red-600">{message}</p>}
          <button className="btn-primary w-full" onClick={submit} disabled={loading || !email || !password}>
            {loading ? "처리 중…" : mode === "signin" ? "로그인" : "가입하기"}
          </button>
          <button
            className="w-full text-center text-sm text-pine underline-offset-2 hover:underline"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "계정이 없나요? 회원가입" : "이미 계정이 있나요? 로그인"}
          </button>
        </div>
      </div>
    </main>
  );
}
