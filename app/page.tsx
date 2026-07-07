import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
      <p className="mb-3 rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-pine">
        Multi LLM · Builder · Publish
      </p>
      <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
        누구나 만드는
        <br />
        업무용 <span className="text-pine">AI Assistant</span>
      </h1>
      <p className="mt-4 max-w-md text-ink/60">
        프롬프트와 모델을 고르면 나만의 어시스턴트가 완성됩니다. 링크 하나로 팀과 세상에 배포하세요.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/login" className="btn-primary">시작하기</Link>
        <Link href="/dashboard" className="btn-ghost">대시보드</Link>
      </div>
    </main>
  );
}
