export interface GenerateRequestAi {
  description: string;
  schema: string[];
}

export interface GenerateResponseAi {
  code: string;
  explanation: string;
}

export interface UploadDocResponseAi {
  doc_id: string;
  nb_chunks: number;
  message: string;
}

export interface AskRequestAi {
  question: string;
  doc_id?: string;
}

export interface AskSourceAi {
  doc_id: string;
  chunk_preview: string;
}

export interface AskResponseAi {
  answer: string;
  sources: AskSourceAi[];
}

export type AiErrorBody = {
  detail?: string | { msg: string }[];
};
