export type AiConfig = {
  provider: "ollama" | "none";
  baseUrl: string;
  model: string;
  enabled: boolean;
};

export function getAiConfig(): AiConfig {
  return {
    provider: (process.env.AI_PROVIDER as AiConfig["provider"]) ?? "ollama",
    baseUrl: process.env.OLLAMA_BASE_URL ?? "http://ollama:11434",
    model: process.env.OLLAMA_MODEL ?? "llama3.1",
    enabled: process.env.AI_PROVIDER !== "none"
  };
}

export async function generateChapterSummary() {
  throw new Error("generateChapterSummary: not implemented");
}
export async function analyzeWritingStyle() {
  throw new Error("analyzeWritingStyle: not implemented");
}
export async function findRepetitiveWords() {
  throw new Error("findRepetitiveWords: not implemented");
}
export async function suggestChapterImprovements() {
  throw new Error("suggestChapterImprovements: not implemented");
}
export async function findContinuityIssues() {
  throw new Error("findContinuityIssues: not implemented");
}
