import { FilePlus2 } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state"><span className="empty-icon"><FilePlus2 size={22} /></span><h3>{title}</h3><p>{description}</p>{action}</div>;
}

export function LoadingState({ children = "Loading your journal…" }: { children?: ReactNode }) {
  return <div className="loading-state"><span className="spinner" /> {children}</div>;
}

export function ErrorState({ message, retry }: { message: string; retry: () => void }) {
  return <div className="error-state"><p>{message}</p><button className="button button-outline button-small" onClick={retry}>Try again</button></div>;
}