import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownBody({ body }: { body: string }) {
  const isHtml = body.trimStart().startsWith("<");
  if (isHtml) {
    return <div className="markdown-body" dangerouslySetInnerHTML={{ __html: body }} />;
  }
  return <div className="markdown-body"><ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown></div>;
}
