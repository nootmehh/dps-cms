"use client";

import { useState } from "react";
import LordIcon from "@/components/common/lordIcon";

export interface GalleryCardProps {
  imageSrc?: string;
  title: string;
  location?: string;
  onDelete?: () => void;
  className?: string;
}

export default function GalleryCard({
  imageSrc = "https://placehold.co/320x220",
  title,
  location,
  onDelete,
  className = "",
}: GalleryCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`w-full h-56 relative rounded-3xl shadow-[0px_2px_4px_0px_rgba(6,137,81,0.25)] border border-white-70 overflow-hidden group select-none cursor-pointer transition-all duration-300 ${className}`}
    >
      {/* Background Image with Zoom on Hover */}
      <img
        className={`size-full object-cover transition-transform duration-300 ease-out group-hover:scale-105 ${
          isHovered ? "scale-105" : "scale-100"
        }`}
        src={imageSrc}
        alt={title}
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            "https://placehold.co/400x250/png?text=Proyek+DPS";
        }}
      />

      {/* Black Gradient Overlay (appears on hover) */}
      <div
        style={{
          background:
            "linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.35) 50%, transparent 100%)",
        }}
        className={`absolute inset-0 transition-opacity duration-300 ease-out flex flex-col justify-end p-5 pointer-events-none group-hover:opacity-100 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Title & Category Slide-up from Bottom */}
        <div
          className={`transition-transform duration-300 ease-out flex flex-col justify-end gap-1 group-hover:translate-y-0 ${
            isHovered ? "translate-y-0" : "translate-y-3"
          }`}
        >
          <h3 className="text-white text-base font-bold font-sans leading-tight line-clamp-1 drop-shadow-sm">
            {title}
          </h3>
          {location && (
            <p className="text-white/90 text-xs sm:text-sm font-normal font-sans line-clamp-1 drop-shadow-sm">
              {location}
            </p>
          )}
        </div>
      </div>

      {/* Action Delete Button (appears on hover) */}
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className={`absolute top-3 right-3 size-8 rounded-full bg-red-state hover:bg-red-state/90 border border-red-300 text-white flex items-center justify-center transition-all duration-200 shadow-md active:scale-95 cursor-pointer z-20 group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto ${
            isHovered ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-90 pointer-events-none"
          }`}
          title="Hapus foto galeri"
        >
          <LordIcon name="Delete" size={16} primaryColor="#FFFFFF" secondaryColor="#FFFFFF" />
        </button>
      )}
    </div>
  );
}
