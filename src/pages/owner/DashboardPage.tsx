import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, BookMarked, BookOpen, FileText, MessageCircle, PenLine, Plus, ShieldCheck, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { achievementsApi, postsApi, publicationsApi } from "../../api";
import { OwnerPostRow } from "../../components/OwnerPostRow";
import { EmptyState, ErrorState } from "../../components/StateViews";
import { PageHeading } from "../../components/PageHeading";

export function DashboardPage() {
  const postsQuery = useQuery({ queryKey: ["posts", "all"], queryFn: () => postsApi.list() });
  const commentsQuery = useQuery({ queryKey: ["comments", "pending"], queryFn: () => postsApi.comments("pending") });
  const pubsQuery = useQuery({ queryKey: ["publications"], queryFn: () => publicationsApi.list() });
  const achsQuery = useQuery({ queryKey: ["achievements"], queryFn: () => achievementsApi.list() });
  const posts = postsQuery.data?.data ?? [];
  const published = posts.filter((post) => post.status === "published").length;
  const drafts = posts.filter((post) => post.status === "draft").length;
  const recent = [...posts].sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at)).slice(0, 5);
  return <div className="stack-xl">
    <PageHeading eyebrow="YOUR PORTFOLIO" title="Good morning" description="Here’s what’s happening with your writing." action={<Link className="button button-primary" to="/owner/posts/new"><Plus size={17} /> New article</Link>} />
    <section className="welcome-band"><div className="welcome-content"><span className="welcome-icon"><BookOpen size={18} /></span><div><p className="eyebrow">A NOTE FOR TODAY</p><h2>Capture your work. Put your ideas in the world.</h2><p>Scholarship shared openly advances conversation and builds your record.</p></div></div><Link to="/owner/posts/new" className="welcome-link">Start writing <ArrowUpRight size={16} /></Link><div className="band-stamp">WRITTEN<br />&nbsp;&nbsp;RECORD</div></section>
    <div className="stat-grid">
      <StatCard label="Published articles" value={postsQuery.isLoading ? "..." : String(published)} note="Visible on your website" icon={<FileText size={17} />} tone="green" />
      <StatCard label="Drafts in progress" value={postsQuery.isLoading ? "..." : String(drafts)} note="Only you can see these" icon={<PenLine size={17} />} tone="amber" />
      <StatCard label="Comments to review" value={commentsQuery.isLoading ? "..." : String(commentsQuery.data?.total ?? 0)} note="Awaiting your approval" icon={<MessageCircle size={17} />} tone="blue" link="/owner/comments" />
      <StatCard label="Publications" value={pubsQuery.isLoading ? "..." : String(pubsQuery.data?.total ?? pubsQuery.data?.data.length ?? 0)} note="Articles, books and chapters" icon={<BookMarked size={17} />} tone="green" link="/owner/publications" />
      <StatCard label="Achievements" value={achsQuery.isLoading ? "..." : String(achsQuery.data?.total ?? achsQuery.data?.data.length ?? 0)} note="Awards, grants and fellowships" icon={<Trophy size={17} />} tone="amber" link="/owner/achievements" />
    </div>
    <section className="content-section"><div className="section-heading"><div><h2>Recently updated</h2><p>Your latest writing, all in one place.</p></div><Link className="text-link" to="/owner/posts">All articles <ArrowUpRight size={15} /></Link></div>
      {postsQuery.isError ? <ErrorState message="Could not load articles." retry={() => postsQuery.refetch()} /> : recent.length ? <div className="article-list">{recent.map((post) => <OwnerPostRow key={post.id} post={post} />)}</div> : <EmptyState title="Your journal starts here" description="Create your first article when you’re ready to share an idea." action={<Link className="button button-primary button-small" to="/owner/posts/new"><Plus size={15} /> Write an article</Link>} />}
    </section>
    <section className="care-note"><ShieldCheck size={17} /><p><strong>A note on drafts</strong> Keep research in progress, unpublished manuscripts, and sensitive material in draft status until ready to share.</p><Link to="/owner/comments">Review pending comments <ArrowUpRight size={14} /></Link></section>
  </div>;
}

function StatCard({ label, value, note, icon, tone, link }: { label: string; value: string; note: string; icon: React.ReactNode; tone: string; link?: string }) {
  const content = <><div className="stat-top"><span>{label}</span><span className={`stat-icon ${tone}`}>{icon}</span></div><strong className="stat-value">{value}</strong><span className="stat-note">{note}</span></>;
  return link ? <Link className="stat-card stat-card-link" to={link}>{content}</Link> : <div className="stat-card">{content}</div>;
}