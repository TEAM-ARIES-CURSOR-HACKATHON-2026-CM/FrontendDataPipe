import { Fragment, type ReactNode } from 'react';

function formatInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re =
    /(\*\*([^*]+)\*\*|__([^_]+)__|`([^`]+)`|\*([^*]+)\*|_([^_]+)_|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))/g;
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      nodes.push(text.slice(last, m.index));
    }
    const k = `${keyPrefix}-i${i++}`;
    if (m[2] || m[3]) {
      nodes.push(
        <strong key={k}>{m[2] ?? m[3]}</strong>,
      );
    } else if (m[4]) {
      nodes.push(
        <code key={k} className="rag-chat__inline-code">
          {m[4]}
        </code>,
      );
    } else if (m[5] || m[6]) {
      nodes.push(<em key={k}>{m[5] ?? m[6]}</em>);
    } else if (m[7] && m[8]) {
      nodes.push(
        <a key={k} href={m[8]} target="_blank" rel="noopener noreferrer">
          {m[7]}
        </a>,
      );
    }
    last = m.index + m[0].length;
  }

  if (last < text.length) {
    nodes.push(text.slice(last));
  }
  return nodes.length > 0 ? nodes : [text];
}

function isUlLine(line: string): boolean {
  return /^[-*•]\s+/.test(line.trim());
}

function isOlLine(line: string): boolean {
  return /^\d+[.)]\s+/.test(line.trim());
}

function stripUl(line: string): string {
  return line.trim().replace(/^[-*•]\s+/, '');
}

function stripOl(line: string): string {
  return line.trim().replace(/^\d+[.)]\s+/, '');
}

type Block =
  | { kind: 'p'; text: string }
  | { kind: 'h'; level: 2 | 3 | 4; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'code'; lang: string; text: string };

function parseBlocks(raw: string): Block[] {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      blocks.push({ kind: 'code', lang, text: codeLines.join('\n') });
      continue;
    }

    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const level = Math.min(heading[1].length + 1, 4) as 2 | 3 | 4;
      blocks.push({ kind: 'h', level, text: heading[2] });
      i += 1;
      continue;
    }

    if (isUlLine(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && isUlLine(lines[i])) {
        items.push(stripUl(lines[i]));
        i += 1;
      }
      blocks.push({ kind: 'ul', items });
      continue;
    }

    if (isOlLine(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && isOlLine(lines[i])) {
        items.push(stripOl(lines[i]));
        i += 1;
      }
      blocks.push({ kind: 'ol', items });
      continue;
    }

    const paraLines: string[] = [line];
    i += 1;
    while (i < lines.length) {
      const next = lines[i].trim();
      if (
        !next ||
        next.startsWith('```') ||
        /^#{1,3}\s/.test(next) ||
        isUlLine(next) ||
        isOlLine(next)
      ) {
        break;
      }
      paraLines.push(lines[i]);
      i += 1;
    }
    blocks.push({ kind: 'p', text: paraLines.join('\n') });
  }

  return blocks;
}

interface AssistantMessageContentProps {
  content: string;
  className?: string;
}

export function AssistantMessageContent({
  content,
  className = 'rag-chat__msg-body',
}: AssistantMessageContentProps) {
  const blocks = parseBlocks(content.trim());

  if (blocks.length === 0) {
    return <div className={className} />;
  }

  return (
    <div className={className}>
      {blocks.map((block, bi) => {
        const key = `b${bi}`;
        switch (block.kind) {
          case 'h': {
            const Tag = block.level === 2 ? 'h3' : block.level === 3 ? 'h4' : 'h5';
            return (
              <Tag key={key} className={`rag-chat__heading rag-chat__heading--${block.level}`}>
                {formatInline(block.text, key)}
              </Tag>
            );
          }
          case 'ul':
            return (
              <ul key={key} className="rag-chat__list">
                {block.items.map((item, ii) => (
                  <li key={`${key}-li${ii}`}>{formatInline(item, `${key}-li${ii}`)}</li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={key} className="rag-chat__list rag-chat__list--ordered">
                {block.items.map((item, ii) => (
                  <li key={`${key}-li${ii}`}>{formatInline(item, `${key}-li${ii}`)}</li>
                ))}
              </ol>
            );
          case 'code':
            return (
              <pre key={key} className="rag-chat__code-block">
                {block.lang ? (
                  <span className="rag-chat__code-lang" aria-hidden>
                    {block.lang}
                  </span>
                ) : null}
                <code>{block.text}</code>
              </pre>
            );
          case 'p':
          default:
            return (
              <p key={key} className="rag-chat__paragraph">
                {block.text.split('\n').map((seg, si, arr) => (
                  <Fragment key={`${key}-p${si}`}>
                    {formatInline(seg, `${key}-p${si}`)}
                    {si < arr.length - 1 ? <br /> : null}
                  </Fragment>
                ))}
              </p>
            );
        }
      })}
    </div>
  );
}

/** Texte utilisateur : retours à la ligne simples, sans markdown. */
export function UserMessageContent({ content }: { content: string }) {
  return (
    <p className="rag-chat__msg-text">
      {content.split('\n').map((line, i, arr) => (
        <Fragment key={i}>
          {line}
          {i < arr.length - 1 ? <br /> : null}
        </Fragment>
      ))}
    </p>
  );
}
