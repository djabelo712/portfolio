"use client";

import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

/**
 * Render a paragraph that may contain $...$ (inline math) and $$...$$ (block math).
 * Use sparingly — for plain text without LaTeX, prefer a normal <p>.
 */
export function MathText({ text, className }: { text: string; className?: string }) {
  // Split on $$...$$ first (block), then on $...$ (inline)
  const parts: React.ReactNode[] = [];
  // Regex: match $$...$$ (block) OR $...$ (inline) — non-greedy
  const regex = /(\$\$[^$]+\$\$|\$[^$]+\$)/g;
  let lastIndex = 0;
  let key = 0;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(text)) !== null) {
    // Push the text before this math
    if (m.index > lastIndex) {
      parts.push(text.slice(lastIndex, m.index));
    }
    const token = m[0];
    if (token.startsWith("$$")) {
      const expr = token.slice(2, -2);
      parts.push(<BlockMath key={key++} math={expr} />);
    } else {
      const expr = token.slice(1, -1);
      parts.push(<InlineMath key={key++} math={expr} />);
    }
    lastIndex = m.index + token.length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <span className={className}>{parts}</span>;
}
