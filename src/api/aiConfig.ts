/** Assistant IA — https://datapipe-ai-assistant.onrender.com */
export const DEFAULT_AI_API_URL = 'https://datapipe-ai-assistant.onrender.com';

export function getAiApiBaseUrl(): string {
  const url = import.meta.env.VITE_AI_API_URL?.trim();
  if (url) return url.replace(/\/$/, '');
  return '/ai-api';
}
