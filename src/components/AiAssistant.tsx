import { useState } from 'react';

interface AiAssistantProps {
  loading: boolean;
  schema: string[];
  onGenerate: (description: string) => void;
  lastCode?: string | null;
  lastExplanation?: string | null;
  embedded?: boolean;
}

export function AiAssistant({
  loading,
  schema,
  onGenerate,
  lastCode,
  lastExplanation,
  embedded = false,
}: AiAssistantProps) {
  const [text, setText] = useState('Filtre les virements de plus de 5 000 €');

  return (
    <section className={`ai-assistant ${embedded ? 'ai-assistant--embedded' : ''}`}>
      {!embedded && <h2 className="panel-title">Copilote IA</h2>}
      <p className="panel-hint panel-hint--compact">
        Règle métier en français → bloc(s) ajouté(s) sur le canevas.
        {schema.length > 0 && (
          <span className="ai-assistant__schema">
            {' '}
            Schéma : {schema.join(', ')}
          </span>
        )}
      </p>
      <textarea
        className="ai-assistant__input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={embedded ? 4 : 2}
        placeholder="Ex. : Grouper par agence, somme des montants"
      />
      <button
        type="button"
        className="btn btn--primary btn--block"
        disabled={loading || !text.trim()}
        onClick={() => onGenerate(text.trim())}
      >
        {loading ? 'Analyse…' : 'Générer'}
      </button>
      {lastExplanation && (
        <p className="ai-assistant__explanation">{lastExplanation}</p>
      )}
      {lastCode && (
        <pre className="ai-assistant__code ai-assistant__code--scroll">{lastCode}</pre>
      )}
    </section>
  );
}
