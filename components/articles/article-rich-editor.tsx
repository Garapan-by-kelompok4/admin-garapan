"use client";

import { useEffect } from "react";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading1,
  Heading2,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
  Unlink,
} from "lucide-react";

export interface ArticleRichEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export function ArticleRichEditor({ content, onChange }: ArticleRichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-brand-600 underline underline-offset-2",
        },
      }),
      Placeholder.configure({
        placeholder: "Tulis isi artikel di sini...",
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  const buttonClass = (active = false) =>
    `flex h-8 w-8 items-center justify-center rounded transition-all hover:bg-surface-3 ${
      active
        ? "border border-border bg-white text-brand-600 shadow-sm"
        : "text-ink-600"
    }`;

  const textButtonClass = (active = false) =>
    `flex h-8 items-center justify-center gap-1 rounded px-2 text-xs font-semibold transition-all hover:bg-surface-3 ${
      active
        ? "border border-border bg-white text-brand-600 shadow-sm"
        : "text-ink-600"
    }`;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Masukkan URL tautan", previousUrl ?? "https://");

    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-surface-2 p-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
          className={`${buttonClass()} disabled:cursor-not-allowed disabled:opacity-35`}
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
          className={`${buttonClass()} disabled:cursor-not-allowed disabled:opacity-35`}
        >
          <Redo2 className="h-4 w-4" />
        </button>
        <div className="mx-1 h-6 w-px self-center bg-border" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Tebal"
          className={buttonClass(editor.isActive("bold"))}
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Miring"
          className={buttonClass(editor.isActive("italic"))}
        >
          <Italic className="h-4 w-4" />
        </button>
        <div className="mx-1 h-6 w-px self-center bg-border" />
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          title="Judul 1"
          className={buttonClass(editor.isActive("heading", { level: 1 }))}
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          title="Judul 2"
          className={buttonClass(editor.isActive("heading", { level: 2 }))}
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="List Poin"
          className={textButtonClass(editor.isActive("bulletList"))}
        >
          <List className="h-4 w-4" />
          Poin
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="List Angka"
          className={textButtonClass(editor.isActive("orderedList"))}
        >
          <ListOrdered className="h-4 w-4" />
          Angka
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Kutipan"
          className={textButtonClass(editor.isActive("blockquote"))}
        >
          <Quote className="h-4 w-4" />
          Kutipan
        </button>
        <div className="mx-1 h-6 w-px self-center bg-border" />
        <button
          type="button"
          onClick={setLink}
          title="Tambah tautan"
          className={buttonClass(editor.isActive("link"))}
        >
          <LinkIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().extendMarkRange("link").unsetLink().run()
          }
          disabled={!editor.isActive("link")}
          title="Hapus tautan"
          className={`${buttonClass()} disabled:cursor-not-allowed disabled:opacity-35`}
        >
          <Unlink className="h-4 w-4" />
        </button>
      </div>
      <EditorContent
        editor={editor}
        className="min-h-[300px] max-h-[500px] overflow-y-auto p-4 prose prose-sm max-w-none [&_.ProseMirror]:min-h-[270px] [&_.ProseMirror]:focus:outline-none [&_.ProseMirror_.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_.is-editor-empty:first-child::before]:text-ink-300 [&_.ProseMirror_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]"
      />
    </div>
  );
}
