import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { achievementsApi } from "../../api";
import { RichTextEditor } from "../../components/RichTextEditor";
import { messageFor } from "../../lib/format";
import type { AchievementInput, AchievementType } from "../../types";

const MarkdownBody = lazy(() => import("../../MarkdownBody"));

const TYPES: { value: AchievementType; label: string }[] = [
  { value: "award", label: "Award" },
  { value: "grant", label: "Grant" },
  { value: "fellowship", label: "Fellowship" },
  { value: "recognition", label: "Recognition" },
  { value: "appointment", label: "Appointment" },
];

export function AchievementEditorPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const client = useQueryClient();

  const existing = useQuery({ queryKey: ["achievement", id], queryFn: () => achievementsApi.get(id!), enabled: isEdit });

  const [title, setTitle] = useState("");
  const [type, setType] = useState<AchievementType>("award");
  const [institution, setInstitution] = useState("");
  const [year, setYear] = useState("");
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (existing.data) {
      setTitle(existing.data.title);
      setType(existing.data.type);
      setInstitution(existing.data.institution ?? "");
      setYear(existing.data.year ? String(existing.data.year) : "");
      setDescription(existing.data.description ?? "");
    }
  }, [existing.data]);

  const save = useMutation({
    mutationFn: () => {
      const input: AchievementInput = {
        title: title.trim(),
        type,
        institution: institution.trim() || undefined,
        year: year ? Number(year) : null,
        description: description.trim() || undefined,
      };
      return isEdit ? achievementsApi.update(id!, input) : achievementsApi.create(input);
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["achievements"] });
      toast.success(isEdit ? "Achievement updated." : "Achievement added.");
      navigate("/owner/achievements");
    },
    onError: (error) => toast.error(messageFor(error)),
  });

  if (isEdit && existing.isLoading) return <div className="loading-state"><span className="spinner" /> Loading…</div>;

  return (
    <div className="stack-lg">
      <div className="editor-topline">
        <Link to="/owner/achievements" className="back-link"><ArrowLeft size={15} /> Achievements</Link>
        <span className="editor-separator">/</span>
        <span>{isEdit ? "Edit achievement" : "Add achievement"}</span>
        <div className="editor-actions">
          <button className="button button-quiet" type="button" onClick={() => setPreview(!preview)}>
            {preview ? "Edit" : "Preview"}
          </button>
          <Link to="/owner/achievements" className="button button-outline button-small">Cancel</Link>
          <button className="button button-primary button-small" disabled={save.isPending || !title.trim()} onClick={() => save.mutate()}>
            {save.isPending ? "Saving…" : isEdit ? "Save changes" : "Add achievement"}
          </button>
        </div>
      </div>

      <div className="editor-layout" style={{ gridTemplateColumns: "minmax(0, 1fr) 240px" }}>
        {preview ? (
          <div className="preview-article">
            <p className="eyebrow">ACHIEVEMENT PREVIEW</p>
            <h1>{title || "Untitled achievement"}</h1>
            {institution && <p className="preview-publisher">{institution}{year ? `, ${year}` : ""}</p>}
            {description && <Suspense fallback={null}><MarkdownBody body={description} /></Suspense>}
          </div>
        ) : (
          <div className="editor-main">
            <label className="field-label" style={{ marginBottom: 16 }}>
              Title
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Name of the award, grant, or fellowship" required />
            </label>
            <div>
              <p className="body-label">DESCRIPTION <span>Rich text supported</span></p>
              <div className="compact-editor">
                <RichTextEditor value={description} onChange={setDescription} placeholder="Brief description of this achievement…" />
              </div>
            </div>
          </div>
        )}

        <div className="editor-aside">
          <div className="aside-card">
            <h3>Details</h3>
            <label className="field-label compact-label">
              Type
              <select value={type} onChange={(e) => setType(e.target.value as AchievementType)} className="field-select">
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </label>
            <label className="field-label compact-label">
              Awarding Institution
              <input value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="University, foundation…" />
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
