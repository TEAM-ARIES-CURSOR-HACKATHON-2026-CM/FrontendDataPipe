import { useRef, useState } from 'react';
import { uploadDoc } from '../api/aiClient';

const ACCEPT = '.pdf,.txt,.md,.markdown';

interface RagUploadPanelProps {
  onUploaded: (docId: string, nbChunks: number) => void;
  onError: (message: string) => void;
}

export function RagUploadPanel({ onUploaded, onError }: RagUploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpload, setLastUpload] = useState<{ docId: string; nbChunks: number; message: string } | null>(
    null,
  );

  const handleFile = async (file: File) => {
    setLoading(true);
    setLastUpload(null);
    try {
      const res = await uploadDoc(file);
      setLastUpload({ docId: res.doc_id, nbChunks: res.nb_chunks, message: res.message });
      onUploaded(res.doc_id, res.nb_chunks);
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Erreur upload document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="ai-assistant ai-assistant--embedded">
      <p className="panel-hint panel-hint--compact">
        Indexez un PDF, TXT ou Markdown. Ensuite, ouvrez la bulle{' '}
        <strong>Assistant documents</strong> (en bas à droite) pour interroger le contenu.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="ai-rag__file-input"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        className="btn btn--primary btn--block"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
      >
        {loading ? 'Indexation…' : 'Choisir un document'}
      </button>
      {lastUpload && (
        <div className="ai-rag__result">
          <p className="ai-rag__status ai-rag__status--ok">{lastUpload.message}</p>
          <p className="ai-rag__meta">
            <span>ID : {lastUpload.docId}</span>
            <span>{lastUpload.nbChunks} segment{lastUpload.nbChunks > 1 ? 's' : ''}</span>
          </p>
        </div>
      )}
    </section>
  );
}
