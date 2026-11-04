import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { achievementsApi } from "../../api";
import { PageHeading } from "../../components/PageHeading";
import { EmptyState, ErrorState, LoadingState } from "../../components/StateViews";
import { messageFor } from "../../lib/format";
import type { Achievement } from "../../types";

const TYPE_LABELS: Record<Achievement["type"], string> = {
  award: "Award", grant: "Grant", fellowship: "Fellowship",
  recognition: "Recognition", appointment: "Appointment",
};

const TYPE_TONES: Record<Achievement["type"], string> = {
  award: "status-published", grant: "status-draft", fellowship: "status-approved",
  recognition: "status-pending", appointment: "status-approved",
};

export function AchievementsPage() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["achievements"], queryFn: () => achievementsApi.list() });
  const remove = useMutation({
    mutationFn: (id: string) => achievementsApi.remove(id),
    onSuccess: () => client.invalidateQueries({ queryKey: ["achievements"] }),
  });
  const items = query.data?.data ?? [];

  return (
    <div className="stack-xl">
      <PageHeading eyebrow="YOUR PORTFOLIO" title="Achievements" description="Awards, grants, fellowships, and other recognitions."
        action={<Link className="button button-primary" to="/owner/achievements/new"><Plus size={17} /> Add achievement</Link>} />
      {query.isError
        ? <ErrorState message={messageFor(query.error)} retry={() => query.refetch()} />
        : query.isLoading
          ? <LoadingState>Loading achievements…</LoadingState>
          : items.length
            ? <div className="table-wrap">
                <table className="article-table">
                  <thead><tr>
                    <th>Title</th><th>Type</th><th>Institution</th><th>Year</th><th></th>
                  </tr></thead>
                  <tbody>{items.map((ach) => (
                    <tr key={ach.id}>
                      <td>
                        <div className="table-title">
                          <div style={{ width: 38, height: 38, borderRadius: 6, display: "grid", placeItems: "center", background: "var(--pale)", color: "var(--orange)", fontSize: 9, fontWeight: 800, flexShrink: 0 }}>
                            {ach.year ?? "-"}
                          </div>
                          <span style={{ display: "grid", minWidth: 0, gap: 4 }}>
                            <strong style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 400 }}>{ach.title}</strong>
                            {ach.description && <small style={{ color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 400 }}>{ach.description}</small>}
                          </span>
                        </div>
                      </td>
                      <td><span className={`status-pill ${TYPE_TONES[ach.type]}`}>{TYPE_LABELS[ach.type]}</span></td>
                      <td><span className="date-cell">{ach.institution ?? "-"}</span></td>
                      <td><span className="date-cell">{ach.year ?? "-"}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 4 }}>
                          <Link className="icon-button table-edit" to={`/owner/achievements/${ach.id}/edit`} title="Edit"><ArrowUpRight size={15} /></Link>
                          <button className="icon-button table-edit" onClick={() => { if (confirm("Delete this achievement?")) remove.mutate(ach.id); }} title="Delete" style={{ color: "#a85245" }}><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            : <EmptyState title="No achievements yet" description="Add your first award, grant, or fellowship."
                action={<Link className="button button-primary button-small" to="/owner/achievements/new"><Plus size={15} /> Add achievement</Link>} />}
    </div>
  );
}
