import React from 'react';
import katex from 'katex';

interface FormattedContentProps {
  content: string;
  className?: string;
  textClassName?: string;
}

/**
 * Parses LaTeX math ($...$ or $$...$$) and basic markdown (bold, code, lists)
 * and renders it safely and beautifully using KaTeX.
 */
export const FormattedContent: React.FC<FormattedContentProps> = ({
  content,
  className = '',
  textClassName = '',
}) => {
  if (!content) return null;

  // Split content by block math ($$...$$) first
  const blockRegex = /\$\$([\s\S]+?)\$\$/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const textChunk = content.substring(lastIndex, match.index);
      parts.push(
        <span key={`text-${lastIndex}`}>{renderInlineMarkdownAndMath(textChunk, textClassName)}</span>
      );
    }

    const formula = match[1].trim();
    let renderedHtml = formula;
    try {
      renderedHtml = katex.renderToString(formula, {
        displayMode: true,
        throwOnError: false,
      });
    } catch {
      renderedHtml = `<code>${formula}</code>`;
    }

    parts.push(
      <div
        key={`block-math-${match.index}`}
        className="my-2.5 overflow-x-auto py-1 text-center font-mono text-sm"
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    const textChunk = content.substring(lastIndex);
    parts.push(
      <span key={`text-end-${lastIndex}`}>{renderInlineMarkdownAndMath(textChunk, textClassName)}</span>
    );
  }

  return <div className={`leading-relaxed ${className}`}>{parts}</div>;
};

function renderInlineMarkdownAndMath(text: string, textClassName: string): React.ReactNode {
  // Split lines if it contains bullet lists or line breaks
  const lines = text.split('\n');

  return (
    <>
      {lines.map((line, lineIdx) => {
        const isBullet = /^\s*[-*•]\s+(.+)/.exec(line);
        if (isBullet) {
          return (
            <div key={`line-${lineIdx}`} className="my-1 flex items-start gap-2">
              <span className="text-indigo-500 font-bold select-none text-xs leading-5">▪</span>
              <span className={`flex-1 ${textClassName}`}>
                {renderInlineMathAndFormatting(isBullet[1])}
              </span>
            </div>
          );
        }

        // Blank line produces spacing
        if (!line.trim()) {
          return <div key={`line-${lineIdx}`} className="h-2" />;
        }

        return (
          <p key={`line-${lineIdx}`} className={`my-0.5 ${textClassName}`}>
            {renderInlineMathAndFormatting(line)}
          </p>
        );
      })}
    </>
  );
}

function renderInlineMathAndFormatting(line: string): React.ReactNode {
  // Tokenize by inline math $...$
  const inlineMathRegex = /\$([^\$\n]+?)\$/g;
  const segments: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = inlineMathRegex.exec(line)) !== null) {
    if (match.index > lastIdx) {
      segments.push(
        <span key={`seg-${lastIdx}`}>
          {renderBasicFormatting(line.substring(lastIdx, match.index))}
        </span>
      );
    }

    const math = match[1].trim();
    let rendered = math;
    try {
      rendered = katex.renderToString(math, {
        displayMode: false,
        throwOnError: false,
      });
    } catch {
      rendered = `<code>${math}</code>`;
    }

    segments.push(
      <span
        key={`inline-math-${match.index}`}
        className="inline-block px-1 font-mono text-sm align-baseline"
        dangerouslySetInnerHTML={{ __html: rendered }}
      />
    );

    lastIdx = match.index + match[0].length;
  }

  if (lastIdx < line.length) {
    segments.push(
      <span key={`seg-end-${lastIdx}`}>
        {renderBasicFormatting(line.substring(lastIdx))}
      </span>
    );
  }

  return <>{segments}</>;
}

function renderBasicFormatting(raw: string): React.ReactNode {
  // Matches code backticks `...` and bold **...**
  const regex = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  const parts = raw.split(regex);

  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={i}
          className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-indigo-600 dark:text-indigo-400 font-medium"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={i} className="font-semibold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
