import { ArrowRight, CalendarDays, Feather } from "lucide-react";
import { Link } from "react-router-dom";
import type { Post } from "../types";
import { formatDate, readingTime } from "../lib/format";

export function PublicPostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  return <article className={`public-post-card ${featured ? "public-post-featured" : ""}`}>
    <Link to={`/articles/${post.slug}`} className="public-post-image" aria-label={`Read ${post.title}`}>
      {post.cover_image_url ? <img src={post.cover_image_url} alt="" loading="lazy" /> : <span className="post-art"><Feather size={22} /><span>WRITTEN RECORD</span></span>}
    </Link>
    <div className="public-post-copy"><p className="public-post-date"><CalendarDays size={13} /> {formatDate(post.published_at ?? post.created_at)} <span>·</span> {readingTime(post.body)} min read</p><h3><Link to={`/articles/${post.slug}`}>{post.title}</Link></h3>{post.excerpt && <p className="public-post-excerpt">{post.excerpt}</p>}<Link className="public-read-link" to={`/articles/${post.slug}`}>Read article <ArrowRight size={14} /></Link></div>
  </article>;
}