import React from 'react';
import ReactMarkdown from 'react-markdown';
import './MarkdownWithCursor.css';

interface Props {
  content: string;
  loading: boolean;
}

export default function MarkdownWithCursor({ content, loading }: Props) {
  return (
    <div className={`markdown-with-cursor${loading ? ' loading' : ''}`}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
