import type { Provider } from "./types";

export const PROVIDERS: { id: Provider; label: string; models: { id: string; label: string }[] }[] = [
  {
    id: "anthropic",
    label: "Anthropic",
    models: [
      { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
      { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5" }
    ]
  },
  {
    id: "openai",
    label: "OpenAI",
    models: [
      { id: "gpt-4o", label: "GPT-4o" },
      { id: "gpt-4o-mini", label: "GPT-4o mini" }
    ]
  },
  {
    id: "google",
    label: "Google",
    models: [
      { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash" }
    ]
  }
];

export function modelsOf(provider: Provider) {
  return PROVIDERS.find((p) => p.id === provider)?.models ?? [];
}
