import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, FileText, ImagePlus, Paperclip, Send, ShieldCheck, Trash2, Video, X } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { postsApi } from "../../api";
import { ConfirmModal } from "../../components/ConfirmModal";
import { RichTextEditor } from "../../components/RichTextEditor";
import { ErrorState, LoadingState } from "../../components/StateViews";
import { messageFor } from "../../lib/format";
import type { Post, PostInput, PostStatus } from "../../types";

const MarkdownBody = lazy(() => import("../../MarkdownBody"));

export function PostEditorPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const query = useQuery({ queryKey: ["post", id], queryFn: () => postsApi.get(id!), enabled: editing });
  if (query.isError) return <ErrorState message={messageFor(query.error)} retry={() => query.refetch()} />;
  if (editing && query.isLoading) return <LoadingState />;
  return <EditorForm key={id ?? "new"} id={id} post={query.data} />;
}

function EditorForm({ id, post }: { id?: string; post?: Post }) {
  const editing = Boolean(id);
  const navigate = useNavigate();
  const client = useQueryClient();
  const [title, setTitle] = useState(post?.title ?? "");
  const [excerptText, setExcerptText] = useState(post?.excerpt ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [imageUrl, setImageUrl] = useState(post?.cover_image_url ?? "");
  const [videoUrl, setVideoUrl] = useState(post?.video_url ?? "");
  const [attachmentUrl, setAttachmentUrl] = useState(post?.attachment_url ?? "");
  const [attachmentName, setAttachmentName] = useState(post?.attachment_name ?? "");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [preview, setPreview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const mutation = useMutation({ mutationFn: (status: PostStatus) => {
    const data: PostInput = { title, excerpt: excerptText, body, cover_image_url: imageUrl || undefined, video_url: videoUrl || undefined, attachment_url: (!attachmentFile && attachmentUrl) ? attachmentUrl : undefined, attachment_name: attachmentName || undefined, status };
    if (coverImage || attachmentFile) {
      const form = new FormData();
      Object.entries(data).forEach(([key, value]) => { if (value !== undefined) form.append(key, String(value)); });
      if (coverImage) form.append("cover_image", coverImage);
      if (attachmentFile) form.append("attachment", attachmentFile);
      return editing ? postsApi.update(id!, form) : postsApi.create(form);
    }
    return editing ? postsApi.update(id!, data) : postsApi.create(data);
  }, onSuccess: (savedPost) => { toast.success(mutation.variables === "published" ? "Article published" : "Draft saved"); client.invalidateQueries({ queryKey: ["posts"] }); client.invalidateQueries({ queryKey: ["post", savedPost.id] }); navigate("/owner/posts"); }, onError: (error) => toast.error(messageFor(error)) });
  const deleteMutation = useMutation({ mutationFn: () => postsApi.remove(id!), onSuccess: () => { toast.success("Article deleted"); client.invalidateQueries({ queryKey: ["posts"] }); navigate("/owner/posts"); }, onError: (error) => toast.error(messageFor(error)) });
  const hasContent = Boolean(title.trim() && body.trim());

  return <div className="editor-page stack-lg">
    <ConfirmModal
      open={showDeleteConfirm}
      variant="danger"
      title="Delete this article?"
      description="This action cannot be undone. The article and all its reader comments will be permanently removed."
      confirmLabel="Delete article"
      isPending={deleteMutation.isPending}
      onConfirm={() => { setShowDeleteConfirm(false); deleteMutation.mutate(); }}
      onCancel={() => setShowDeleteConfirm(false)}
    />
    <div className="editor-topline"><Link to="/owner/posts" className="back-link"><ArrowLeft size={16} /> All articles</Link><span className="editor-separator">/</span><span>{editing ? "Edit article" : "New article"}</span><div className="editor-actions"><button className="button button-quiet" type="button" onClick={() => setPreview(!preview)}>{preview ? "Edit" : "Preview"}</button><button className="button button-outline" type="button" disabled={!hasContent || mutation.isPending} onClick={() => mutation.mutate("draft")}>Save draft</button><button className="button button-primary" type="button" disabled={!hasContent || mutation.isPending} onClick={() => mutation.mutate("published")}><Send size={15} /> {mutation.isPending ? "Saving…" : "Publish"}</button><button className="icon-button danger-quiet" aria-label="Delete article" title="Delete article" disabled={!editing || deleteMutation.isPending} onClick={() => setShowDeleteConfirm(true)}><Trash2 size={16} /></button></div></div>
    <div className="editor-layout"><section className="editor-main">{preview ? <article className="preview-article"><p className="eyebrow">ARTICLE PREVIEW</p><h1>{title || "Untitled article"}</h1>{excerptText && <p className="preview-excerpt">{excerptText}</p>}{imageUrl && <img className="preview-cover" src={imageUrl} alt="Article cover" />}<Suspense fallback={null}><MarkdownBody body={body} /></Suspense>{(attachmentUrl || attachmentFile) && (<div className="article-attachment-block"><FileText size={18} /><div><strong>{attachmentName || attachmentFile?.name || "Attachment"}</strong><small>Attachment preview — available on published article</small></div></div>)}</article> : <><input className="title-input" aria-label="Article title" placeholder="A clear, thoughtful title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={255} /><textarea className="excerpt-input" aria-label="Article summary" placeholder="A short introduction for the feed (optional)" value={excerptText} onChange={(event) => setExcerptText(event.target.value)} rows={2} maxLength={3000} /><div className="editor-divider" /><p className="body-label">YOUR ARTICLE <span>Rich text supported</span></p><RichTextEditor value={body} onChange={setBody} placeholder="Begin with the idea you want readers to take away…" /></>}</section>
      <aside className="editor-aside">
        <div className="aside-card"><h3>Cover image</h3><p>Give your article a visual starting point.</p><label className="upload-zone">{coverImage ? <div className="file-selected"><Check size={17} /><span>{coverImage.name}</span></div> : imageUrl ? <div className="image-preview" style={{ backgroundImage: `url(${imageUrl})` }}><span>Change image</span></div> : <><ImagePlus size={22} /><span>Choose an image</span><small>JPEG, PNG or WebP, up to 100 MB</small></>}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setCoverImage(event.target.files?.[0] ?? null)} /></label><label className="field-label compact-label">Or paste an image URL<input type="url" placeholder="https://…" value={imageUrl} onChange={(event) => { setImageUrl(event.target.value); setCoverImage(null); }} /></label></div>
        <div className="aside-card"><h3>Video</h3><p>Add an occasional video from an approved host.</p><label className="field-label compact-label"><span className="input-with-icon"><Video size={15} /><input type="url" placeholder="Video URL" value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} /></span></label></div>
        <div className="aside-card">
          <h3>Attachment</h3>
          <p>Upload a PDF or document that readers can view and download.</p>
          {(attachmentFile || attachmentUrl) ? (
            <div className="attachment-preview-card">
              <FileText size={20} />
              <div className="attachment-preview-info">
                <strong>{attachmentName || attachmentFile?.name || "Attachment"}</strong>
                {attachmentFile && <small>{attachmentFile.name}</small>}
                {!attachmentFile && attachmentUrl && <small className="attachment-url-short">{attachmentUrl.split("/").pop()}</small>}
              </div>
              <button type="button" className="icon-button" title="Remove attachment" onClick={() => { setAttachmentFile(null); setAttachmentUrl(""); setAttachmentName(""); }}><X size={14} /></button>
            </div>
          ) : (
            <label className="upload-zone">
              <Paperclip size={20} />
              <span>Choose a file</span>
              <small>PDF, Word, Excel, PowerPoint, ZIP — up to 100 MB</small>
              <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt" onChange={(event) => { const f = event.target.files?.[0] ?? null; setAttachmentFile(f); if (f && !attachmentName) setAttachmentName(f.name); }} />
            </label>
          )}
          <label className="field-label compact-label" style={{ marginTop: 8 }}>
            Label (shown to readers)
            <input type="text" placeholder="e.g. Research Paper PDF" value={attachmentName} onChange={(event) => setAttachmentName(event.target.value)} maxLength={255} />
          </label>
          {!attachmentFile && (
            <label className="field-label compact-label">
              Or paste a file URL
              <input type="url" placeholder="https://…" value={attachmentUrl} onChange={(event) => setAttachmentUrl(event.target.value)} />
            </label>
          )}
        </div>
        <div className="privacy-card"><ShieldCheck size={17} /><div><strong>Before publishing</strong><p>Review citations and attributions before publishing. Comments are moderated before they appear.</p></div></div>
      </aside></div>
  </div>;
}