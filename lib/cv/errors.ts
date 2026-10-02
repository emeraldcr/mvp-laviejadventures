import { CvGroundingError } from "./validate";
import type { GenerationDiagnostic } from "./types";

/** Never store provider messages: authentication errors can contain key fragments. */
export function diagnoseGenerationError(error: unknown, stage: string, model?: string): GenerationDiagnostic {
  const info = error && typeof error === "object" ? error as { status?: number; code?: string; name?: string; request_id?: string } : {};
  const status = info.status;
  const code = typeof info.code === "string" && /^[\w-]{1,80}$/.test(info.code) ? info.code : undefined;
  let kind = code ?? "generation_error";
  let message = "AI generation was unavailable; the CV was prepared from archived evidence.";
  let retryable = status === 408 || status === 409 || status === 429 || Boolean(status && status >= 500);
  if (status === 401 || status === 403) { kind = "ai_credentials_rejected"; message = "AI credentials were rejected. Update the server API key to enable AI rewriting."; retryable = false; }
  else if (status === 404) { kind = "ai_model_unavailable"; message = "The configured AI model is unavailable for this account."; }
  else if (code === "insufficient_quota") { message = "AI account quota is exhausted. Check the provider billing settings."; retryable = false; }
  else if (status === 429) message = "The AI service is busy. A retry was attempted within the generation time limit.";
  else if (/timeout|abort/i.test(info.name ?? "")) { kind = "ai_timeout"; message = "AI generation exceeded its time limit."; retryable = true; }
  else if (/connection/i.test(info.name ?? "")) { kind = "ai_connection_error"; message = "The AI service could not be reached."; retryable = true; }
  else if (error instanceof CvGroundingError) { kind = "evidence_validation_failed"; message = error.message; }
  const requestId = typeof info.request_id === "string" && /^[\w-]{1,120}$/.test(info.request_id) ? info.request_id : undefined;
  return { stage, code: kind, message, retryable, ...(status ? { status } : {}), ...(requestId ? { requestId } : {}), ...(model ? { model } : {}) };
}
