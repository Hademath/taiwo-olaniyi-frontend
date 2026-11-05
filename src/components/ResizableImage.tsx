import Image from "@tiptap/extension-image";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { AlignCenter, AlignLeft, AlignRight, Trash2 } from "lucide-react";
import { useCallback, useRef } from "react";

function ResizableImageView({ node, updateAttributes, selected, deleteNode }: NodeViewProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const { src, alt, title, width, align } = node.attrs as {
    src: string;
    alt: string | null;
    title: string | null;
    width: string | null;
    align: "left" | "center" | "right";
  };

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const img = imgRef.current;
      if (!img) return;

      const startX = e.clientX;
      const startW = img.offsetWidth;
      const container = img.closest(".rich-editor-content") as HTMLElement | null;
      const containerW = container?.offsetWidth ?? 640;

      const onMove = (ev: MouseEvent) => {
        const dx = ev.clientX - startX;
        const pct = Math.round(Math.min(100, Math.max(10, ((startW + dx) / containerW) * 100)));
        updateAttributes({ width: `${pct}%` });
      };

      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [updateAttributes],
  );

  const justifyContent =
    align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center";

  return (
    <NodeViewWrapper
      className={`image-node-wrap${selected ? " image-node-selected" : ""}`}
      style={{ display: "flex", justifyContent, margin: "1.4em 0" }}
    >
      <div
        className="image-inner"
        style={{ position: "relative", display: "inline-block", maxWidth: "100%", lineHeight: 0 }}
      >
        {selected && (
          <div className="image-inline-toolbar" contentEditable={false}>
            <button
              type="button"
              title="Align left"
              className={align === "left" ? "active" : ""}
              onMouseDown={(e) => { e.preventDefault(); updateAttributes({ align: "left" }); }}
            >
              <AlignLeft size={13} />
            </button>
            <button
              type="button"
              title="Align center"
              className={align === "center" || !align ? "active" : ""}
              onMouseDown={(e) => { e.preventDefault(); updateAttributes({ align: "center" }); }}
            >
              <AlignCenter size={13} />
            </button>
            <button
              type="button"
              title="Align right"
              className={align === "right" ? "active" : ""}
              onMouseDown={(e) => { e.preventDefault(); updateAttributes({ align: "right" }); }}
            >
              <AlignRight size={13} />
            </button>
            <div className="image-toolbar-sep" />
            <button
              type="button"
              title="Remove image"
              onMouseDown={(e) => { e.preventDefault(); deleteNode(); }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}

        <img
          ref={imgRef}
          src={src}
          alt={alt ?? ""}
          title={title ?? ""}
          draggable={false}
          data-align={align ?? "center"}
          style={{
            display: "block",
            width: width ?? "100%",
            maxWidth: "100%",
            borderRadius: 6,
            cursor: "default",
          }}
        />

        {selected && (
          <div className="image-resize-handle" onMouseDown={handleResizeStart}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 8L8 8L8 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

export const ResizableImageExtension = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el) => el.style.width || el.getAttribute("width") || null,
        renderHTML: (attrs) => (attrs.width ? { style: `width: ${attrs.width}` } : {}),
      },
      align: {
        default: "center",
        parseHTML: (el) => (el.getAttribute("data-align") as string) || "center",
        renderHTML: (attrs) => ({
          "data-align": attrs.align ?? "center",
          class: `img-align-${attrs.align ?? "center"}`,
        }),
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});
