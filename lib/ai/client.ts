import "server-only";

import Anthropic from "@anthropic-ai/sdk";

/**
 * Server-only Anthropic client. Never import this from a Client Component
 * — the "server-only" import above makes that a build error, which is the
 * point: ANTHROPIC_API_KEY must never reach the browser bundle.
 */

const MODEL = "claude-sonnet-5";

export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

let client: Anthropic | null = null;

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new AiNotConfiguredError();
  }
  client ??= new Anthropic({ apiKey });
  return client;
}

/** Thrown when an AI action runs without ANTHROPIC_API_KEY set — callers should catch this and show a "Connection Required" message rather than a generic error. */
export class AiNotConfiguredError extends Error {
  constructor() {
    super("AI features need an Anthropic API key. Add ANTHROPIC_API_KEY in Settings → AI (see .env.local.example).");
    this.name = "AiNotConfiguredError";
  }
}

/** One-shot text generation: system prompt + user prompt in, plain text out. */
export async function generateText(params: { system: string; prompt: string; maxTokens?: number }): Promise<string> {
  const anthropic = getClient();

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: params.maxTokens ?? 2048,
    system: params.system,
    messages: [{ role: "user", content: params.prompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("AI response didn't contain any text.");
  }
  return textBlock.text;
}

/** Same as generateText, but parses the response as JSON matching shape T. Instructs the model to return JSON only — still validates rather than trusting it blindly. */
export async function generateJson<T>(params: { system: string; prompt: string; maxTokens?: number }): Promise<T> {
  const text = await generateText({
    ...params,
    system: `${params.system}\n\nRespond with ONLY valid JSON — no markdown code fences, no commentary before or after.`,
  });

  const cleaned = text.trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error("AI response wasn't valid JSON.");
  }
}
