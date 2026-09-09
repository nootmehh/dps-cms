"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import LordIcon from "../common/lordIcon";

export interface InputBoxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  containerClassName?: string;
  leftIcon?: string | ReactNode;
  rightIcon?: string | ReactNode;
}

export default function InputBox({
  label,
  placeholder,
  className = "",
  containerClassName = "",
  leftIcon,
  rightIcon,
  onFocus,
  onBlur,
  ...props
}: InputBoxProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isActive = isHovered || isFocused;
  const iconColor = isActive ? "#0A9863" : "#110D31";

  // Helper to render icon using LordIcon
  const renderIcon = (icon: string | ReactNode) => {
    if (!icon) return null;
    if (typeof icon !== "string") return icon;

    const cleanName = icon.replace(/\.svg$/i, "").replace(/^\/icons\//i, "");

    return (
      <div className="size-5 relative shrink-0 flex items-center justify-center pointer-events-none transition-colors duration-200">
        <LordIcon
          name={cleanName}
          size={18}
          trigger="hover"
          target="[data-hover-target]"
          primaryColor={iconColor}
          secondaryColor={iconColor}
        />
      </div>
    );
  };

  return (
    <div className={`w-full max-w-116.5 inline-flex flex-col justify-start items-start gap-1 ${containerClassName}`}>
      {label && (
        <label className="self-stretch justify-start text-dark text-sm font-semibold font-sans">
          {label}
        </label>
      )}
      <div
        data-hover-target="true"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group self-stretch h-12 px-3.5 py-2.5 bg-brand-background rounded-[120px] inline-flex justify-start items-center gap-3 border transition-all duration-200 cursor-text ${
          isFocused
            ? "border-g1 shadow-[0px_2px_6px_0px_rgba(6,137,81,0.2)]"
            : isHovered
            ? "border-g1 opacity-95"
            : "border-transparent hover:border-g1"
        }`}
      >
        {renderIcon(leftIcon)}
        <input
          placeholder={placeholder}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          className={`w-full bg-transparent text-dark text-sm font-normal font-sans placeholder:text-dark/40 outline-none border-none ${className}`}
          {...props}
        />
        {renderIcon(rightIcon)}
      </div>
    </div>
  );
}
