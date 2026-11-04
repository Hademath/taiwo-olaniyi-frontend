import { useQuery } from "@tanstack/react-query";
import { achievementsApi } from "../../api";
import { LoadingState } from "../../components/StateViews";
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

export function PublicAchievementsPage() {
  const query = useQuery({ queryKey: ["public-achievements"], queryFn: () => achievementsApi.publicList() });
  const items = query.data?.data ?? [];

  const byYear = items.reduce<Record<number | string, Achievement[]>>((acc, ach) => {
    const key = ach.year ?? "Undated";
    (acc[key] ??= []).push(ach);
    return acc;
  }, {});

  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  return (
    <main className="public-main">
      <div className="pub-page-wrap">
        <p className="public-kicker">RECOGNITION</p>
        <h1 className="pub-page-title">Achievements</h1>
        <p className="pub-page-desc">Awards, grants, fellowships, and other professional recognitions.</p>

        {query.isLoading
          ? <LoadingState>Loading achievements…</LoadingState>
          : query.isError
            ? <div className="public-empty"><p className="public-kicker">UNAVAILABLE</p><h3>Could not load achievements.</h3><p>{messageFor(query.error)}</p></div>
            : !items.length
              ? <div className="public-empty"><p className="public-kicker">COMING SOON</p><h3>Achievements will appear here.</h3></div>
              : years.map((year) => (
                  <div key={year} className="pub-year-block">
                    <div className="pub-year-heading">
                      <span className="pub-year-label">{year}</span>
                      <div className="pub-year-rule" />
                    </div>
                    <div className="pub-card-list">
                      {byYear[year].map((ach) => (
                        <div key={ach.id} className="ach-row">
                          <span className={`status-pill ${TYPE_TONES[ach.type]} ach-row-pill`}>{TYPE_LABELS[ach.type]}</span>
                          <div className="ach-row-body">
                            <p className="ach-row-title">{ach.title}</p>
                            {ach.institution && <p className="ach-row-institution">{ach.institution}</p>}
                            {ach.description && <p className="ach-row-desc">{ach.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
      </div>
    </main>
  );
}
