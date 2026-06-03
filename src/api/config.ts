/** Backend déployé : https://huggingface.co/spaces/AHMED-X-18/Aries-Datapipe */
export const DEFAULT_API_URL = 'https://ahmed-x-18-aries-datapipe.hf.space';

export function getApiBaseUrl(): string {
  const url = import.meta.env.VITE_API_URL?.trim();
  if (url) return url.replace(/\/$/, '');
  return '/api';
}
