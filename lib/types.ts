export type Provider = "anthropic" | "openai" | "google";

export interface Assistant {
  id: string;
  owner: string;
  name: string;
  description: string;
  provider: Provider;
  model: string;
  system_prompt: string;
  temperature: number;
  is_published: boolean;
  slug: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
