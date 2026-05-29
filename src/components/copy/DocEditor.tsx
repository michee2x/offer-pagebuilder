"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";

import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Image as ImageIcon,
  Video,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Pilcrow,
  Highlighter,
  MousePointerClick,
  RefreshCw,
  Loader2,
} from "lucide-react";

// ─── Toolbar primitives ───────────────────────────────────────────────────────

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={cn(
        "w-7 h-7 flex items-center justify-center rounded transition-all duration-100",
        active
          ? "bg-white/15 text-white"
          : "text-white/40 hover:text-white hover:bg-white/8",
      )}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-4 bg-white/10 mx-1 shrink-0" />;
}

// ─── DocEditor ────────────────────────────────────────────────────────────────

interface DocEditorProps {
  html: string;
  onChange: (html: string) => void;
  onRegenerate?: () => Promise<void>;
  isRegenerating?: boolean;
  placeholder?: string;
}

export function DocEditor({
  html,
  onChange,
  onRegenerate,
  isRegenerating = false,
  placeholder = "Start writing your page copy… or click Regenerate to generate new copy.",
}: DocEditorProps) {
  const prevHtml = useRef(html);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: false }),
      Typography,
      Placeholder.configure({ placeholder }),
      Image.configure({ inline: false, allowBase64: true }),
    ],
    content: html,
    onUpdate: ({ editor }) => {
      const newHtml = editor.getHTML();
      prevHtml.current = newHtml;
      onChange(newHtml);
    },
    editorProps: {
      attributes: {
        class: "doc-editor-content",
        spellcheck: "true",
      },
    },
  });

  // Sync content when the active page changes
  useEffect(() => {
    if (!editor || html === prevHtml.current) return;
    prevHtml.current = html;
    const current = editor.getHTML();
    if (current !== html) {
      editor.commands.setContent(html || "");
    }
  }, [html, editor]);

  const insertImagePlaceholder = useCallback(() => {
    editor
      ?.chain()
      .focus()
      .insertContent("<p><em>[📷 Image: describe what goes here]</em></p>")
      .run();
  }, [editor]);

  const insertVideoPlaceholder = useCallback(() => {
    editor
      ?.chain()
      .focus()
      .insertContent("<p><em>[▶️ Video: describe what goes here]</em></p>")
      .run();
  }, [editor]);

  const insertCtaButton = useCallback(() => {
    editor
      ?.chain()
      .focus()
      .insertContent("<p><em>[🔘 Button: Your CTA text here]</em></p>")
      .run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-col h-full">
      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-white/[0.07] bg-white/[0.015] flex-wrap shrink-0 sticky top-0 z-10 backdrop-blur-sm">
        {/* Block type */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          active={editor.isActive("paragraph")}
          title="Paragraph"
        >
          <Pilcrow className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="w-3.5 h-3.5" />
        </ToolbarButton>

        <Sep />

        {/* Inline formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold (⌘B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic (⌘I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline (⌘U)"
        >
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          active={editor.isActive("highlight")}
          title="Highlight"
        >
          <Highlighter className="w-3.5 h-3.5" />
        </ToolbarButton>

        <Sep />

        {/* Lists & blocks */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote / Testimonial"
        >
          <Quote className="w-3.5 h-3.5" />
        </ToolbarButton>

        <Sep />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Align Right"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </ToolbarButton>

        <Sep />

        {/* Inserts */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Insert Divider"
        >
          <Minus className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={insertImagePlaceholder}
          title="Insert Image Placeholder"
        >
          <ImageIcon className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={insertVideoPlaceholder}
          title="Insert Video Placeholder"
        >
          <Video className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={insertCtaButton} title="Insert CTA Button">
          <MousePointerClick className="w-3.5 h-3.5" />
        </ToolbarButton>

        {/* Spacer to push regenerate button to the right */}
        <div className="flex-1" />

        {/* Regenerate button */}
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            title="Regenerate this section"
            className="ml-auto flex items-center gap-1.5 px-3 h-7 rounded-lg border border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/15 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRegenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            {isRegenerating ? 'Generating…' : 'Regenerate'}
          </button>
        )}
      </div>

      {/* ── Floating bubble menu on text selection ───────────────────── */}
      <BubbleMenu
        editor={editor}
        options={{ placement: "top" }}
        className="flex items-center gap-0.5 px-2 py-1.5 rounded-lg bg-[#12121f] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl"
      >
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="w-3 h-3" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="w-3 h-3" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon className="w-3 h-3" />
        </ToolbarButton>
        <div className="w-px h-3 bg-white/10 mx-0.5" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          active={editor.isActive("highlight")}
          title="Highlight"
        >
          <Highlighter className="w-3 h-3" />
        </ToolbarButton>
        <div className="w-px h-3 bg-white/10 mx-0.5" />
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
          title="H1"
        >
          <Heading1 className="w-3 h-3" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="H2"
        >
          <Heading2 className="w-3 h-3" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          title="H3"
        >
          <Heading3 className="w-3 h-3" />
        </ToolbarButton>
      </BubbleMenu>

      {/* ── Editor content ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}
