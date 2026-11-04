import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, ExternalLink, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { publicationsApi } from "../../api";
import { PageHeading } from "../../components/PageHeading";
import { EmptyState, ErrorState, LoadingState } from "../../components/StateViews";
import { messageFor } from "../../lib/format";
import type { Publication } from "../../types";

const TYPE_LABELS: Record<Publication["type"], string> = {
  article: "Article", book: "Book", chapter: "Book Chapter",
  thesis: "Thesis", conference: "Conference Paper", report: "Report",
};

export function PublicationsPage() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["publications"], queryFn: () => publicationsApi.list() });
  const remove = useMutation({
    mutationFn: (id: string) => publicationsApi.remove(id),
    onSuccess: () => client.invalidateQueries({ queryKey: ["publications"] }),
  });
  const items = query.data?.data ?? [];

  return (
    <div className="stack-xl">
      <PageHeading eyebrow="YOUR PORTFOLIO" title="Publications" description="Your peer-reviewed articles, books, chapters, and reports."
        action={<Link className="button button-primary" to="/owner/publications/new"><Plus size={17} /> Add publication</Link>} />
      {query.isError
        ? <ErrorState message={messageFor(query.error)} retry={() => query.refetch()} />
        : query.isLoading
          ? <LoadingState>Loading publications…</LoadingState>
          : items.length
            ? <div className="table-wrap">
                <table className="article-table">
                  <thead><tr>
                    <th>Title</th><th>Type</th><th>Publisher / Venue</th><th>Year</th><th></th>
                  </tr></thead>
                  <tbody>{items.map((pub) => <PublicationRow key={pub.id} pub={pub} onDelete={() => { if (confirm("Delete this publication?")) remove.mutate(pub.id); }} />)}</tbody>
                </table>
              </div>
            : <EmptyState title="No publications yet" description="Add your first publication to build your academic record."
                action={<Link className="button button-primary button-small" to="/owner/publications/new"><Plus size={15} /> Add publication</Link>} />}
    </div>
  );
}

function PublicationRow({ pub, onDelete }: { pub: Publication; onDelete: () => void }) {
  return (
    <tr>
      <td>
        <div className="table-title">
          <span style={{ width: 38, height: 38, borderRadius: 6, display: "grid", placeItems: "center", background: "var(--pale)", color: "var(--green)", fontSize: 9, fontWeight: 800, letterSpacing: 1, flexShrink: 0 }}>
            {pub.year ?? "-"}
          </span>
          <span style={{ display: "grid", gap: 4, minWidth: 0 }}>
            <strong style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 400 }}>{pub.title}</strong>
            {pub.abstract && <small style={{ color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 400 }}>{pub.abstract}</small>}
          </span>
        </div>
      </td>
      <td><span className="status-pill status-published">{TYPE_LABELS[pub.type] ?? pub.type}</span></td>
      <td><span className="date-cell">{pub.publisher ?? "-"}</span></td>
      <td><span className="date-cell">{pub.year ?? "-"}</span></td>
      <td>
        <div style={{ display: "flex", gap: 4 }}>
          {pub.url && <a className="icon-button" href={pub.url} target="_blank" rel="noreferrer" title="View publication"><ExternalLink size={15} /></a>}
          <Link className="icon-button table-edit" to={`/owner/publications/${pub.id}/edit`} title="Edit"><ArrowUpRight size={15} /></Link>
          <button className="icon-button table-edit" onClick={onDelete} title="Delete" style={{ color: "#a85245" }}><Trash2 size={15} /></button>
        </div>
      </td>
    </tr>
  );
}
