"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { marked } from "marked";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Pilcrow,
  Highlighter,
  Quote,
  Minus,
  Image as ImageIcon,
  Video,
  MousePointerClick,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { ChartExtension } from "@/components/intelligence/extensions/ChartExtension";
import { InsightExtension } from "@/components/intelligence/extensions/InsightExtension";
import { ReferenceExtension } from "@/components/intelligence/extensions/ReferenceExtension";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

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

// ─── Editor ───────────────────────────────────────────────────────────────────

interface IntelligenceEditorProps {
  content: string;
  onChange?: (content: string) => void;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export function IntelligenceEditor({
  content,
  onChange,
  isStreaming = false,
  onRegenerate,
  isRegenerating = false,
}: IntelligenceEditorProps) {
  const prevHtml = useRef<string | null>(null);

  const parseMarkdownToHtml = (contentStr: string) => {
    if (!contentStr) return "";
    if (contentStr.trim().startsWith("<") && contentStr.includes("</")) {
      return contentStr;
    }
    return marked.parse(contentStr, { async: false }) as string;
  };

  const editor = useEditor({
    editable: true,
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Link.configure({
        openOnClick: false,
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: false }),
      Typography,
      Image.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder: "Write or generate your intelligence report..." }),
      ChartExtension,
      InsightExtension,
      ReferenceExtension,
    ],
    content: parseMarkdownToHtml(content),
    onUpdate: ({ editor }) => {
      if (onChange) {
        const newHtml = editor.getHTML();
        prevHtml.current = newHtml;
        onChange(newHtml);
      }
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm prose-invert max-w-none focus:outline-none min-h-[300px] p-6 text-[15px] leading-relaxed text-white/90 doc-editor-content",
        spellcheck: "true",
      },
    },
  });

  // Sync content when the active page changes
  useEffect(() => {
    if (!editor) return;
    const expectedHtml = parseMarkdownToHtml(content);

    // Only update if the content prop differs from what we last gave the editor
    // AND it differs from the editor's current state.
    if (expectedHtml !== prevHtml.current) {
      prevHtml.current = expectedHtml;
      const currentHtml = editor.getHTML();
      if (currentHtml !== expectedHtml) {
        editor.commands.setContent(expectedHtml || "", { emitUpdate: false });
      }
    }
  }, [content, editor]);

  const insertImagePlaceholder = useCallback(() => {
    editor?.chain().focus().insertContent("<p><em>[📷 Image: describe what goes here]</em></p>").run();
  }, [editor]);

  const insertVideoPlaceholder = useCallback(() => {
    editor?.chain().focus().insertContent("<p><em>[▶️ Video: describe what goes here]</em></p>").run();
  }, [editor]);

  const insertCtaButton = useCallback(() => {
    editor?.chain().focus().insertContent("<p><em>[🔘 Button: Your CTA text here]</em></p>").run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-col w-full h-full rounded-2xl border border-white/10 bg-black/20 backdrop-blur-sm overflow-hidden shadow-2xl">
      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-0.5 px-4 py-3 border-b border-white/[0.07] bg-white/[0.02] flex-wrap shrink-0 sticky top-0 z-20 backdrop-blur-md gap-x-0.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          active={editor.isActive("paragraph")}
          title="Paragraph"
        >
          <Pilcrow className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <Sep />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold (⌘B)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic (⌘I)"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline (⌘U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          active={editor.isActive("highlight")}
          title="Highlight"
        >
          <Highlighter className="w-4 h-4" />
        </ToolbarButton>

        <Sep />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <Sep />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>

        <Sep />

        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Insert Divider"
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={insertImagePlaceholder} title="Insert Image Placeholder">
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={insertVideoPlaceholder} title="Insert Video Placeholder">
          <Video className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={insertCtaButton} title="Insert CTA Button">
          <MousePointerClick className="w-4 h-4" />
        </ToolbarButton>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Regenerate section button */}
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            disabled={isRegenerating || isStreaming}
            title="Regenerate this section with AI"
            className="ml-auto flex items-center gap-1.5 px-3 h-7 rounded-lg border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/15 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRegenerating ? (
              <Spinner size="xs" color="white" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            {isRegenerating ? "Generating…" : "Regenerate"}
          </button>
        )}
      </div>

      {/* ── Bubble Menu ──────────────────────────────────────────────── */}
      <BubbleMenu
        editor={editor}
        className="flex items-center gap-0.5 px-2 py-1.5 rounded-lg bg-[#12121f] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl z-50 transition-all duration-100"
      >
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <Bold className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <Italic className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolbarButton>
        <div className="w-px h-3 bg-white/10 mx-0.5" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} title="Highlight">
          <Highlighter className="w-3.5 h-3.5" />
        </ToolbarButton>
        <div className="w-px h-3 bg-white/10 mx-0.5" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="H1">
          <Heading1 className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="H2">
          <Heading2 className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="H3">
          <Heading3 className="w-3.5 h-3.5" />
        </ToolbarButton>
      </BubbleMenu>

      {/* ── Editor content ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}
