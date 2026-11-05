import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, ExternalLink, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { publicationsApi } from "../../api";
import { ConfirmModal } from "../../components/ConfirmModal";
import { PageHeading } from "../../components/PageHeading";
import { EmptyState, ErrorState, LoadingState } from "../../components/StateViews";
import { stripHtml, formatDate } from "../../lib/format";
import { messageFor } from "../../lib/format";
import type { Publication, PublicationStatus } from "../../types";

const TYPE_LABELS: Record<Publication["type"], string> = {
  article: "Article", book: "Book", chapter: "Book Chapter",
  thesis: "Thesis", conference: "Conference Paper", report: "Report",
};

export function PublicationsPage() {
  const client = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<"all" | PublicationStatus>("all");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["publications", statusFilter],
    queryFn: () => publicationsApi.list(statusFilter === "all" ? undefined : statusFilter),
  });

  const remove = useMutation({
    mutationFn: (id: string) => publicationsApi.remove(id),
    onSuccess: () => { toast.success("Publication removed."); setConfirmId(null); client.invalidateQueries({ queryKey: ["publications"] }); },
    onError: (error) => toast.error(messageFor(error)),
  });

  const toggleStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PublicationStatus }) => publicationsApi.updateStatus(id, status),
    onSuccess: () => { toast.success("Visibility updated."); client.invalidateQueries({ queryKey: ["publications"] }); },
    onError: (error) => toast.error(messageFor(error)),
  });

  const items = query.data?.data ?? [];

  return (
    <div className="stack-xl">
      <ConfirmModal
        open={confirmId !== null}
        variant="danger"
        title="Delete this publication?"
        description="This publication will be permanently removed from your portfolio."
        confirmLabel="Delete publication"
        isPending={remove.isPending}
        onConfirm={() => { if (confirmId) remove.mutate(confirmId); }}
        onCancel={() => setConfirmId(null)}
      />

      <PageHeading eyebrow="YOUR PORTFOLIO" title="Publications" description="Your peer-reviewed articles, books, chapters, and reports."
        action={<Link className="button button-primary" to="/owner/publications/new"><Plus size={17} /> Add publication</Link>} />

      <div className="toolbar">
        <div className="segmented" role="tablist" aria-label="Filter publications">
          {(["all", "published", "draft"] as const).map((v) => (
            <button key={v} role="tab" aria-selected={statusFilter === v} className={statusFilter === v ? "segment-active" : ""} onClick={() => setStatusFilter(v)}>
              {v === "all" ? "All" : v === "published" ? "Published" : "Drafts"}
            </button>
          ))}
        </div>
        <span className="result-count">{items.length} of {query.data?.total ?? 0} publications</span>
      </div>

      {query.isError
        ? <ErrorState message={messageFor(query.error)} retry={() => query.refetch()} />
        : query.isLoading
          ? <LoadingState>Loading publications…</LoadingState>
          : items.length
            ? <div className="table-wrap">
                <table className="article-table">
                  <thead><tr><th>Title</th><th>Type</th><th>Status</th><th>Year</th><th>Updated</th><th></th></tr></thead>
                  <tbody>
                    {items.map((pub) => (
                      <tr key={pub.id}>
                        <td>
                          <div className="table-title">
                            <span className="pub-year-badge">{pub.year ?? "—"}</span>
                            <span style={{ display: "grid", gap: 3, minWidth: 0 }}>
                              <strong style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 400 }}>{pub.title}</strong>
                              {pub.abstract && <small style={{ color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 400 }}>{stripHtml(pub.abstract)}</small>}
                            </span>
                          </div>
                        </td>
                        <td><span className="status-pill status-approved">{TYPE_LABELS[pub.type] ?? pub.type}</span></td>
                        <td>
                          <button
                            className={`status-pill ${pub.status === "published" ? "status-published" : "status-draft"}`}
                            style={{ cursor: "pointer", border: "none", background: "transparent" }}
                            title={pub.status === "published" ? "Click to set as draft" : "Click to publish"}
                            disabled={toggleStatus.isPending}
                            onClick={() => toggleStatus.mutate({ id: pub.id, status: pub.status === "published" ? "draft" : "published" })}
                          >
                            {pub.status === "published" ? "Published" : "Draft"}
                          </button>
                        </td>
                        <td><span className="date-cell">{pub.year ?? "—"}</span></td>
                        <td><span className="date-cell">{formatDate(pub.updated_at)}</span></td>
                        <td>
                          <div style={{ display: "flex", gap: 4 }}>
                            {pub.url && <a className="icon-button" href={pub.url} target="_blank" rel="noreferrer" title="View publication"><ExternalLink size={15} /></a>}
                            <Link className="icon-button table-edit" to={`/owner/publications/${pub.id}/edit`} title="Edit"><ArrowUpRight size={15} /></Link>
                            <button className="icon-button danger-quiet" onClick={() => setConfirmId(pub.id)} title="Delete"><Trash2 size={15} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            : <EmptyState title="No publications in this view" description="Add your first publication to build your academic record."
                action={<Link className="button button-primary button-small" to="/owner/publications/new"><Plus size={15} /> Add publication</Link>} />}
    </div>
  );
}
