"use client";

import { useState } from "react";
import LordIcon from "../common/lordIcon";

export interface ArticleEditorProps {
  label?: string;
  englishValue: string;
  onEnglishChange: (val: string) => void;
  indonesianValue: string;
  onIndonesianChange: (val: string) => void;
  className?: string;
}

export default function ArticleEditor({
  label = "Konten Artikel",
  englishValue,
  onEnglishChange,
  indonesianValue,
  onIndonesianChange,
  className = "",
}: ArticleEditorProps) {
  const [activeLang, setActiveLang] = useState<"id" | "en">("id");

  const currentValue = activeLang === "id" ? indonesianValue : englishValue;
  const handleChange = (val: string) => {
    if (activeLang === "id") {
      onIndonesianChange(val);
    } else {
      onEnglishChange(val);
    }
  };

  const handleFormat = (tag: string) => {
    // Quick helper for wrapping selected text with HTML tags in textarea
    const textarea = document.getElementById("article-content-textarea") as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = currentValue.substring(start, end);
    let replacement = "";

    switch (tag) {
      case "b":
        replacement = `<strong>${selected || "Teks Tebal"}</strong>`;
        break;
      case "i":
        replacement = `<em>${selected || "Teks Miring"}</em>`;
        break;
      case "u":
        replacement = `<u>${selected || "Teks Garis Bawah"}</u>`;
        break;
      case "h2":
        replacement = `\n<h2>${selected || "Subjudul"}</h2>\n`;
        break;
      case "h3":
        replacement = `\n<h3>${selected || "Sub-subjudul"}</h3>\n`;
        break;
      case "ul":
        replacement = `\n<ul>\n  <li>${selected || "Poin item 1"}</li>\n  <li>Poin item 2</li>\n</ul>\n`;
        break;
      case "ol":
        replacement = `\n<ol>\n  <li>${selected || "Langkah 1"}</li>\n  <li>Langkah 2</li>\n</ol>\n`;
        break;
      case "quote":
        replacement = `\n<blockquote>${selected || "Kutipan artikel..."}</blockquote>\n`;
        break;
      case "p":
        replacement = `\n<p>${selected || "Paragraf baru..."}</p>\n`;
        break;
      default:
        replacement = selected;
    }

    const updated = currentValue.substring(0, start) + replacement + currentValue.substring(end);
    handleChange(updated);
  };

  return (
    <div className={`w-full flex flex-col gap-2 ${className}`}>
      {/* Label and Language Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-dark text-sm font-semibold font-sans">
          {label} <span className="text-red-state">*</span>
        </label>

        {/* Bilingual Selector Pills */}
        <div className="inline-flex p-1 bg-white-90 rounded-full border border-white-80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveLang("id")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold font-sans transition-all cursor-pointer ${
              activeLang === "id"
                ? "bg-g1 text-white shadow-xs"
                : "text-dark/60 hover:text-dark"
            }`}
          >
            🇮🇩 Bahasa Indonesia
          </button>
          <button
            type="button"
            onClick={() => setActiveLang("en")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold font-sans transition-all cursor-pointer ${
              activeLang === "en"
                ? "bg-g1 text-white shadow-xs"
                : "text-dark/60 hover:text-dark"
            }`}
          >
            🇬🇧 English
          </button>
        </div>
      </div>

      {/* Editor Box */}
      <div className="w-full bg-white rounded-2xl border border-white-80 overflow-hidden shadow-xs focus-within:border-g1 focus-within:ring-2 focus-within:ring-g1/20 transition-all">
        {/* Toolbar Header */}
        <div className="px-3 py-2 bg-white-90 border-b border-white-80 flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            title="Bold"
            onClick={() => handleFormat("b")}
            className="size-8 rounded-lg hover:bg-white text-dark/70 hover:text-dark font-bold flex items-center justify-center text-sm transition-colors cursor-pointer"
          >
            B
          </button>
          <button
            type="button"
            title="Italic"
            onClick={() => handleFormat("i")}
            className="size-8 rounded-lg hover:bg-white text-dark/70 hover:text-dark italic font-serif flex items-center justify-center text-sm transition-colors cursor-pointer"
          >
            I
          </button>
          <button
            type="button"
            title="Underline"
            onClick={() => handleFormat("u")}
            className="size-8 rounded-lg hover:bg-white text-dark/70 hover:text-dark underline flex items-center justify-center text-sm transition-colors cursor-pointer"
          >
            U
          </button>

          <div className="w-px h-5 bg-white-80 mx-1" />

          <button
            type="button"
            title="Heading 2"
            onClick={() => handleFormat("h2")}
            className="px-2 h-8 rounded-lg hover:bg-white text-dark/70 hover:text-dark font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
          >
            H2
          </button>
          <button
            type="button"
            title="Heading 3"
            onClick={() => handleFormat("h3")}
            className="px-2 h-8 rounded-lg hover:bg-white text-dark/70 hover:text-dark font-semibold text-xs flex items-center justify-center transition-colors cursor-pointer"
          >
            H3
          </button>
          <button
            type="button"
            title="Paragraph"
            onClick={() => handleFormat("p")}
            className="px-2 h-8 rounded-lg hover:bg-white text-dark/70 hover:text-dark font-medium text-xs flex items-center justify-center transition-colors cursor-pointer"
          >
            ¶ Paragraf
          </button>

          <div className="w-px h-5 bg-white-80 mx-1" />

          <button
            type="button"
            title="Bullet List"
            onClick={() => handleFormat("ul")}
            className="px-2 h-8 rounded-lg hover:bg-white text-dark/70 hover:text-dark font-medium text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            • List
          </button>
          <button
            type="button"
            title="Numbered List"
            onClick={() => handleFormat("ol")}
            className="px-2 h-8 rounded-lg hover:bg-white text-dark/70 hover:text-dark font-medium text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            1. List
          </button>
          <button
            type="button"
            title="Quote"
            onClick={() => handleFormat("quote")}
            className="px-2 h-8 rounded-lg hover:bg-white text-dark/70 hover:text-dark font-medium text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            “ Kutipan
          </button>
        </div>

        {/* Textarea Input */}
        <textarea
          id="article-content-textarea"
          rows={10}
          value={currentValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={
            activeLang === "id"
              ? "Tuliskan isi artikel dalam Bahasa Indonesia... (Mendukung format HTML dan teks biasa)"
              : "Write article content in English... (Supports HTML and plain text formatting)"
          }
          className="w-full p-4 bg-transparent text-dark text-sm font-normal font-sans placeholder:text-dark/40 outline-none border-none resize-y min-h-55"
        />

        {/* Footer info */}
        <div className="px-4 py-2 bg-white-90/50 border-t border-white-80 flex justify-between items-center text-xs text-dark/50 font-sans">
          <span>
            Sedang mengedit versi:{" "}
            <strong className="text-g1 font-semibold">
              {activeLang === "id" ? "Bahasa Indonesia" : "English"}
            </strong>
          </span>
          <span>{currentValue.length} karakter</span>
        </div>
      </div>
    </div>
  );
}
