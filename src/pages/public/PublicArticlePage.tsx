import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Download, FileText, Share2, Video } from "lucide-react";
import { lazy, Suspense, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { postsApi } from "../../api";
import { LoadingState } from "../../components/StateViews";
import { firstImageSrc, formatDate, messageFor, metaDescription, readingTime } from "../../lib/format";
import type { Post } from "../../types";

const SITE_URL = "https://olaniyitaiwo.com";
const DEFAULT_OG = `${SITE_URL}/og-default.jpg`;

const MarkdownBody = lazy(() => import("../../MarkdownBody"));

function getVideoEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "www.youtube.com" || u.hostname === "youtube.com") {
      const id = u.searchParams.get("v");
      if (!id) return null;
      const start = u.searchParams.get("t")?.replace(/\D/g, "");
      return `https://www.youtube.com/embed/${id}${start ? `?start=${start}` : ""}`;
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1);
      if (!id) return null;
      const start = u.searchParams.get("t")?.replace(/\D/g, "");
      return `https://www.youtube.com/embed/${id}${start ? `?start=${start}` : ""}`;
    }
    if (u.hostname === "vimeo.com" || u.hostname === "www.vimeo.com") {
      const id = u.pathname.replace(/\//g, "");
      if (!id) return null;
      return `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    // invalid URL
  }
  return null;
}

function MoreArticlesList({ posts }: { posts: Post[] }) {
  if (!posts.length) return null;
  return (
    <ul className="more-articles-list">
      {posts.map((p) => (
        <li key={p.id}>
          <Link to={`/articles/${p.slug}`} className="more-article-item">
            {p.cover_image_url && (
              <div className="more-article-thumb" style={{ backgroundImage: `url(${p.cover_image_url})` }} />
            )}
            <div className="more-article-copy">
              <strong>{p.title}</strong>
              <time>{formatDate(p.published_at ?? p.created_at)}</time>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function PublicArticlePage() {
  const { slug = "" } = useParams();
  const postQuery = useQuery({ queryKey: ["public-post", slug], queryFn: () => postsApi.publicGet(slug) });
  const commentsQuery = useQuery({ queryKey: ["public-comments", slug], queryFn: () => postsApi.publicComments(slug), enabled: postQuery.isSuccess });
  const moreQuery = useQuery({ queryKey: ["public-posts-more"], queryFn: () => postsApi.publicList(1), staleTime: 120_000 });
  const client = useQueryClient();
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [copied, setCopied] = useState(false);
  const commentMutation = useMutation({
    mutationFn: () => postsApi.submitPublicComment(slug, { author_name: authorName.trim(), author_email: authorEmail.trim() || undefined, body: commentBody.trim() }),
    onSuccess: () => {
      setAuthorName(""); setAuthorEmail(""); setCommentBody("");
      toast.success("Your comment is awaiting review.");
      client.invalidateQueries({ queryKey: ["public-comments", slug] });
    },
    onError: (error) => toast.error(messageFor(error)),
  });

  const post = postQuery.data;
  const morePosts = (moreQuery.data?.data ?? []).filter((p) => p.slug !== slug).slice(0, 5);
  const ogDesc  = metaDescription(post?.excerpt ?? post?.body ?? "");
  const ogUrl   = `${SITE_URL}/articles/${post?.slug ?? slug}`;

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try { await navigator.share({ title: post?.title ?? "", text: ogDesc, url: ogUrl }); return; } catch { /* fall through */ }
    }
    await navigator.clipboard.writeText(ogUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [post?.title, ogDesc, ogUrl]);

  if (postQuery.isLoading) return (
    <main className="public-main"><div className="public-loading"><LoadingState>Loading article…</LoadingState></div></main>
  );
  if (postQuery.isError || !post) return (
    <main className="public-main">
      <div className="public-article-error">
        <p className="public-kicker">ARTICLE NOT FOUND</p>
        <h1>This note may have moved.</h1>
        <p>It may be unpublished, or the address may be incorrect.</p>
        <Link className="public-read-link" to="/">Return to the portfolio <ArrowRight size={14} /></Link>
      </div>
    </main>
  );

  const ogImage = post.cover_image_url ?? firstImageSrc(post.body) ?? DEFAULT_OG;
  const pubDate = post.published_at ?? post.created_at;

  const articleJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": ogDesc,
    "image": ogImage,
    "url": ogUrl,
    "datePublished": pubDate,
    "dateModified": post.updated_at,
    "author": {
      "@type": "Person",
      "name": "Olaniyi Taiwo, PhD",
      "url": SITE_URL,
    },
    "publisher": {
      "@type": "Organization",
      "name": "The Written Record",
      "url": SITE_URL,
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": ogUrl },
  });

  return (
    <main className="public-main public-article-main">
      <Helmet>
        <title>{post.title} | The Written Record — Olaniyi Taiwo, PhD</title>
        <meta name="description" content={ogDesc} />
        <link rel="canonical" href={ogUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={ogUrl} />
        <meta property="og:title" content={`${post.title} | Olaniyi Taiwo, PhD`} />
        <meta property="og:description" content={ogDesc} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:alt" content={post.title} />
        <meta property="og:site_name" content="The Written Record" />
        <meta property="article:author" content="Olaniyi Taiwo, PhD" />
        <meta property="article:published_time" content={pubDate} />

        {/* Twitter / X */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${post.title} | Olaniyi Taiwo, PhD`} />
        <meta name="twitter:description" content={ogDesc} />
        <meta name="twitter:image" content={ogImage} />

        {/* Article JSON-LD */}
        <script type="application/ld+json">{articleJsonLd}</script>
      </Helmet>

      <div className="public-article-outer">
        <Link to="/#writing" className="public-back-link"><ArrowLeft size={15} /> All writing</Link>

        <div className="public-article-layout">
          {/* ── Primary column ── */}
          <div className="public-article-primary">
            <article className="public-article">
              <header className="public-article-header">
                <p className="public-kicker">SCHOLARLY WRITING</p>
                <h1>{post.title}</h1>
                {post.excerpt && <p className="public-article-excerpt">{post.excerpt}</p>}
                <div className="public-article-meta">
                  <span>The Written Record</span><i />
                  <time dateTime={post.published_at ?? post.created_at}>{formatDate(post.published_at ?? post.created_at)}</time>
                  <i /><span>{readingTime(post.body)} minute read</span>
                  <button className="article-share-btn" title="Share this article" onClick={handleShare}>
                    {copied ? <><Check size={13} /> Copied</> : <><Share2 size={13} /> Share</>}
                  </button>
                </div>
              </header>
              {post.cover_image_url && <img className="public-article-cover" src={post.cover_image_url} alt={`Cover for ${post.title}`} />}
              <Suspense fallback={<div className="markdown-loading">Loading article…</div>}>
                <MarkdownBody body={post.body} />
              </Suspense>
              {post.video_url && (() => {
                const embedSrc = getVideoEmbed(post.video_url);
                return embedSrc
                  ? <div className="public-video-embed"><iframe src={embedSrc} title="Related video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>
                  : <a className="public-video-link" href={post.video_url} target="_blank" rel="noreferrer"><Video size={17} /> Watch the related video <ArrowUpRight size={14} /></a>;
              })()}
              {post.attachment_url && (
                <div className="public-attachment-block">
                  <div className="public-attachment-header">
                    <FileText size={20} />
                    <div>
                      <strong>{post.attachment_name || "Attachment"}</strong>
                      <span>Download or view the attached document</span>
                    </div>
                    <a href={post.attachment_url} target="_blank" rel="noreferrer" download className="button button-outline button-small">
                      <Download size={14} /> Download
                    </a>
                  </div>
                  {post.attachment_url.toLowerCase().endsWith(".pdf") && (
                    <div className="public-pdf-viewer">
                      <iframe src={`${post.attachment_url}#toolbar=1&view=FitH`} title={post.attachment_name ?? "Attachment"} />
                    </div>
                  )}
                </div>
              )}
            </article>

            <section className="reader-comments" aria-labelledby="reader-comments-title">
              <div className="reader-comments-heading">
                <p className="public-kicker">READER CONVERSATION</p>
                <h2 id="reader-comments-title">Reader Responses</h2>
                <p>Comments are reviewed before they appear. Please keep discussion thoughtful and constructive.</p>
              </div>
              <form className="public-comment-form" onSubmit={(event) => { event.preventDefault(); commentMutation.mutate(); }}>
                <div className="public-comment-fields">
                  <label className="public-field">Your name<input required maxLength={120} value={authorName} onChange={(event) => setAuthorName(event.target.value)} placeholder="Name shown with your comment" /></label>
                  <label className="public-field">Email <span>optional, not displayed</span><input type="email" maxLength={255} value={authorEmail} onChange={(event) => setAuthorEmail(event.target.value)} placeholder="you@example.com" /></label>
                </div>
                <label className="public-field">Your comment<textarea required minLength={2} maxLength={2000} rows={4} value={commentBody} onChange={(event) => setCommentBody(event.target.value)} placeholder="Join the conversation thoughtfully…" /></label>
                <div className="public-comment-submit">
                  <span>Your comment appears after it has been reviewed.</span>
                  <button className="button button-primary" disabled={commentMutation.isPending || !authorName.trim() || !commentBody.trim()}>
                    {commentMutation.isPending ? "Sending…" : "Submit comment"}<ArrowUpRight size={14} />
                  </button>
                </div>
              </form>
              {commentsQuery.data?.data.length
                ? <div className="reader-comment-list">
                    {commentsQuery.data.data.map((comment) => (
                      <article className="reader-comment" key={comment.id}>
                        <div className="reader-comment-avatar">{comment.author_name.slice(0, 1).toUpperCase()}</div>
                        <div>
                          <div className="reader-comment-meta"><strong>{comment.author_name}</strong><time>{formatDate(comment.created_at)}</time></div>
                          <p>{comment.body}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                : commentsQuery.isError
                  ? <p className="public-comments-error">Comments are temporarily unavailable.</p>
                  : <p className="no-reader-comments">Be the first to join the conversation.</p>
              }
            </section>

            {/* Mobile-only: more reading below comments */}
            {morePosts.length > 0 && (
              <div className="more-articles-inline">
                <div className="more-articles-heading">
                  <p className="public-kicker">MORE READING</p>
                  <h3>Continue reading</h3>
                </div>
                <MoreArticlesList posts={morePosts} />
              </div>
            )}
          </div>

          {/* ── Sticky sidebar (desktop only) ── */}
          {morePosts.length > 0 && (
            <aside className="more-articles-sidebar">
              <div className="more-articles-heading">
                <p className="public-kicker">MORE READING</p>
                <h3>Continue reading</h3>
              </div>
              <MoreArticlesList posts={morePosts} />
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}
