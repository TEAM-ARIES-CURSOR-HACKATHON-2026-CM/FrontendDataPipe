import { getAiApiBaseUrl } from './aiConfig';
import type {
  AiErrorBody,
  AskRequestAi,
  AskResponseAi,
  GenerateRequestAi,
  GenerateResponseAi,
  UploadDocResponseAi,
} from './aiSchema';

const AI_BASE = getAiApiBaseUrl();

async function parseAiError(res: Response): Promise<string> {
  const body = (await res.json().catch(() => ({}))) as AiErrorBody;
  const { detail } = body;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map((d) => d.msg).join(' · ');
  }
  return res.statusText || `Erreur HTTP ${res.status}`;
}

/** POST /generate — génération de code Pandas à partir d'une description et du schéma CSV. */
export async function generatePandasCode(
  description: string,
  schema: string[],
): Promise<GenerateResponseAi> {
  const body: GenerateRequestAi = {
    description,
    schema: schema.length ? schema : [],
  };
  const res = await fetch(`${AI_BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseAiError(res));
  return res.json() as Promise<GenerateResponseAi>;
}

/** POST /upload-doc — indexe un document (PDF, TXT, MD) pour le RAG. */
export async function uploadDoc(file: File): Promise<UploadDocResponseAi> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${AI_BASE}/upload-doc`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(await parseAiError(res));
  return res.json() as Promise<UploadDocResponseAi>;
}

/** POST /ask — question-réponse sur les documents indexés. */
export async function askDocuments(
  question: string,
  docId?: string,
): Promise<AskResponseAi> {
  const body: AskRequestAi = { question };
  if (docId?.trim()) body.doc_id = docId.trim();
  const res = await fetch(`${AI_BASE}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseAiError(res));
  return res.json() as Promise<AskResponseAi>;
}

export { AI_BASE };
