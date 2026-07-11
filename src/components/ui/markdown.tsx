import { useState, useCallback, type ReactNode, type HTMLAttributes } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";

interface MarkdownProps {
  children: string;
  className?: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may fail in some contexts
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium opacity-0 transition-all duration-200 group-hover:opacity-100 hover:scale-105 active:scale-95 dark:border-white/10 dark:bg-zinc-800/80 dark:text-zinc-400 dark:hover:text-zinc-200 border-black/8 bg-white/80 text-zinc-500 hover:text-zinc-800 backdrop-blur-sm"
      title="Copy code"
    >
      {copied ? (
        <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
        </svg>
      )}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function PreBlock({ children, ...props }: HTMLAttributes<HTMLPreElement>) {
  const codeElement = children as React.ReactNode;
  let codeText = "";

  if (
    codeElement &&
    typeof codeElement === "object" &&
    "props" in codeElement
  ) {
    const props = (codeElement as { props: { children?: string } }).props;
    if (typeof props.children === "string") {
      codeText = props.children;
    } else if (Array.isArray(props.children)) {
      codeText = (props.children as ReactNode[])
        .map((c) => (typeof c === "string" ? c : ""))
        .join("");
    }
  }

  return (
    <pre className="relative group" {...props}>
      <CopyButton text={codeText} />
      {children}
    </pre>
  );
}

export function Markdown({ children, className = "" }: MarkdownProps): ReactNode {
  return (
    <div
      className={`prose prose-sm max-w-none dark:prose-invert
        prose-p:leading-relaxed prose-p:my-2
        prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5
        prose-headings:my-2 prose-headings:font-semibold
        prose-a:text-violet-600 prose-a:underline prose-a:underline-offset-2
        prose-strong:font-bold
        prose-blockquote:border-l-violet-500
        ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeHighlight]}
        components={{ pre: PreBlock }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
