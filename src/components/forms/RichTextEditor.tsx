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

            StarterKit,

            Placeholder.configure({
                placeholder,
            }),

            Underline,

            Highlight,

            HorizontalRule,

            Link.configure({
                openOnClick: false,
            }),

            Image,

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
            editor.commands.setContent(value || "", false);
        }

    }, [value, editor]);


    if (!editor) return null;


    return (

        <div className="formField">

            {label && (
                <label className="formLabel">
                    {label} {required && "*"}
                </label>
            )}


            {/* TOOLBAR */}

            <div className="rteToolbar">

                {/* headings */}

                <select
                    onChange={(e) => {

                        const level = Number(e.target.value);

                        if (level === 0)
                            editor.chain().focus().setParagraph().run();
                        else
                            editor.chain().focus().toggleHeading({ level }).run();

                    }}
                    value={
                        editor.isActive("heading", { level: 1 }) ? 1 :
                            editor.isActive("heading", { level: 2 }) ? 2 :
                                editor.isActive("heading", { level: 3 }) ? 3 : 0
                    }
                >
                    <option value="0">Paragraph</option>
                    <option value="1">Heading 1</option>
                    <option value="2">Heading 2</option>
                    <option value="3">Heading 3</option>
                </select>


                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={clsx(editor.isActive("bold") && "active")}
                >
                    B
                </button>


                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={clsx(editor.isActive("italic") && "active")}
                >
                    I
                </button>


                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={clsx(editor.isActive("underline") && "active")}
                >
                    U
                </button>


                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                >
                    S
                </button>


                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                    • List
                </button>


                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                    1. List
                </button>


                <button
                    type="button"
                    onClick={() => {

                        const url = prompt("Enter URL");

                        if (url)
                            editor.chain().focus().setLink({ href: url }).run();

                    }}
                >
                    Link
                </button>


                <button
                    type="button"
                    onClick={() => editor.chain().focus().unsetLink().run()}
                >
                    Unlink
                </button>


                <button
                    type="button"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                >
                    HR
                </button>


                <button
                    type="button"
                    onClick={() => editor.chain().focus().undo().run()}
                >
                    Undo
                </button>


                <button
                    type="button"
                    onClick={() => editor.chain().focus().redo().run()}
                >
                    Redo
                </button>

            </div>


            {/* EDITOR */}

            <div className={clsx("rteContainer", error && "error")}>
                <EditorContent editor={editor} />
            </div>


            {error && (
                <div className="formError">{error}</div>
            )}

        </div>

    );

}