"use client";

import { useState, useRef, useEffect } from "react";
import LordIcon from "@/components/common/lordIcon";

export interface InfoButtonProps {
  info: string;
  title?: string;
  className?: string;
}

export default function InfoButton({
  info,
  title = "Informasi",
  className = "",
}: InfoButtonProps) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={popoverRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={`size-6 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
          open
            ? "bg-g1/15 ring-2 ring-g1/30"
            : "hover:bg-g1/10 active:scale-95"
        }`}
        aria-label={`Info: ${title}`}
        aria-expanded={open}
      >
        <LordIcon
          name="Info"
          size={16}
          trigger="click"
          primaryColor="#0A9863"
          secondaryColor="#0A9863"
        />
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-[calc(100%+6px)] left-0 z-50 w-72 sm:w-80 bg-white border border-white-80 hover:border-g1 rounded-3xl p-4 transition-all duration-200 animate-fadeIn flex flex-col gap-2.5"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-white-80">
            <div className="size-6 rounded-full bg-g1/10 flex items-center justify-center shrink-0">
              <LordIcon name="Info" size={14} primaryColor="#0A9863" />
            </div>
            <span className="text-xs font-bold text-dark font-sans tracking-wide">
              {title}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-dark/75 font-sans leading-relaxed">
            {info}
          </p>
        </div>
      )}
    </div>
  );
}
