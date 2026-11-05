import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { publicationsApi } from "../../api";
import { RichTextEditor } from "../../components/RichTextEditor";
import { messageFor } from "../../lib/format";
import type { PublicationInput, PublicationType, PublicationStatus } from "../../types";

const MarkdownBody = lazy(() => import("../../MarkdownBody"));

const TYPES: { value: PublicationType; label: string }[] = [
  { value: "article", label: "Journal Article" },
  { value: "book", label: "Book" },
  { value: "chapter", label: "Book Chapter" },
  { value: "thesis", label: "Thesis / Dissertation" },
  { value: "conference", label: "Conference Paper" },
  { value: "report", label: "Report / Working Paper" },
];

export function PublicationEditorPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const client = useQueryClient();

  const existing = useQuery({ queryKey: ["publication", id], queryFn: () => publicationsApi.get(id!), enabled: isEdit });

  const [title, setTitle] = useState("");
  const [type, setType] = useState<PublicationType>("article");
  const [publisher, setPublisher] = useState("");
  const [year, setYear] = useState("");
  const [url, setUrl] = useState("");
  const [abstract, setAbstract] = useState("");
  const [status, setStatus] = useState<PublicationStatus>("published");
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (existing.data) {
      setTitle(existing.data.title);
      setType(existing.data.type);
      setPublisher(existing.data.publisher ?? "");
      setYear(existing.data.year ? String(existing.data.year) : "");
      setUrl(existing.data.url ?? "");
      setAbstract(existing.data.abstract ?? "");
      setStatus(existing.data.status ?? "published");
    }
  }, [existing.data]);

  const save = useMutation({
    mutationFn: () => {
      const input: PublicationInput = {
        title: title.trim(),
        type,
        publisher: publisher.trim() || undefined,
        year: year ? Number(year) : null,
        url: url.trim() || undefined,
        abstract: abstract.trim() || undefined,
        status,
      };
      return isEdit ? publicationsApi.update(id!, input) : publicationsApi.create(input);
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["publications"] });
      toast.success(isEdit ? "Publication updated." : "Publication added.");
      navigate("/owner/publications");
    },
    onError: (error) => toast.error(messageFor(error)),
  });

  if (isEdit && existing.isLoading) return <div className="loading-state"><span className="spinner" /> Loading…</div>;

  return (
    <div className="stack-lg">
      <div className="editor-topline">
        <Link to="/owner/publications" className="back-link"><ArrowLeft size={15} /> Publications</Link>
        <span className="editor-separator">/</span>
        <span>{isEdit ? "Edit publication" : "Add publication"}</span>
        <div className="editor-actions">
          <button className="button button-quiet" type="button" onClick={() => setPreview(!preview)}>
            {preview ? "Edit" : "Preview"}
          </button>
          <Link to="/owner/publications" className="button button-outline button-small">Cancel</Link>
          <button className="button button-primary button-small" disabled={save.isPending || !title.trim()} onClick={() => save.mutate()}>
            {save.isPending ? "Saving…" : isEdit ? "Save changes" : "Add publication"}
          </button>
        </div>
      </div>

      <div className="editor-layout" style={{ gridTemplateColumns: "minmax(0, 1fr) 240px" }}>
        {preview ? (
          <div className="preview-article">
            <p className="eyebrow">PUBLICATION PREVIEW</p>
            <h1>{title || "Untitled publication"}</h1>
            {publisher && <p className="preview-publisher">{publisher}{year ? `, ${year}` : ""}</p>}
            {url && <a href={url} target="_blank" rel="noreferrer" className="preview-pub-link"><ExternalLink size={14} /> View publication</a>}
            {abstract && <Suspense fallback={null}><MarkdownBody body={abstract} /></Suspense>}
          </div>
        ) : (
          <div className="editor-main">
            <label className="field-label" style={{ marginBottom: 16 }}>
              Title
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Full title of the work" required />
            </label>
            <div style={{ marginBottom: 16 }}>
              <p className="body-label">ABSTRACT / DESCRIPTION <span>Rich text supported</span></p>
              <div className="compact-editor">
                <RichTextEditor value={abstract} onChange={setAbstract} placeholder="Brief abstract or description of this work…" />
              </div>
            </div>
            <label className="field-label">
              URL
              <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://doi.org/…" />
            </label>
          </div>
        )}

        <div className="editor-aside">
          <div className="aside-card">
            <h3>Visibility</h3>
            <div className="segmented" role="group" aria-label="Publication status" style={{ width: "100%" }}>
              <button
                type="button"
                role="radio"
                aria-checked={status === "published"}
                className={status === "published" ? "segment-active" : ""}
                style={{ flex: 1 }}
                onClick={() => setStatus("published")}
              >
                Published
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={status === "draft"}
                className={status === "draft" ? "segment-active" : ""}
                style={{ flex: 1 }}
                onClick={() => setStatus("draft")}
              >
                Draft
              </button>
            </div>
            <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: 9 }}>
              {status === "published" ? "Visible to everyone on your site." : "Only visible to you."}
            </p>
          </div>

          <div className="aside-card">
            <h3>Details</h3>
            <label className="field-label compact-label">
              Type
              <select value={type} onChange={(e) => setType(e.target.value as PublicationType)} className="field-select">
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </label>
            <label className="field-label compact-label">
              Publisher / Venue
              <input value={publisher} onChange={(e) => setPublisher(e.target.value)} placeholder="Journal, press, conference…" />
            </label>
            <label className="field-label compact-label">
              Year
              <input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder={String(new Date().getFullYear())} min={1900} max={2100} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
