import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { publicationsApi } from "../../api";
import { LoadingState } from "../../components/StateViews";
import { messageFor } from "../../lib/format";
import type { Publication } from "../../types";

const TYPE_LABELS: Record<Publication["type"], string> = {
  article: "Article", book: "Book", chapter: "Book Chapter",
  thesis: "Thesis", conference: "Conference", report: "Report",
};

export function PublicPublicationsPage() {
  const query = useQuery({ queryKey: ["public-publications"], queryFn: () => publicationsApi.publicList() });
  const items = query.data?.data ?? [];

  const byYear = items.reduce<Record<number | string, Publication[]>>((acc, pub) => {
    const key = pub.year ?? "Undated";
    (acc[key] ??= []).push(pub);
    return acc;
  }, {});

  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  return (
    <main className="public-main">
      <div className="pub-page-wrap">
        <p className="public-kicker">RESEARCH</p>
        <h1 className="pub-page-title">Publications</h1>
        <p className="pub-page-desc">Peer-reviewed articles, books, chapters, and other scholarly outputs.</p>

        {query.isLoading
          ? <LoadingState>Loading publications…</LoadingState>
          : query.isError
            ? <div className="public-empty"><p className="public-kicker">UNAVAILABLE</p><h3>Could not load publications.</h3><p>{messageFor(query.error)}</p></div>
            : !items.length
              ? <div className="public-empty"><p className="public-kicker">COMING SOON</p><h3>Publications will appear here.</h3></div>
              : years.map((year) => (
                  <div key={year} className="pub-year-block">
                    <div className="pub-year-heading">
                      <span className="pub-year-label">{year}</span>
                      <div className="pub-year-rule" />
                    </div>
                    <div className="pub-card-list">
                      {byYear[year].map((pub) => <PublicationCard key={pub.id} pub={pub} />)}
                    </div>
                  </div>
                ))}
      </div>
    </main>
  );
}

function PublicationCard({ pub }: { pub: Publication }) {
  return (
    <div className="pub-card">
      <div className="pub-card-inner">
        <div className="pub-card-body">
          <div className="pub-card-top">
            <span className="status-pill status-published">{TYPE_LABELS[pub.type]}</span>
          </div>
          <p className="pub-card-title">{pub.title}</p>
          {pub.publisher && <p className="pub-card-publisher">{pub.publisher}</p>}
          {pub.abstract && <p className="pub-card-abstract">{pub.abstract}</p>}
        </div>
        {pub.url && (
          <a href={pub.url} target="_blank" rel="noreferrer" className="button button-outline button-small pub-card-link">
            View <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
}
