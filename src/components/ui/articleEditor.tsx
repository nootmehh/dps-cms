"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import LordIcon from "../common/lordIcon";
import MediaSelectModal, { MediaSelectModalItem } from "@/components/modal/mediaSelectModal";

export interface ArticleEditorProps {
  label?: ReactNode;
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  // Backwards compatibility props
  englishValue?: string;
  onEnglishChange?: (val: string) => void;
  indonesianValue?: string;
  onIndonesianChange?: (val: string) => void;
  className?: string;
  required?: boolean;
}

export default function ArticleEditor({
  label = "Isi Konten Artikel *",
  value,
  onChange,
  placeholder = "Tuliskan isi konten artikel di sini...",
  englishValue,
  onEnglishChange,
  indonesianValue,
  onIndonesianChange,
  className = "",
}: ArticleEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [isUploadHovered, setIsUploadHovered] = useState(false);
  const [isMediaHovered, setIsMediaHovered] = useState(false);

  const currentValue =
    value !== undefined
      ? value
      : indonesianValue !== undefined
      ? indonesianValue
      : englishValue || "";

  const handleChange = (val: string) => {
    if (onChange) onChange(val);
    if (onIndonesianChange) onIndonesianChange(val);
    if (onEnglishChange) onEnglishChange(val);
  };

  // Synchronize external value with innerHTML only when not actively editing
  useEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== currentValue) {
        if (document.activeElement !== editorRef.current) {
          editorRef.current.innerHTML = currentValue || "";
          setCharCount(editorRef.current.innerText.trim().length);
        }
      }
    }
  }, [currentValue]);

  const handleEditorInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setCharCount(editorRef.current.innerText.trim().length);
      handleChange(html);
    }
  };

  const executeCommand = (command: string, arg?: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, arg);
    handleEditorInput();
  };

  const insertHtmlAtCursor = (html: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        range.deleteContents();
        const el = document.createElement("div");
        el.innerHTML = html;
        const frag = document.createDocumentFragment();
        let node: ChildNode | null = null;
        let lastNode: ChildNode | null = null;
        while ((node = el.firstChild)) {
          lastNode = frag.appendChild(node);
        }
        range.insertNode(frag);
        if (lastNode) {
          const newRange = range.cloneRange();
          newRange.setStartAfter(lastNode);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
        handleEditorInput();
        return;
      }
    }

    editorRef.current.innerHTML += html;
    handleEditorInput();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        insertHtmlAtCursor(
          `<p><img src="${dataUrl}" alt="${file.name}" style="max-width: 100%; height: auto; border-radius: 1rem; margin: 1rem 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);" /></p><p><br></p>`
        );
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleMediaLibrarySelect = (item: MediaSelectModalItem) => {
    insertHtmlAtCursor(
      `<p><img src="${item.url}" alt="${item.fileName || "Gambar Artikel"}" style="max-width: 100%; height: auto; border-radius: 1rem; margin: 1rem 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);" /></p><p><br></p>`
    );
    setIsMediaModalOpen(false);
  };

  const renderLabel = () => {
    if (!label) return null;
    if (typeof label === "string") {
      if (label.includes("*")) {
        const parts = label.split("*");
        return (
          <label className="text-dark text-sm font-semibold font-sans">
            {parts[0]}
            <span className="text-red-state">*</span>
            {parts.slice(1).join("*")}
          </label>
        );
      }
      return (
        <label className="text-dark text-sm font-semibold font-sans">
          {label}
        </label>
      );
    }
    return (
      <label className="text-dark text-sm font-semibold font-sans">
        {label}
      </label>
    );
  };

  const isEmpty = !currentValue || currentValue === "<br>" || currentValue.trim() === "";

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {/* Label */}
      {renderLabel()}

      {/* Editor Box */}
      <div className="w-full bg-brand-background rounded-3xl overflow-hidden outline outline-1 outline-transparent hover:outline-g1 focus-within:outline-g1 focus-within:ring-2 focus-within:ring-g1/20 transition-all duration-200">
        {/* Hidden File Input for Image Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Toolbar Header */}
        <div className="px-4 py-3 bg-brand-background border-b border-white-70/80 flex flex-wrap items-center gap-2.5">
          {/* Format Text */}
          <button
            type="button"
            title="Teks Tebal (Bold)"
            onClick={() => executeCommand("bold")}
            className="size-11 rounded-full bg-white hover:bg-g1/15 text-dark/80 hover:text-g1 flex items-center justify-center font-bold text-base transition-all cursor-pointer border border-white-70 hover:border-g1/40 active:scale-95 shadow-xs"
          >
            B
          </button>
          <button
            type="button"
            title="Teks Miring (Italic)"
            onClick={() => executeCommand("italic")}
            className="size-11 rounded-full bg-white hover:bg-g1/15 text-dark/80 hover:text-g1 flex items-center justify-center italic font-serif text-base transition-all cursor-pointer border border-white-70 hover:border-g1/40 active:scale-95 shadow-xs"
          >
            I
          </button>
          <button
            type="button"
            title="Garis Bawah (Underline)"
            onClick={() => executeCommand("underline")}
            className="size-11 rounded-full bg-white hover:bg-g1/15 text-dark/80 hover:text-g1 flex items-center justify-center underline text-base transition-all cursor-pointer border border-white-70 hover:border-g1/40 active:scale-95 shadow-xs"
          >
            U
          </button>

          <div className="w-px h-6 bg-dark/15 mx-1" />

          {/* Headings & Paragraph */}
          <button
            type="button"
            title="Subjudul Besar (Heading 2)"
            onClick={() => executeCommand("formatBlock", "<h2>")}
            className="size-11 rounded-full bg-white hover:bg-g1/15 text-dark/80 hover:text-g1 flex items-center justify-center font-bold text-sm transition-all cursor-pointer border border-white-70 hover:border-g1/40 active:scale-95 shadow-xs"
          >
            H2
          </button>
          <button
            type="button"
            title="Subjudul Sedang (Heading 3)"
            onClick={() => executeCommand("formatBlock", "<h3>")}
            className="size-11 rounded-full bg-white hover:bg-g1/15 text-dark/80 hover:text-g1 flex items-center justify-center font-semibold text-xs transition-all cursor-pointer border border-white-70 hover:border-g1/40 active:scale-95 shadow-xs"
          >
            H3
          </button>
          <button
            type="button"
            title="Paragraf Biasa"
            onClick={() => executeCommand("formatBlock", "<p>")}
            className="size-11 rounded-full bg-white hover:bg-g1/15 text-dark/80 hover:text-g1 flex items-center justify-center font-medium text-base transition-all cursor-pointer border border-white-70 hover:border-g1/40 active:scale-95 shadow-xs"
          >
            ¶
          </button>

          <div className="w-px h-6 bg-dark/15 mx-1" />

          {/* Lists & Quotes */}
          <button
            type="button"
            title="Daftar Poin (Bullet List)"
            onClick={() => executeCommand("insertUnorderedList")}
            className="size-11 rounded-full bg-white hover:bg-g1/15 text-dark/80 hover:text-g1 flex items-center justify-center text-xl transition-all cursor-pointer border border-white-70 hover:border-g1/40 active:scale-95 shadow-xs"
          >
            •
          </button>
          <button
            type="button"
            title="Daftar Berurutan (Numbered List)"
            onClick={() => executeCommand("insertOrderedList")}
            className="size-11 rounded-full bg-white hover:bg-g1/15 text-dark/80 hover:text-g1 flex items-center justify-center font-semibold text-xs transition-all cursor-pointer border border-white-70 hover:border-g1/40 active:scale-95 shadow-xs"
          >
            1.
          </button>
          <button
            type="button"
            title="Kutipan (Blockquote)"
            onClick={() => executeCommand("formatBlock", "<blockquote>")}
            className="size-11 rounded-full bg-white hover:bg-g1/15 text-dark/80 hover:text-g1 flex items-center justify-center text-xl font-serif transition-all cursor-pointer border border-white-70 hover:border-g1/40 active:scale-95 shadow-xs"
          >
            ”
          </button>

          <div className="w-px h-6 bg-dark/15 mx-1" />

          {/* Upload Image Buttons */}
          <button
            type="button"
            title="Unggah Foto dari Komputer"
            onClick={() => fileInputRef.current?.click()}
            onMouseEnter={() => setIsUploadHovered(true)}
            onMouseLeave={() => setIsUploadHovered(false)}
            className="h-11 px-4 rounded-full bg-white hover:bg-g1/15 text-dark/70 hover:text-g1 border border-white-70 hover:border-g1/40 flex items-center gap-2 text-xs font-semibold cursor-pointer shadow-xs transition-all active:scale-95"
          >
            <LordIcon
              name="Image 2"
              size={20}
              primaryColor={isUploadHovered ? "#0A9863" : "#110D31"}
            />
            <span>Unggah Gambar</span>
          </button>
          <button
            type="button"
            title="Pilih Foto dari Media Library"
            onClick={() => setIsMediaModalOpen(true)}
            onMouseEnter={() => setIsMediaHovered(true)}
            onMouseLeave={() => setIsMediaHovered(false)}
            className="h-11 px-4 rounded-full bg-white hover:bg-g1/15 text-dark/70 hover:text-g1 border border-white-70 hover:border-g1/40 flex items-center gap-2 text-xs font-semibold cursor-pointer shadow-xs transition-all active:scale-95"
          >
            <LordIcon
              name="Attachment"
              size={20}
              primaryColor={isMediaHovered ? "#0A9863" : "#110D31"}
            />
            <span>Media Library</span>
          </button>
        </div>

        {/* WYSIWYG Visual Preview Editor Area */}
        <div className="relative w-full">
          {isEmpty && (
            <div className="absolute top-4 left-4 text-dark/40 text-sm font-normal pointer-events-none select-none font-sans">
              {placeholder}
            </div>
          )}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleEditorInput}
            className="w-full p-4 min-h-72 text-dark text-sm font-normal font-sans outline-none focus:outline-none leading-relaxed prose max-w-none [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-dark [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-dark [&_h3]:mt-3 [&_h3]:mb-1.5 [&_p]:mb-3 [&_p]:leading-relaxed [&_blockquote]:border-l-4 [&_blockquote]:border-g1 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-dark/70 [&_blockquote]:my-3 [&_blockquote]:bg-g1/5 [&_blockquote]:py-2 [&_blockquote]:rounded-r-xl [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3 [&_img]:rounded-2xl [&_img]:max-w-full [&_img]:my-3 [&_img]:shadow-xs"
          />
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-brand-background border-t border-white-70/80 flex justify-end items-center text-xs text-dark/50 font-sans">
          <span className="font-medium text-dark/60">{charCount} karakter</span>
        </div>
      </div>

      {/* Media Select Modal for Editor Images */}
      <MediaSelectModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={handleMediaLibrarySelect}
      />
    </div>
  );
}
