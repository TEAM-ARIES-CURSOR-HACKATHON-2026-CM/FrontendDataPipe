import { useState } from 'react';

interface AiAssistantProps {
  loading: boolean;
  onGenerate: (description: string) => void;
  lastCode?: string | null;
}

export function AiAssistant({ loading, onGenerate, lastCode }: AiAssistantProps) {
  const [text, setText] = useState(
    'Filtre les transactions de plus de 5000 euros',
  );

  return (
    <section className="ai-assistant">
      <h2 className="panel-title">Assistant IA</h2>
      <p className="panel-hint">Décrivez une transformation en français</p>
      <textarea
        className="ai-assistant__input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Ex : Grouper par agence et sommer les montants"
      />
      <button
        type="button"
        className="btn btn--primary"
        disabled={loading || !text.trim()}
        onClick={() => onGenerate(text.trim())}
      >
        {loading ? 'Génération…' : 'Générer'}
      </button>
      {lastCode && (
        <pre className="ai-assistant__code">{lastCode}</pre>
      )}
    </section>
  );
}
