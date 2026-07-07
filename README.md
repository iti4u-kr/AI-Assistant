# Assistant Studio — AI Assistant 플랫폼 (MVP)

사업성 분석 / 기술계획서 문서의 **MVP 1단계**를 구현한 Next.js + Supabase 앱입니다.

구현 범위: **로그인 · Assistant Builder · Chat(Playground) · Publish(공개 링크) · Multi LLM(Anthropic/OpenAI/Google)**

## 기술 스택

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS
- Supabase (Auth + Postgres + RLS)
- LLM API 직접 호출 (Anthropic Messages / OpenAI Chat Completions / Google Gemini)

## 설치 및 실행

### 1. Supabase 프로젝트 준비

1. https://supabase.com 에서 새 프로젝트 생성
2. SQL Editor에 `supabase/schema.sql` 내용을 붙여넣어 실행
3. (개발 편의) Authentication > Providers > Email 에서 "Confirm email"을 꺼두면 가입 즉시 로그인됩니다.

### 2. 환경 변수

```bash
cp .env.example .env.local
```

`.env.local`에 Supabase URL/anon key와 사용할 LLM API 키를 입력합니다. 세 provider 중 키가 있는 것만 동작합니다.

### 3. 실행

```bash
npm install
npm run dev
```

http://localhost:3000 접속 → 회원가입 → 어시스턴트 생성 → Builder에서 프롬프트/모델 설정 → Playground 테스트 → "게시하기"로 공개 링크 발급.

## 구조

```
app/
  page.tsx            랜딩
  login/              이메일 로그인/회원가입
  dashboard/          내 어시스턴트 목록·생성·삭제
  builder/[id]/       Builder(설정 폼) + Playground + Publish
  a/[slug]/           게시된 어시스턴트 공개 채팅
  api/chat/route.ts   Multi LLM 라우팅 (API 키는 서버에서만 사용)
lib/
  models.ts           provider별 모델 카탈로그
  supabase/client.ts  Supabase 브라우저 클라이언트
supabase/schema.sql   assistants 테이블 + RLS 정책
```

## 보안 메모

- LLM API 키는 서버 라우트(`/api/chat`)에서만 읽으므로 브라우저에 노출되지 않습니다.
- `assistants` 테이블은 RLS로 보호됩니다: 소유자는 전체 권한, 게시된 항목만 익명 조회 가능.
- 공개 채팅은 현재 rate limit이 없습니다. 실서비스 전 요청 제한(예: Upstash Ratelimit)과 사용량 로깅을 추가하세요.

## 로드맵 (기술계획서 기준)

- 2단계: RAG(Knowledge), Memory — Supabase pgvector 권장
- 3단계: Marketplace, Analytics(usage 테이블 + Cost Dashboard)
- 4단계: Workflow Builder, MCP Tool Engine, Team Workspace, Billing(Stripe)
