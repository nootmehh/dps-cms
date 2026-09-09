"use client";

import { useState, type TextareaHTMLAttributes, type ReactNode } from "react";

export interface DescriptionBoxProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "placeholder"> {
  label?: ReactNode;
  placeholder?: string;
  containerClassName?: string;
}

export default function DescriptionBox({
  label,
  placeholder,
  className = "",
  containerClassName = "",
  rows = 4,
  onFocus,
  onBlur,
  ...props
}: DescriptionBoxProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={`w-full max-w-116.5 inline-flex flex-col justify-start items-start gap-1 ${containerClassName}`}
    >
      {label && (
        <label className="self-stretch justify-start text-dark text-sm font-semibold font-sans">
          {label}
        </label>
      )}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`self-stretch px-4 py-3 bg-brand-background rounded-2xl border inline-flex justify-between items-start transition-all duration-200 gap-2 cursor-text ${
          isFocused
            ? "border-g1 shadow-[0px_2px_6px_0px_rgba(6,137,81,0.2)]"
            : isHovered
            ? "border-g1 opacity-95"
            : "border-transparent hover:border-g1"
        }`}
      >
        <textarea
          placeholder={placeholder}
          rows={rows}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          className={`w-full bg-transparent text-dark text-sm font-normal font-sans placeholder:text-dark/40 outline-none border-none resize-y min-h-20 ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}