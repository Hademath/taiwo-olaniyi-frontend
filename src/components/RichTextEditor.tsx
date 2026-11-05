import CharacterCount from "@tiptap/extension-character-count";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Highlight from "@tiptap/extension-highlight";
import { ResizableImageExtension } from "./ResizableImage";
import Link from "@tiptap/extension-link";
import SubExtension from "@tiptap/extension-subscript";
import SuperExtension from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { Extension } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Code2,
  Heading2,
  Heading3,
  Heading4,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Underline as UnderlineIcon,
  Undo2,
  Unlink,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// Custom font-size extension (extends textStyle mark)
const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return { types: ["textStyle"] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types as string[],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el: HTMLElement) => el.style.fontSize || null,
            renderHTML: (attrs: Record<string, unknown>) => {
              if (!attrs.fontSize) return {};
              return { style: `font-size: ${attrs.fontSize}` };
            },
          },
        },
      },
    ];
  },
});

const FONT_FAMILIES = [
  { label: "Default", value: "" },
  // Serif
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Garamond", value: "Garamond, 'EB Garamond', serif" },
  { label: "Palatino", value: "'Palatino Linotype', Palatino, 'Book Antiqua', serif" },
  { label: "Book Antiqua", value: "'Book Antiqua', Palatino, serif" },
  // Sans-serif
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
  { label: "Tahoma", value: "Tahoma, Geneva, sans-serif" },
  { label: "Calibri", value: "Calibri, 'Gill Sans', sans-serif" },
  { label: "Century Gothic", value: "'Century Gothic', 'Apple Gothic', sans-serif" },
  // Monospace
  { label: "Courier New", value: "'Courier New', Courier, monospace" },
  { label: "Lucida Console", value: "'Lucida Console', Monaco, monospace" },
];

