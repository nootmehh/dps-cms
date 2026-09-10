"use client";

import { useState, useRef, useEffect } from "react";
import LordIcon from "@/components/common/lordIcon";

export interface SectionHeadingProps {
  number: number;
  title: string;
  info: string;
  badge?: string;
  className?: string;
}

export default function SectionHeading({
  number,
  title,
  info,
  badge,
  className = "",
}: SectionHeadingProps) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside (like dropdown)
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
    <div className={`flex items-center gap-2 relative ${className}`}>
      <span className="text-g1 text-base font-bold font-sans select-none">
        {number}. {title}
      </span>

      {/* Info Popover Anchor */}
      <div className="relative inline-flex items-center" ref={popoverRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`size-7 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
            open
              ? "bg-g1/15 ring-2 ring-g1/30"
              : "hover:bg-g1/10 active:scale-95"
          }`}
          aria-label={`Info tentang ${title}`}
          aria-expanded={open}
        >
          <LordIcon
            name="Info"
            size={18}
            trigger="click"
            primaryColor="#0A9863"
            secondaryColor="#0A9863"
          />
        </button>

        {/* Dropdown-style Popover Panel (No shadow, outline turns g1 on hover) */}
        {open && (
          <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-72 sm:w-84 bg-white border border-white-80 hover:border-g1 rounded-3xl p-4 transition-all duration-200 animate-fadeIn flex flex-col gap-2.5">
            {/* Header with icon and title */}
            <div className="flex items-center gap-2 pb-2 border-b border-white-80">
              <div className="size-6 rounded-full bg-g1/10 flex items-center justify-center shrink-0">
                <LordIcon name="Info" size={14} primaryColor="#0A9863" />
              </div>
              <span className="text-xs font-bold text-dark font-sans tracking-wide">
                Informasi Bagian
              </span>
            </div>

            {/* Content text */}
            <p className="text-xs sm:text-sm text-dark/75 font-sans leading-relaxed">
              {info}
            </p>
          </div>
        )}
      </div>

      {badge && (
        <span className="ml-auto text-xs text-dark/50 font-medium font-sans">
          {badge}
        </span>
      )}
    </div>
  );
}
