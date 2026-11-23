import Image from "@tiptap/extension-image";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState } from "react";

import { MediaPickerModal } from "./MediaPicker";

/**
 * Article editor. Produces the same simple HTML the backend allows
 * (headings, bold/italic/underline, links, lists, quotes, images).
 */
export function RichTextEditor({
  value,
  onChange,
  lang,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  lang?: "bo";
  placeholder?: string;
}) {
  const [picking, setPicking] = useState(false);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        code: false,
        codeBlock: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Image,
    ],
    content: value,
    editorProps: {
      attributes: {
        ...(lang ? { lang } : {}),
        "aria-label": placeholder ?? "Article text",
        class:
          "prose prose-stone max-w-none min-h-[240px] px-4 py-3 focus:outline-none prose-headings:font-serif prose-img:rounded-lg",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  // Load new content when switching to a different item
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !(value === "" && editor.isEmpty)) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  return (
    <div className="overflow-hidden rounded-md border border-stone-300 bg-white focus-within:border-maroon-700">
      {editor && <Toolbar editor={editor} onImage={() => setPicking(true)} />}
      <EditorContent editor={editor} />
      <MediaPickerModal
        open={picking}
        onClose={() => setPicking(false)}
        title="Insert an image"
        onPick={(m) => editor?.chain().focus().setImage({ src: m.urls.md, alt: m.alt }).run()}
      />
    </div>
  );
}

function Toolbar({ editor, onImage }: { editor: Editor; onImage: () => void }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      link: e.isActive("link"),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });
  const c = () => editor.chain().focus();

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link address (leave empty to remove the link)", prev ?? "https://");
    if (url === null) return;
    if (url.trim() === "" || url === "https://") c().extendMarkRange("link").unsetLink().run();
    else c().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  return (
    <div className="flex flex-wrap gap-0.5 border-b border-stone-200 bg-stone-50 px-2 py-1.5">
      <Tool label="Heading" active={s.h2} onClick={() => c().toggleHeading({ level: 2 }).run()}>H2</Tool>
      <Tool label="Subheading" active={s.h3} onClick={() => c().toggleHeading({ level: 3 }).run()}>H3</Tool>
      <Sep />
      <Tool label="Bold" active={s.bold} onClick={() => c().toggleBold().run()}><b>B</b></Tool>
      <Tool label="Italic" active={s.italic} onClick={() => c().toggleItalic().run()}><i>I</i></Tool>
      <Tool label="Underline" active={s.underline} onClick={() => c().toggleUnderline().run()}><u>U</u></Tool>
      <Tool label="Link" active={s.link} onClick={setLink}>Link</Tool>
      <Sep />
      <Tool label="Bulleted list" active={s.bullet} onClick={() => c().toggleBulletList().run()}>• List</Tool>
      <Tool label="Numbered list" active={s.ordered} onClick={() => c().toggleOrderedList().run()}>1. List</Tool>
      <Tool label="Quote" active={s.quote} onClick={() => c().toggleBlockquote().run()}>“ Quote</Tool>
      <Tool label="Insert image" onClick={onImage}>Image</Tool>
      <Sep />
      <Tool label="Undo" disabled={!s.canUndo} onClick={() => c().undo().run()}>↶</Tool>
      <Tool label="Redo" disabled={!s.canRedo} onClick={() => c().redo().run()}>↷</Tool>
    </div>
  );
}

function Tool({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()} // keep the text selection
      onClick={onClick}
      className={`min-w-8 rounded px-2 py-1 text-sm ${
        active ? "bg-maroon-700 text-white" : "text-stone-700 hover:bg-stone-200"
      } disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="mx-1 w-px self-stretch bg-stone-300" />;
}
