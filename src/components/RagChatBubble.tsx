import { useEffect, useRef, useState } from 'react';
import { askDocuments, uploadDoc } from '../api/aiClient';
import type { AskSourceAi } from '../api/aiSchema';
import { AssistantMessageContent, UserMessageContent } from './AssistantMessageContent';

const ACCEPT = '.pdf,.txt,.md,.markdown';

export interface IndexedDoc {
  id: string;
  label: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: AskSourceAi[];
}

interface RagChatBubbleProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  docs: IndexedDoc[];
  onDocIndexed: (docId: string, label: string, nbChunks: number) => void;
  onError: (message: string) => void;
}

function shortDocId(id: string): string {
  if (id.length <= 28) return id;
  return `${id.slice(0, 12)}…${id.slice(-6)}`;
}

function docLabel(doc: IndexedDoc): string {
  return doc.label.length > 36 ? `${doc.label.slice(0, 32)}…` : doc.label;
}

export function RagChatBubble({
  open,
  onOpenChange,
  docs,
  onDocIndexed,
  onError,
}: RagChatBubbleProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [question, setQuestion] = useState('');
  const [selectedDocId, setSelectedDocId] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [open, messages, loading, uploading]);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const res = await uploadDoc(file);
      onDocIndexed(res.doc_id, file.name, res.nb_chunks);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'system',
          content: `« ${file.name} » indexé (${res.nb_chunks} segment${res.nb_chunks > 1 ? 's' : ''}).`,
        },
      ]);
      setSelectedDocId(res.doc_id);
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Erreur upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleAsk = async () => {
    const q = question.trim();
    if (!q || loading || uploading) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: q };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await askDocuments(q, selectedDocId || undefined);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: res.answer,
          sources: res.sources ?? [],
        },
      ]);
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Erreur Q&A');
      setMessages((prev) => prev.slice(0, -1));
      setQuestion(q);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleAsk();
    }
  };

  const busy = loading || uploading;

  return (
    <div className={`rag-chat ${open ? 'rag-chat--open' : ''}`} aria-live="polite">
      {open && (
        <section className="rag-chat__panel" aria-label="Assistant documents RAG">
          <header className="rag-chat__head">
            <div className="rag-chat__head-text">
              <span className="rag-chat__badge" aria-hidden>
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path
                    fill="currentColor"
                    d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h3v3.6c0 .9 1.1 1.3 1.7.7L14.3 18H20c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 11H6v-2h6v2zm4-4H6V7h10v2z"
                  />
                </svg>
              </span>
              <div>
                <h2 className="rag-chat__title">Assistant documents</h2>
                <p className="rag-chat__subtitle">Indexez et interrogez vos PDF, TXT ou Markdown</p>
              </div>
            </div>
            <button
              type="button"
              className="rag-chat__close"
              onClick={() => onOpenChange(false)}
              aria-label="Réduire le chat"
            >
              ×
            </button>
          </header>

          {docs.length > 0 && (
            <div className="rag-chat__filter">
              <label className="rag-chat__filter-label">
                Document
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  disabled={busy}
                >
                  <option value="">Tous les documents</option>
                  {docs.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {docLabel(doc)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          <div className="rag-chat__thread" ref={threadRef}>
            {messages.length === 0 && !loading && !uploading && (
              <div className="rag-chat__empty">
                <p>
                  {docs.length === 0
                    ? 'Cliquez sur l’épingle pour joindre un document, puis posez vos questions.'
                    : 'Posez une question sur le contenu de vos documents.'}
                </p>
                <p className="rag-chat__empty-hint">Ex. : De quoi parle ce document ?</p>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`rag-chat__msg rag-chat__msg--${msg.role}`}
              >
                {msg.role !== 'system' && (
                  <span className="rag-chat__msg-label">
                    {msg.role === 'user' ? 'Vous' : 'Assistant'}
                  </span>
                )}
                {msg.role === 'assistant' ? (
                  <AssistantMessageContent content={msg.content} />
                ) : msg.role === 'user' ? (
                  <UserMessageContent content={msg.content} />
                ) : (
                  <p className="rag-chat__msg-text">{msg.content}</p>
                )}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="rag-chat__sources">
                    <span className="rag-chat__sources-label">Sources</span>
                    {msg.sources.map((src, i) => (
                      <details key={`${src.doc_id}-${i}`} className="rag-chat__source">
                        <summary>
                          <span className="rag-chat__source-id">{shortDocId(src.doc_id)}</span>
                        </summary>
                        <p className="rag-chat__source-preview">{src.chunk_preview}</p>
                      </details>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {uploading && (
              <div className="rag-chat__msg rag-chat__msg--system rag-chat__msg--typing">
                <p className="rag-chat__msg-text">Indexation du document…</p>
              </div>
            )}
            {loading && (
              <div className="rag-chat__msg rag-chat__msg--assistant rag-chat__msg--typing">
                <span className="rag-chat__msg-label">Assistant</span>
                <p className="rag-chat__msg-text">Recherche en cours…</p>
              </div>
            )}
          </div>

          <footer className="rag-chat__composer">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              className="rag-chat__file-input"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
                e.target.value = '';
              }}
            />
            <div className="rag-chat__composer-row">
              <button
                type="button"
                className="rag-chat__attach"
                disabled={busy}
                onClick={() => fileInputRef.current?.click()}
                aria-label="Joindre un document (PDF, TXT, Markdown)"
                title="Joindre un document"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                  <path
                    fill="currentColor"
                    d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6h-1.5v9.5a2.5 2.5 0 0 0 5 0V5a4 4 0 0 0-8 0v12.5a5.5 5.5 0 1 0 11 0V6h-1.5z"
                  />
                </svg>
              </button>
              <textarea
                className="rag-chat__input"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={onKeyDown}
                rows={2}
                placeholder="Votre question…"
                disabled={busy}
              />
            </div>
            <button
              type="button"
              className="btn btn--primary rag-chat__send"
              disabled={busy || !question.trim()}
              onClick={() => void handleAsk()}
            >
              Envoyer
            </button>
          </footer>
        </section>
      )}

      <button
        type="button"
        className={`rag-chat__fab ${open ? 'rag-chat__fab--open' : ''}`}
        data-tour="rag-fab"
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-label={open ? 'Fermer l’assistant documents' : 'Ouvrir l’assistant documents RAG'}
        title="Questions sur vos documents"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
          <path
            fill="currentColor"
            d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h3v3.6c0 .9 1.1 1.3 1.7.7L14.3 18H20c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 11H6v-2h6v2zm4-4H6V7h10v2z"
          />
        </svg>
        {!open && docs.length > 0 && <span className="rag-chat__fab-dot" aria-hidden />}
      </button>
    </div>
  );
}
