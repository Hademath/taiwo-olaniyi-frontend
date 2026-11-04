import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, ArrowUpRight, Video } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { postsApi } from "../../api";
import { messageFor, formatDate, readingTime } from "../../lib/format";
import { LoadingState } from "../../components/StateViews";

const MarkdownBody = lazy(() => import("../../MarkdownBody"));

export function PublicArticlePage() {
  const { slug = "" } = useParams();
  const postQuery = useQuery({ queryKey: ["public-post", slug], queryFn: () => postsApi.publicGet(slug) });
  const commentsQuery = useQuery({ queryKey: ["public-comments", slug], queryFn: () => postsApi.publicComments(slug), enabled: postQuery.isSuccess });
  const client = useQueryClient();
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const commentMutation = useMutation({
    mutationFn: () => postsApi.submitPublicComment(slug, { author_name: authorName.trim(), author_email: authorEmail.trim() || undefined, body: commentBody.trim() }),
    onSuccess: () => { setAuthorName(""); setAuthorEmail(""); setCommentBody(""); toast.success("Your comment is awaiting review."); client.invalidateQueries({ queryKey: ["public-comments", slug] }); },
    onError: (error) => toast.error(messageFor(error)),
  });
  const post = postQuery.data;

  if (postQuery.isLoading) return <main className="public-main"><div className="public-loading"><LoadingState>Loading article…</LoadingState></div></main>;
  if (postQuery.isError || !post) return <main className="public-main"><div className="public-article-error"><p className="public-kicker">ARTICLE NOT FOUND</p><h1>This note may have moved.</h1><p>It may be unpublished, or the address may be incorrect.</p><Link className="public-read-link" to="/">Return to the portfolio <ArrowRight size={14} /></Link></div></main>;

  return <main className="public-main public-article-main">
    <div className="public-article-wrap"><Link to="/#writing" className="public-back-link"><ArrowLeft size={15} /> All writing</Link>
      <article className="public-article">
        <header className="public-article-header"><p className="public-kicker">SCHOLARLY WRITING</p><h1>{post.title}</h1>{post.excerpt && <p className="public-article-excerpt">{post.excerpt}</p>}<div className="public-article-meta"><span>The Written Record</span><i /><time dateTime={post.published_at ?? post.created_at}>{formatDate(post.published_at ?? post.created_at)}</time><i /><span>{readingTime(post.body)} minute read</span></div></header>
        {post.cover_image_url && <img className="public-article-cover" src={post.cover_image_url} alt={`Cover for ${post.title}`} />}
        <Suspense fallback={<div className="markdown-loading">Loading article…</div>}><MarkdownBody body={post.body} /></Suspense>
        {post.video_url && <a className="public-video-link" href={post.video_url} target="_blank" rel="noreferrer"><Video size={17} /> Watch the related video <ArrowUpRight size={14} /></a>}
      </article>
      <section className="reader-comments" aria-labelledby="reader-comments-title"><div className="reader-comments-heading"><p className="public-kicker">READER CONVERSATION</p><h2 id="reader-comments-title">Reader Responses</h2><p>Comments are reviewed before they appear. Please keep discussion thoughtful and constructive.</p></div>
        <form className="public-comment-form" onSubmit={(event) => { event.preventDefault(); commentMutation.mutate(); }}><div className="public-comment-fields"><label className="public-field">Your name<input required maxLength={120} value={authorName} onChange={(event) => setAuthorName(event.target.value)} placeholder="Name shown with your comment" /></label><label className="public-field">Email <span>optional, not displayed</span><input type="email" maxLength={255} value={authorEmail} onChange={(event) => setAuthorEmail(event.target.value)} placeholder="you@example.com" /></label></div><label className="public-field">Your comment<textarea required minLength={2} maxLength={2000} rows={4} value={commentBody} onChange={(event) => setCommentBody(event.target.value)} placeholder="Join the conversation thoughtfully…" /></label><div className="public-comment-submit"><span>Your comment appears after it has been reviewed.</span><button className="button button-primary" disabled={commentMutation.isPending || !authorName.trim() || !commentBody.trim()}>{commentMutation.isPending ? "Sending…" : "Submit comment"}<ArrowUpRight size={14} /></button></div></form>
        {commentsQuery.data?.data.length ? <div className="reader-comment-list">{commentsQuery.data.data.map((comment) => <article className="reader-comment" key={comment.id}><div className="reader-comment-avatar">{comment.author_name.slice(0, 1).toUpperCase()}</div><div><div className="reader-comment-meta"><strong>{comment.author_name}</strong><time>{formatDate(comment.created_at)}</time></div><p>{comment.body}</p></div></article>)}</div> : commentsQuery.isError ? <p className="public-comments-error">Comments are temporarily unavailable.</p> : <p className="no-reader-comments">Be the first to join the conversation.</p>}
      </section>
    </div>
  </main>;
}