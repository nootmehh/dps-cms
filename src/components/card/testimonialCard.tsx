"use client";

import { useState } from "react";
import LordIcon from "@/components/common/lordIcon";

export interface TestimonialCardProps {
  quote: string;
  name: string;
  role?: string;
  company?: string;
  onDelete?: () => void;
  className?: string;
}

export default function TestimonialCard({
  quote,
  name,
  role,
  company,
  onDelete,
  className = "",
}: TestimonialCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const displayRole = role
    ? company
      ? `${role} • ${company}`
      : role
    : company || "";

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-hover-target="true"
      style={{
        border: isHovered ? "1.5px solid #0A9863" : "1.5px solid var(--color-white-70, #e9e9e9)",
      }}
      className={`group relative w-full h-60 p-6 bg-brand-background rounded-3xl flex flex-col justify-between items-start shrink-0 shadow-xs hover:shadow-md transition-all duration-200 select-none cursor-pointer ${className}`}
    >
      {/* Header: Quote Icon & Delete Action */}
      <div className="w-full flex items-center justify-between">
        <div className="size-10 flex items-center justify-center">
          <LordIcon
            name="Quote"
            size={40}
            primaryColor="#0A9863"
            trigger="hover"
            target="[data-hover-target]"
          />
        </div>

        {/* Delete Action Button (appears on hover) */}
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className={`size-8 rounded-full bg-red-state hover:bg-red-state/90 border border-red-300 text-white flex items-center justify-center transition-all duration-200 shadow-md active:scale-95 cursor-pointer z-20 group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto ${
              isHovered
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-90 pointer-events-none"
            }`}
            title="Hapus testimoni"
          >
            <LordIcon name="Delete" size={16} primaryColor="#FFFFFF" secondaryColor="#FFFFFF" />
          </button>
        )}
      </div>

      {/* Quote text */}
      <p className="text-dark text-sm font-normal font-sans line-clamp-3 leading-relaxed">
        &ldquo;{quote}&rdquo;
      </p>

      {/* Author Row with Emerald Accent Bar */}
      <div className="w-full flex items-center gap-3">
        <div className="w-0.5 h-8 bg-g1 rounded-full shrink-0" />
        <div className="flex-1 flex flex-col justify-start items-start min-w-0">
          <span className="text-g1 text-sm font-semibold font-sans truncate w-full">
            {name}
          </span>
          {displayRole && (
            <span className="text-dark/75 text-xs font-normal font-sans truncate w-full">
              {displayRole}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
