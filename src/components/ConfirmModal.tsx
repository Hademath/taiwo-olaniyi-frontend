import { AlertTriangle, Trash2, X } from "lucide-react";

interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "danger" | "default";
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ open, title, description, confirmLabel = "Confirm", variant = "default", isPending, onConfirm, onCancel }: Props) {
  if (!open) return null;

  return (
    <>
      <div className="confirm-scrim" onClick={onCancel} />
      <div className="confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-desc">
        <div className="confirm-icon-wrap">
          <span className={`confirm-icon ${variant}`}>
            {variant === "danger" ? <Trash2 size={18} /> : <AlertTriangle size={18} />}
          </span>
        </div>
        <div className="confirm-body">
          <h3 id="confirm-title">{title}</h3>
          <p id="confirm-desc">{description}</p>
        </div>
        <div className="confirm-actions">
          <button className="button button-outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </button>
          <button
            className={`button ${variant === "danger" ? "button-danger" : "button-primary"}`}
            onClick={onConfirm}
            disabled={isPending}
            autoFocus
          >
            {isPending ? "Deleting…" : confirmLabel}
          </button>
        </div>
        <button className="confirm-close icon-button" aria-label="Close" onClick={onCancel}>
          <X size={15} />
        </button>
      </div>
    </>
  );
}
