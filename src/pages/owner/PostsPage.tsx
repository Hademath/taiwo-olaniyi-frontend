import { useQuery } from "@tanstack/react-query";
import { FileText, PenLine, Plus } from "lucide-react";
import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { postsApi } from "../../api";
import { EmptyState, ErrorState, LoadingState } from "../../components/StateViews";
import { PageHeading } from "../../components/PageHeading";
import { StatusPill } from "../../components/StatusPill";
import { excerpt, formatDate } from "../../lib/format";
import type { PostStatus } from "../../types";

export function PostsPage() {
  const [status, setStatus] = useState<"all" | PostStatus>("all");
  const query = useQuery({ queryKey: ["posts", status], queryFn: () => postsApi.list(status === "all" ? undefined : status) });
  const { searchText } = useOutletContext<{ searchText: string }>();
  const needle = searchText.trim().toLocaleLowerCase();
  const posts = (query.data?.data ?? []).filter((post) => !needle || `${post.title} ${post.excerpt ?? ""} ${post.body}`.toLocaleLowerCase().includes(needle));
  return <div className="stack-xl"><PageHeading eyebrow="YOUR PORTFOLIO" title="Writing" description="Draft, refine, and publish your essays and articles." action={<Link className="button button-primary" to="/owner/posts/new"><Plus size={17} /> New article</Link>} />
    <div className="toolbar"><div className="segmented" role="tablist" aria-label="Filter articles">{(["all", "published", "draft"] as const).map((value) => <button key={value} role="tab" aria-selected={status === value} className={status === value ? "segment-active" : ""} onClick={() => setStatus(value)}>{value === "all" ? "All articles" : value === "published" ? "Published" : "Drafts"}</button>)}</div><span className="result-count">{posts.length} of {query.data?.total ?? 0} articles</span></div>
    {query.isError ? <ErrorState message="Could not load articles." retry={() => query.refetch()} /> : query.isLoading ? <LoadingState /> : posts.length ? <div className="table-wrap"><table className="article-table"><thead><tr><th>ARTICLE</th><th>STATUS</th><th>LAST UPDATED</th><th aria-label="Actions" /></tr></thead><tbody>{posts.map((post) => <tr key={post.id}><td><Link to={`/owner/posts/${post.id}/edit`} className="table-title"><span className={`table-thumb ${post.cover_image_url ? "has-image" : ""}`} style={post.cover_image_url ? { backgroundImage: `url(${post.cover_image_url})` } : undefined}>{!post.cover_image_url && <FileText size={17} />}</span><span><strong>{post.title}</strong><small>{post.excerpt || excerpt(post.body)}</small></span></Link></td><td><StatusPill status={post.status} /></td><td className="date-cell">{formatDate(post.updated_at)}</td><td><Link className="icon-button table-edit" to={`/owner/posts/${post.id}/edit`} aria-label={`Edit ${post.title}`}><PenLine size={16} /></Link></td></tr>)}</tbody></table></div> : <EmptyState title={needle ? "No matching articles" : "No articles in this view"} description={needle ? "Try a different title or phrase." : status === "published" ? "Published articles will appear here." : status === "draft" ? "Your saved drafts will appear here." : "Write your first article to begin your journal."} action={!needle && <Link className="button button-primary button-small" to="/owner/posts/new"><Plus size={15} /> New article</Link>} />}
  </div>;
}