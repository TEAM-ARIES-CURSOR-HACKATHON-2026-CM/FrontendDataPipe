import { useState } from 'react';
import { askDocuments } from '../api/aiClient';
import type { AskSourceAi } from '../api/aiSchema';

interface RagAskPanelProps {
  docIds: string[];
  onError: (message: string) => void;
}

export function RagAskPanel({ docIds, onError }: RagAskPanelProps) {
  const [question, setQuestion] = useState('');
  const [selectedDocId, setSelectedDocId] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [sources, setSources] = useState<AskSourceAi[]>([]);

  const handleAsk = async () => {
    const q = question.trim();
    if (!q) return;
    setLoading(true);
    setAnswer(null);
    setSources([]);
    try {
      const res = await askDocuments(q, selectedDocId || undefined);
      setAnswer(res.answer);
      setSources(res.sources ?? []);
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Erreur Q&A');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="ai-assistant ai-assistant--embedded">
      <p className="panel-hint panel-hint--compact">
        Posez une question sur vos documents indexés.
      </p>
      {docIds.length > 0 && (
        <label className="field field--compact ai-rag__doc-select">
          <span>Document (optionnel)</span>
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
          >
            <option value="">Tous les documents</option>
            {docIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </label>
      )}
      <textarea
        className="ai-assistant__input"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        rows={3}
        placeholder="Ex. : Quelles règles métier s'appliquent aux virements ?"
      />
      <button
        type="button"
        className="btn btn--primary btn--block"
        disabled={loading || !question.trim()}
        onClick={() => void handleAsk()}
      >
        {loading ? 'Recherche…' : 'Poser la question'}
      </button>
      {answer && (
        <div className="ai-rag__answer">
          <p className="ai-rag__answer-text">{answer}</p>
          {sources.length > 0 && (
            <div className="ai-rag__sources">
              <span className="ai-rag__sources-label">Sources</span>
              {sources.map((src, i) => (
                <details key={`${src.doc_id}-${i}`} className="ai-rag__source">
                  <summary>{src.doc_id}</summary>
                  <p>{src.chunk_preview}</p>
                </details>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
