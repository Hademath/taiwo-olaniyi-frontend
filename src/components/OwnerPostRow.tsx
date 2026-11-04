import { ArrowUpRight, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import type { Post } from "../types";
import { formatDate } from "../lib/format";
import { StatusPill } from "./StatusPill";

export function OwnerPostRow({ post }: { post: Post }) {
  return <Link to={`/owner/posts/${post.id}/edit`} className="post-row"><span className={`post-thumb ${post.cover_image_url ? "has-image" : ""}`} style={post.cover_image_url ? { backgroundImage: `url(${post.cover_image_url})` } : undefined}>{!post.cover_image_url && <FileText size={20} />}</span><span className="post-row-copy"><strong>{post.title}</strong><small>{post.updated_at ? `Updated ${formatDate(post.updated_at)}` : "Not updated yet"}</small></span><StatusPill status={post.status} /><span className="row-arrow"><ArrowUpRight size={16} /></span></Link>;
}