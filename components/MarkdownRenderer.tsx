'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div className={`markdown-content text-gray-200 text-xs sm:text-[13px] leading-relaxed font-sans space-y-3 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight mt-6 mb-3 pb-2 border-b border-white/10" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-5 mb-2.5 flex items-center gap-2" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-sm sm:text-base font-bold text-white mt-4 mb-2 text-cyber-cyan" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-xs sm:text-sm font-semibold text-gray-200 mt-3 mb-1.5" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="my-2 leading-relaxed text-gray-300" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-white tracking-wide" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="text-gray-300 italic" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside space-y-1.5 my-2.5 pl-1.5 text-gray-300" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside space-y-1.5 my-2.5 pl-1.5 text-gray-300 font-medium" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-2 border-cyber-green pl-3.5 my-3 italic text-gray-400 bg-cyber-green/[0.03] py-1 rounded-r-lg" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="my-4 overflow-x-auto rounded-xl border border-white/10 shadow-sm bg-black/40">
              <table className="w-full text-left text-xs border-collapse" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-surface/80 border-b border-white/10 text-white font-bold" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-white/5" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-white/[0.03] transition-colors" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-3 font-semibold text-white tracking-wide" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-2.5 text-gray-300 align-top" {...props} />
          ),
          code: ({ node, className, children, ...props }: any) => {
            const hasNewLine = String(children).includes('\n');
            const isCodeBlock = hasNewLine || (className && className.startsWith('language-'));
            if (!isCodeBlock) {
              return (
                <code className="px-1.5 py-0.5 rounded-md bg-white/10 text-cyber-green font-mono text-[11px] border border-white/5" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <div className="my-3 rounded-xl bg-black/60 border border-white/10 p-3.5 overflow-x-auto shadow-inner">
                <code className="text-xs font-mono text-gray-200 block leading-relaxed" {...props}>
                  {children}
                </code>
              </div>
            );
          },
          hr: ({ node, ...props }) => (
            <hr className="my-5 border-white/10" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-cyber-green hover:underline font-semibold" target="_blank" rel="noreferrer" {...props} />
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
