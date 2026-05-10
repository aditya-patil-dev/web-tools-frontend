"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Highlight from "@tiptap/extension-highlight";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { Level } from "@tiptap/extension-heading";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Minus,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Code,
  Quote,
} from "lucide-react";

import clsx from "clsx";
import { useEffect } from "react";

interface Props {
  label?: string;
  value: string;
  onChange: (html: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
}

export default function RichTextEditor({
  label,
  value,
  onChange,
  error,
  placeholder = "Write content...",
  required,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        horizontalRule: false, // Handled by custom extension
      }),
      Placeholder.configure({
        placeholder,
      }),
      Underline,
      Highlight,
      HorizontalRule,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "rte-link",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rte-image",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt("Enter image URL");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="formField">
      {label && (
        <label className="formLabel">
          {label} {required && "*"}
        </label>
      )}

      {/* TOOLBAR */}
      <div className="rteToolbar">
        {/* Headings */}
        <select
          className="rteHeadingSelect"
          onChange={(e) => {
            const level = Number(e.target.value);
            if (level === 0) editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: level as Level }).run();
          }}
          value={
            editor.isActive("heading", { level: 1 })
              ? 1
              : editor.isActive("heading", { level: 2 })
                ? 2
                : editor.isActive("heading", { level: 3 })
                  ? 3
                  : 0
          }
        >
          <option value="0">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>

        <div className="rteToolbarSeparator" />

        {/* Basic Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={clsx(editor.isActive("bold") && "active")}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={clsx(editor.isActive("italic") && "active")}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={clsx(editor.isActive("underline") && "active")}
          title="Underline"
        >
          <UnderlineIcon size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={clsx(editor.isActive("strike") && "active")}
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </button>

        <div className="rteToolbarSeparator" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={clsx(editor.isActive({ textAlign: "left" }) && "active")}
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={clsx(editor.isActive({ textAlign: "center" }) && "active")}
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={clsx(editor.isActive({ textAlign: "right" }) && "active")}
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>

        <div className="rteToolbarSeparator" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={clsx(editor.isActive("bulletList") && "active")}
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={clsx(editor.isActive("orderedList") && "active")}
          title="Ordered List"
        >
          <ListOrdered size={16} />
        </button>

        <div className="rteToolbarSeparator" />

        {/* Links & Media */}
        <button
          type="button"
          onClick={setLink}
          className={clsx(editor.isActive("link") && "active")}
          title="Add Link"
        >
          <LinkIcon size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive("link")}
          title="Remove Link"
        >
          <Unlink size={16} />
        </button>
        <button type="button" onClick={addImage} title="Add Image">
          <ImageIcon size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus size={16} />
        </button>

        <div className="rteToolbarSeparator" />

        {/* History */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo size={16} />
        </button>
      </div>

      {/* EDITOR */}
      <div className={clsx("rteContainer", error && "error")}>
        <EditorContent editor={editor} />
      </div>

      {error && <div className="formError">{error}</div>}

      <style jsx global>{`
        .rteToolbarSeparator {
          width: 1px;
          height: 20px;
          background: var(--border-primary);
          margin: 0 var(--space-1);
        }
        .ProseMirror {
          min-height: 200px;
          padding: var(--space-4);
          outline: none;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--text-tertiary);
          pointer-events: none;
          height: 0;
        }
        .rte-link {
          color: var(--color-primary);
          text-decoration: underline;
        }
        .rte-image {
          max-width: 100%;
          height: auto;
          border-radius: var(--radius-md);
          display: block;
          margin: var(--space-4) auto;
        }
        .rteToolbar button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}