import CharacterCount from "@tiptap/extension-character-count";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Code,
  Code2,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
  Unlink,
} from "lucide-react";
import { useCallback, useEffect } from "react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: false }),
      CharacterCount,
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

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const wordCount = editor.storage.characterCount
    ? String(editor.getText().trim().split(/\s+/).filter(Boolean).length)
    : "0";

  return (
    <div className="rich-editor-wrap">
      <div className="rich-toolbar">
        <div className="rich-toolbar-group">
          <ToolBtn title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}><Undo2 size={14} /></ToolBtn>
          <ToolBtn title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}><Redo2 size={14} /></ToolBtn>
        </div>
        <div className="rich-toolbar-sep" />
        <div className="rich-toolbar-group">
          <ToolBtn title="Paragraph" active={editor.isActive("paragraph")} onClick={() => editor.chain().focus().setParagraph().run()}><Pilcrow size={14} /></ToolBtn>
          <ToolBtn title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={14} /></ToolBtn>
          <ToolBtn title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 size={14} /></ToolBtn>
        </div>
        <div className="rich-toolbar-sep" />
        <div className="rich-toolbar-group">
          <ToolBtn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={14} /></ToolBtn>
          <ToolBtn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={14} /></ToolBtn>
          <ToolBtn title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={14} /></ToolBtn>
          <ToolBtn title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={14} /></ToolBtn>
          <ToolBtn title="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}><Code size={14} /></ToolBtn>
        </div>
        <div className="rich-toolbar-sep" />
        <div className="rich-toolbar-group">
          <ToolBtn title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={14} /></ToolBtn>
          <ToolBtn title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={14} /></ToolBtn>
          <ToolBtn title="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={14} /></ToolBtn>
          <ToolBtn title="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code2 size={14} /></ToolBtn>
          <ToolBtn title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={14} /></ToolBtn>
        </div>
        <div className="rich-toolbar-sep" />
        <div className="rich-toolbar-group">
          <ToolBtn title="Add link" active={editor.isActive("link")} onClick={setLink}><LinkIcon size={14} /></ToolBtn>
          {editor.isActive("link") && (
            <ToolBtn title="Remove link" onClick={() => editor.chain().focus().unsetLink().run()}><Unlink size={14} /></ToolBtn>
          )}
        </div>
        <div className="rich-toolbar-sep" />
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
