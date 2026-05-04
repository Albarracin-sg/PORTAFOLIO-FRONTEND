import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";

interface MarkdownProps {
  children: string;
  className?: string;
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
        prose-code:text-violet-600 prose-code:dark:text-violet-400
        prose-code:bg-slate-100 prose-code:dark:bg-slate-800
        prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
        prose-pre:bg-slate-900 prose-pre:dark:bg-slate-950
        prose-blockquote:border-l-violet-500
        ${className}`}
    >
      <ReactMarkdown 
        remarkPlugins={[remarkGfm, remarkBreaks]} 
        rehypePlugins={[rehypeHighlight]}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
