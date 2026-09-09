"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/button";
import InputBox from "@/components/ui/inputBox";
import DescriptionBox from "@/components/ui/descriptionBox";
import LordIcon from "@/components/common/lordIcon";
import { type PageMetaRow } from "@/services/seoApi";

export interface EditPageMetaModalProps {
  isOpen: boolean;
  pageMeta: PageMetaRow | null;
  onSave: (updated: PageMetaRow) => Promise<void>;
  onClose: () => void;
}

export default function EditPageMetaModal({
  isOpen,
  pageMeta,
  onSave,
  onClose,
}: EditPageMetaModalProps) {
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (pageMeta) {
      setMetaTitle(pageMeta.meta_title || "");
      setMetaDescription(pageMeta.meta_description || "");
      setKeywords(pageMeta.keywords || "");
    }
  }, [pageMeta]);

  if (!isOpen || !pageMeta) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        ...pageMeta,
        meta_title: metaTitle,
        meta_description: metaDescription,
        keywords: keywords,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg p-6 bg-white rounded-4xl outline -outline-offset-1 outline-slate-200 flex flex-col justify-start items-start gap-6 shadow-2xl animate-scale-in"
      >
        {/* Title Bar */}
        <div className="self-stretch flex justify-between items-start">
          <div className="flex-1 flex flex-col justify-start items-start gap-1">
            <div className="text-dark/50 text-xs font-semibold font-sans tracking-wider uppercase">
              EDIT META HALAMAN
            </div>
            <div className="text-dark text-xl font-bold font-sans">
              {pageMeta.page_name}{" "}
              <span className="text-sm font-mono text-g1/80 font-normal">
                ({pageMeta.route_path})
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all cursor-pointer flex items-center justify-center"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Divider */}
        <div className="self-stretch h-px bg-slate-200" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="self-stretch flex flex-col gap-4">
          {/* Meta Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-dark/70 font-sans">
              Meta Title Halaman
            </label>
            <InputBox
              placeholder="Contoh: Beranda - Dua Putra Srikandi"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
            />
          </div>

          {/* Meta Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-dark/70 font-sans">
              Meta Description Halaman
            </label>
            <DescriptionBox
              placeholder="Ringkasan deskripsi halaman untuk mesin pencari Google..."
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
            />
          </div>

          {/* Keywords */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-dark/70 font-sans">
              Kata Kunci (Keywords)
            </label>
            <InputBox
              placeholder="marka jalan, kontraktor jalan, perlengkapan jalan"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>

          {/* Divider */}
          <div className="self-stretch h-px bg-slate-200 mt-2" />

          {/* Action Buttons */}
          <div className="self-stretch flex justify-end items-center gap-3 pt-2">
            <Button
              type="button"
              text="Batal"
              variant="ghost-green"
              onClick={onClose}
              disabled={isSubmitting}
            />
            <Button
              type="submit"
              text={isSubmitting ? "Menyimpan..." : "Simpan Meta"}
              variant="fill"
              disabled={isSubmitting}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
