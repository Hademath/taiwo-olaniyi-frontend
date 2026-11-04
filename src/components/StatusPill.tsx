export function StatusPill({ status }: { status: string }) {
  const label = status === "published" ? "Published" : status === "draft" ? "Draft" : status === "approved" ? "Approved" : status === "rejected" ? "Hidden" : "Pending";
  return <span className={`status-pill status-${status}`}>{label}</span>;
}