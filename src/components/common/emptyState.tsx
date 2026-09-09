"use client";

import React, { useId } from "react";
import LordIcon from "./lordIcon";

export interface EmptyStateProps {
  iconName?: string;
  iconSize?: number;
  primaryColor?: string;
  secondaryColor?: string;
  text?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function EmptyState({
  iconName = "StorageBox",
  iconSize = 64,
  primaryColor = "#0A9863",
  secondaryColor = "#ffc738",
  text = "Belum ada data yang tersedia saat ini.",
  className = "",
  children,
}: EmptyStateProps) {
  const uniqueId = useId().replace(/:/g, "-");
  const containerId = `empty-state-${uniqueId}`;

  return (
    <div
      id={containerId}
      data-hover-target="true"
      className={`group w-full pt-24 sm:pt-28 pb-16 px-6 flex flex-col items-center justify-center text-center gap-3 transition-all duration-200 select-none cursor-pointer ${className}`}
    >
      {/* 1 LordIcon 64px (Animates when hovering over the empty state) */}
      <LordIcon
        name={iconName}
        size={iconSize}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        trigger="hover"
        target={`#${containerId}`}
      />

      {/* 1 Text */}
      {text && (
        <p className="text-dark/60 text-sm sm:text-base font-medium font-sans max-w-md">
          {text}
        </p>
      )}

      {/* Action Slot */}
      {children && <div className="pt-1">{children}</div>}
    </div>
  );
}