const FONT_SIZES: { label: string; value: string }[] = [
  { label: "—", value: "" },
  ...[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 22, 24, 26, 28, 32, 36, 40, 48, 56].map(
    (n) => ({ label: `${n}`, value: `${n}px` })
  ),
];

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4, 5] } }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Highlight.configure({ multicolor: false }),
      CharacterCount,
      SubExtension,
      SuperExtension,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      ResizableImageExtension.configure({ inline: false, allowBase64: false }),
    ],
    content: value || "",
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    editorProps: {
      attributes: { class: "rich-editor-content", "data-placeholder": placeholder ?? "Begin writing…" },
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  const [showImageBar, setShowImageBar] = useState(false);
  const [imageInputVal, setImageInputVal] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const toggleImageBar = useCallback(() => {
    setShowImageBar((v) => { if (!v) setTimeout(() => imageInputRef.current?.focus(), 30); return !v; });
    setImageInputVal("");
  }, []);

  const insertImage = useCallback(() => {
    if (!editor || !imageInputVal.trim()) return;
    editor.chain().focus().setImage({ src: imageInputVal.trim() }).run();
    setImageInputVal("");
    setShowImageBar(false);
  }, [editor, imageInputVal]);

  if (!editor) return null;

  const wordCount = editor.storage.characterCount
    ? String(editor.getText().trim().split(/\s+/).filter(Boolean).length)
    : "0";

  const currentFontFamily = (editor.getAttributes("textStyle").fontFamily as string | undefined) ?? "";
  const currentFontSize = (editor.getAttributes("textStyle").fontSize as string | undefined) ?? "";
  const currentAlign = (["left", "center", "right", "justify"] as const).find(
    (a) => editor.isActive({ textAlign: a })
  ) ?? "left";

  return (
    <div className="rich-editor-wrap">
      <div className="rich-toolbar">

        {/* Undo / Redo */}
        <div className="rich-toolbar-group">
          <ToolBtn title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}><Undo2 size={14} /></ToolBtn>
          <ToolBtn title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}><Redo2 size={14} /></ToolBtn>
        </div>
        <div className="rich-toolbar-sep" />

        {/* Font family */}
        <div className="rich-toolbar-group">
          <select
            className="rich-select"
            title="Font family"
            value={currentFontFamily}
            onChange={(e) => {
              if (e.target.value) {
                editor.chain().focus().setFontFamily(e.target.value).run();
              } else {
                editor.chain().focus().unsetFontFamily().run();
              }
            }}
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
        <div className="rich-toolbar-sep" />

        {/* Font size */}
        <div className="rich-toolbar-group">
          <select
            className="rich-select rich-select-sm"
            title="Font size"
            value={currentFontSize}
            onChange={(e) => {
              const v = e.target.value;
              if (v) {
                editor.chain().focus().setMark("textStyle", { fontSize: v }).run();
              } else {
                editor.chain().focus().setMark("textStyle", { fontSize: null }).run();
              }
            }}
          >
            {FONT_SIZES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="rich-toolbar-sep" />

        {/* Headings */}
        <div className="rich-toolbar-group">
          <ToolBtn title="Paragraph" active={editor.isActive("paragraph")} onClick={() => editor.chain().focus().setParagraph().run()}><Pilcrow size={14} /></ToolBtn>
          <ToolBtn title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={14} /></ToolBtn>
          <ToolBtn title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 size={14} /></ToolBtn>
          <ToolBtn title="Heading 4" active={editor.isActive("heading", { level: 4 })} onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}><Heading4 size={14} /></ToolBtn>
        </div>
        <div className="rich-toolbar-sep" />

        {/* Inline formatting */}
        <div className="rich-toolbar-group">
          <ToolBtn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={14} /></ToolBtn>
          <ToolBtn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={14} /></ToolBtn>
          <ToolBtn title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={14} /></ToolBtn>
          <ToolBtn title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={14} /></ToolBtn>
          <ToolBtn title="Subscript" active={editor.isActive("subscript")} onClick={() => editor.chain().focus().toggleSubscript().run()}><SubscriptIcon size={14} /></ToolBtn>
          <ToolBtn title="Superscript" active={editor.isActive("superscript")} onClick={() => editor.chain().focus().toggleSuperscript().run()}><SuperscriptIcon size={14} /></ToolBtn>
          <ToolBtn title="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}><Code size={14} /></ToolBtn>
        </div>
        <div className="rich-toolbar-sep" />

        {/* Text alignment */}
        <div className="rich-toolbar-group">
          <ToolBtn title="Align left" active={currentAlign === "left"} onClick={() => editor.chain().focus().setTextAlign("left").run()}><AlignLeft size={14} /></ToolBtn>
          <ToolBtn title="Align center" active={currentAlign === "center"} onClick={() => editor.chain().focus().setTextAlign("center").run()}><AlignCenter size={14} /></ToolBtn>
          <ToolBtn title="Align right" active={currentAlign === "right"} onClick={() => editor.chain().focus().setTextAlign("right").run()}><AlignRight size={14} /></ToolBtn>
          <ToolBtn title="Justify" active={currentAlign === "justify"} onClick={() => editor.chain().focus().setTextAlign("justify").run()}><AlignJustify size={14} /></ToolBtn>
        </div>
        <div className="rich-toolbar-sep" />

        {/* Lists & blocks */}
        <div className="rich-toolbar-group">
          <ToolBtn title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={14} /></ToolBtn>
          <ToolBtn title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={14} /></ToolBtn>
          <ToolBtn title="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={14} /></ToolBtn>
          <ToolBtn title="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code2 size={14} /></ToolBtn>
          <ToolBtn title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={14} /></ToolBtn>
        </div>
        <div className="rich-toolbar-sep" />

        {/* Link */}
        <div className="rich-toolbar-group">
          <ToolBtn title="Add link" active={editor.isActive("link")} onClick={setLink}><LinkIcon size={14} /></ToolBtn>
          {editor.isActive("link") && (
            <ToolBtn title="Remove link" onClick={() => editor.chain().focus().unsetLink().run()}><Unlink size={14} /></ToolBtn>
          )}
        </div>
        <div className="rich-toolbar-sep" />

        {/* Image */}
        <div className="rich-toolbar-group">
          <ToolBtn title="Insert image" active={showImageBar} onClick={toggleImageBar}><ImageIcon size={14} /></ToolBtn>
        </div>
        <div className="rich-toolbar-sep" />

        {/* Colour & highlight */}
        <div className="rich-toolbar-group">
          <label className="rich-color-btn" title="Text colour">
            <span className="color-swatch" style={{ background: (editor.getAttributes("textStyle").color as string | undefined) ?? "currentColor" }} />
            <input type="color" defaultValue="#1a1a2e" onChange={(e) => editor.chain().focus().setColor(e.target.value).run()} />
          </label>
          <ToolBtn title="Highlight" active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight().run()}>
            <span style={{ background: "#c9b97a", borderRadius: 2, padding: "1px 3px", fontSize: 10, fontWeight: 800, lineHeight: 1.4 }}>A</span>
          </ToolBtn>
        </div>
      </div>

      {showImageBar && (
        <div className="rich-image-bar">
          <ImageIcon size={14} style={{ color: "#68718f", flexShrink: 0 }} />
          <input
            ref={imageInputRef}
            type="url"
            className="rich-image-input"
            placeholder="Paste an image URL and press Enter…"
            value={imageInputVal}
            onChange={(e) => setImageInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); insertImage(); }
              if (e.key === "Escape") { setShowImageBar(false); setImageInputVal(""); }
            }}
          />
          <button type="button" className="button button-soft button-small" onClick={insertImage} disabled={!imageInputVal.trim()}>Insert</button>
          <button type="button" className="icon-button" title="Cancel" onClick={() => { setShowImageBar(false); setImageInputVal(""); }}><X size={14} /></button>
        </div>
      )}
      <EditorContent editor={editor} className="rich-editor-body" />
      <div className="editor-footnote">
        {wordCount} words <span>•</span> Changes are saved when you choose Save draft or Publish.
      </div>
    </div>
  );
}

function ToolBtn({ children, title, onClick, active, disabled }: { children: React.ReactNode; title: string; onClick: () => void; active?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      className={`rich-tool-btn${active ? " rich-tool-active" : ""}`}
      disabled={disabled}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    >
      {children}
    </button>
  );
}
