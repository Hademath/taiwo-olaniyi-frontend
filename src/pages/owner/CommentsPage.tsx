import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ShieldCheck, Trash2, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { postsApi } from "../../api";
import { ConfirmModal } from "../../components/ConfirmModal";
import { EmptyState, ErrorState, LoadingState } from "../../components/StateViews";
import { PageHeading } from "../../components/PageHeading";
import { StatusPill } from "../../components/StatusPill";
import { formatDate } from "../../lib/format";
import type { Comment } from "../../types";

export function CommentsPage() {
  const client = useQueryClient();
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const query = useQuery({ queryKey: ["comments", status], queryFn: () => postsApi.comments(status) });
  const update = useMutation({ mutationFn: ({ comment, next }: { comment: Comment; next: "approved" | "rejected" }) => postsApi.moderate(comment.id, next), onSuccess: (_, variables) => { toast.success(variables.next === "approved" ? "Comment approved" : "Comment hidden"); client.invalidateQueries({ queryKey: ["comments"] }); } });
  const remove = useMutation({
    mutationFn: postsApi.removeComment,
    onSuccess: () => { toast.success("Comment removed"); setConfirmId(null); client.invalidateQueries({ queryKey: ["comments"] }); },
  });
  const comments = query.data?.data ?? [];

  return (
    <div className="stack-xl">
      <ConfirmModal
        open={confirmId !== null}
        variant="danger"
        title="Remove this comment?"
        description="The comment will be permanently deleted and will no longer appear on your site."
        confirmLabel="Remove comment"
        isPending={remove.isPending}
        onConfirm={() => { if (confirmId) remove.mutate(confirmId); }}
        onCancel={() => setConfirmId(null)}
      />

      <PageHeading eyebrow="READER CONVERSATION" title="Comments" description="Review the conversation before it appears on your website." />
      <div className="comment-guidance"><ShieldCheck size={18} /><p><strong>Keep the conversation open and thoughtful.</strong> Approve comments that add to the discussion; hide or remove those that do not.</p></div>
      <div className="toolbar">
        <div className="segmented" role="tablist" aria-label="Filter comments">
          {(["pending", "approved", "rejected"] as const).map((value) => (
            <button key={value} role="tab" aria-selected={status === value} className={status === value ? "segment-active" : ""} onClick={() => setStatus(value)}>
              {value[0].toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>
        <span className="result-count">{query.data?.total ?? 0} comments</span>
      </div>

      {query.isError
        ? <ErrorState message="Could not load comments." retry={() => query.refetch()} />
        : query.isLoading
          ? <LoadingState />
          : comments.length
            ? <div className="comment-list">
                {comments.map((comment) => (
                  <article className="comment-item" key={comment.id}>
                    <div className="comment-avatar">{comment.author_name.slice(0, 1).toUpperCase()}</div>
                    <div className="comment-body">
                      <div className="comment-meta">
                        <strong>{comment.author_name}</strong>
                        <span>{formatDate(comment.created_at)}</span>
                        <StatusPill status={comment.status} />
                      </div>
                      <p>{comment.body}</p>
                      <Link to={`/owner/posts/${comment.post_id}/edit`} className="comment-post">On: {comment.post?.title ?? "Article"}</Link>
                      <div className="comment-actions">
                        {status !== "approved" && (
                          <button className="button button-soft button-small" disabled={update.isPending} onClick={() => update.mutate({ comment, next: "approved" })}>
                            <Check size={14} /> Approve
                          </button>
                        )}
                        {status !== "rejected" && (
                          <button className="button button-outline button-small" disabled={update.isPending} onClick={() => update.mutate({ comment, next: "rejected" })}>
                            <X size={14} /> Hide
                          </button>
                        )}
                        <button className="button button-quiet button-small danger-text" disabled={remove.isPending} onClick={() => setConfirmId(comment.id)}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            : <EmptyState
                title={status === "pending" ? "All caught up" : `No ${status} comments`}
                description={status === "pending" ? "New reader comments will appear here for your review." : "Comments in this section will appear here."}
              />}
    </div>
  );
}
