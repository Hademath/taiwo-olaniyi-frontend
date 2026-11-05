import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowRight, ArrowUpRight, ExternalLink } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { achievementsApi, postsApi, publicationsApi, siteSettingsApi } from "../../api";
import { PublicPostCard } from "../../components/PublicPostCard";
import { LoadingState } from "../../components/StateViews";
import { messageFor } from "../../lib/format";
import type { Achievement, Publication } from "../../types";

const currentYear = new Date().getFullYear();

const PUB_LABELS: Record<Publication["type"], string> = {
  article: "Article", book: "Book", chapter: "Chapter",
  thesis: "Thesis", conference: "Conference", report: "Report",
};
const ACH_LABELS: Record<Achievement["type"], string> = {
  award: "Award", grant: "Grant", fellowship: "Fellowship",
  recognition: "Recognition", appointment: "Appointment",
};

export function PublicFeedPage() {
  const feed = useInfiniteQuery({
    queryKey: ["public-posts"],
    queryFn: ({ pageParam }) => postsApi.publicList(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.current_page < lastPage.last_page ? lastPage.current_page + 1 : undefined,
  });
  const pubsQuery = useQuery({ queryKey: ["public-publications-preview"], queryFn: () => publicationsApi.publicList(), staleTime: 60_000 });
  const achsQuery = useQuery({ queryKey: ["public-achievements-preview"], queryFn: () => achievementsApi.publicList(), staleTime: 60_000 });
  const settingsQuery = useQuery({ queryKey: ["public-site-settings"], queryFn: siteSettingsApi.publicGet, staleTime: 300_000 });

  const posts = feed.data?.pages.flatMap((page) => page.data) ?? [];
  const featured = posts[0];
  const settings = settingsQuery.data;
  const bannerImg = settings?.hero_image_url;
  const heroStyle = bannerImg
    ? { backgroundImage: `linear-gradient(90deg, rgb(15 25 60 / .88), rgb(15 25 60 / .44) 55%, rgb(15 25 60 / .1)), url("${bannerImg}")` }
    : undefined;

  const recentPubs = pubsQuery.data?.data.slice(0, 3) ?? [];
  const recentAchs = achsQuery.data?.data.slice(0, 4) ?? [];

  return (
    <main className="public-main">
      <Helmet>
        <title>The Written Record | Olaniyi Taiwo, PhD — Scholar in English Literature</title>
        <meta name="description" content="The scholarly portfolio of Olaniyi Taiwo, PhD — literary critic, essayist, and researcher in English literature, language studies, and literary theory. Essays, publications, and academic research." />
        <link rel="canonical" href="https://olaniyitaiwo.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://olaniyitaiwo.com/" />
      </Helmet>
      <section className={`public-hero ${bannerImg ? "public-hero-image" : ""}`} style={heroStyle}>
        <div className="public-hero-copy">
          <p className="public-kicker"><span /> AN ACADEMIC PORTFOLIO</p>
          <h1 dangerouslySetInnerHTML={{ __html: (settings?.hero_title ?? "Language, Literature, and the power of ideas.").replace(/\band\b/, "and<br />") }} />
          {settings?.hero_subtitle && <p>{settings.hero_subtitle}</p>}
          <a className="public-hero-link" href="#writing">{settings?.hero_cta ?? "Explore the portfolio"} <ArrowDown size={16} /></a>
        </div>
        {featured && (
          <Link to={`/articles/${featured.slug}`} className="public-featured-note">
            <span>LATEST WRITING</span>
            <strong>{featured.title}</strong>
            <small>{new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(featured.published_at ?? featured.created_at))} <ArrowUpRight size={13} /></small>
          </Link>
        )}
        <span className="hero-index">A PORTFOLIO IN PROGRESS <i /> {currentYear}</span>
      </section>

      {/* Writing */}
      <section className="public-feed-section" id="writing">
        <div className="public-section-heading">
          <div><p className="public-kicker">WRITING &amp; ESSAYS</p><h2>Recent writing</h2></div>
          <p>From the archive, the classroom, and the page.</p>
        </div>
        {feed.isError
          ? <PublicError message={messageFor(feed.error)} retry={() => feed.refetch()} />
          : feed.isLoading
            ? <div className="public-loading"><LoadingState>Loading the portfolio...</LoadingState></div>
            : posts.length
              ? <>
                  <div className="public-post-grid">{posts.map((post, index) => <PublicPostCard key={post.id} post={post} featured={index === 0} />)}</div>
                  {feed.hasNextPage && (
                    <div className="load-more-wrap">
                      <button className="public-load-more" disabled={feed.isFetchingNextPage} onClick={() => feed.fetchNextPage()}>
                        {feed.isFetchingNextPage ? "Loading..." : "More writing"}<ArrowDown size={15} />
                      </button>
                    </div>
                  )}
                </>
              : <div className="public-empty"><p className="public-kicker">WRITING COMING SOON</p><h3>A new portfolio begins here.</h3><p>New writing will appear here as it is published.</p></div>}
      </section>

      {/* Publications */}
      {(recentPubs.length > 0 || pubsQuery.isLoading) && (
        <section className="public-feed-section public-pubs-section">
          <div className="public-section-heading">
            <div><p className="public-kicker">RESEARCH</p><h2>Selected publications</h2></div>
            <Link to="/publications" className="public-section-link">All publications <ArrowUpRight size={14} /></Link>
          </div>
          {pubsQuery.isLoading
            ? <div className="public-loading"><LoadingState>Loading publications...</LoadingState></div>
            : <div className="pub-preview-list">
                {recentPubs.map((pub) => (
                  <div key={pub.id} className="pub-preview-row">
                    <div className="pub-preview-left">
                      <span className="pub-year">{pub.year ?? "n.d."}</span>
                      <div className="pub-preview-copy">
                        <strong>{pub.title}</strong>
                        {pub.publisher && <span>{pub.publisher}</span>}
                      </div>
                    </div>
                    <div className="pub-preview-right">
                      <span className="status-pill status-published">{PUB_LABELS[pub.type]}</span>
                      {pub.url && <a href={pub.url} target="_blank" rel="noreferrer" className="pub-ext-link" title="View publication"><ExternalLink size={13} /></a>}
                    </div>
                  </div>
                ))}
              </div>}
        </section>
      )}

      {/* Achievements */}
      {(recentAchs.length > 0 || achsQuery.isLoading) && (
        <section className="public-feed-section public-achs-section">
          <div className="public-section-heading">
            <div><p className="public-kicker">RECOGNITION</p><h2>Selected achievements</h2></div>
            <Link to="/achievements" className="public-section-link">All achievements <ArrowUpRight size={14} /></Link>
          </div>
          {achsQuery.isLoading
            ? <div className="public-loading"><LoadingState>Loading achievements...</LoadingState></div>
            : <div className="ach-preview-grid">
                {recentAchs.map((ach) => (
                  <div key={ach.id} className="ach-preview-card">
                    <div className="ach-preview-year">{ach.year ?? "n.d."}</div>
                    <strong>{ach.title}</strong>
                    {ach.institution && <span>{ach.institution}</span>}
                    <span className="status-pill status-approved" style={{ marginTop: 6 }}>{ACH_LABELS[ach.type]}</span>
                  </div>
                ))}
              </div>}
        </section>
      )}

      {/* About */}
      <section className="public-about" id="about">
        <p className="public-kicker">ABOUT THIS SITE</p>
        <h2>A space for curiosity,<br />language, and continued learning.</h2>
        <p>This site brings together writing and scholarship from a career in English literature. Essays, research notes, and reflections on language, texts, and ideas.</p>
      </section>
    </main>
  );
}

function PublicError({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div className="public-empty">
      <p className="public-kicker">UNAVAILABLE</p>
      <h3>We could not load the latest writing.</h3>
      <p>{message}</p>
      <button className="public-load-more" onClick={retry}>Try again <ArrowRight size={14} /></button>
    </div>
  );
}
