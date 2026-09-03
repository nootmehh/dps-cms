import type { ButtonHTMLAttributes, ReactNode } from "react";
import LordIcon from "../common/lordIcon";

export type ButtonVariant =
  | "stroke"
  | "glass"
  | "fill"
  | "ghost-white"
  | "ghost-green"
  | "unique-green"
  | "unique-stroke"
  | "unique-white"
  | "unique-red"
  // Backwards compatibility aliases
  | "primary"
  | "outline-primary"
  | "outline-white"
  | "ghost-primary"
  | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  leftIcon?: string | ReactNode;
  rightIcon?: string | ReactNode;
  variant?: ButtonVariant;
}

export default function Button({
  text,
  leftIcon,
  rightIcon,
  variant = "fill",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  // Map legacy variant names
  const normalizedVariant: ButtonVariant =
    variant === "primary"
      ? "fill"
      : variant === "outline-primary"
      ? "stroke"
      : variant === "ghost-primary"
      ? "ghost-green"
      : variant === "danger"
      ? "unique-red"
      : variant;

  const isUniqueVariant =
    normalizedVariant === "unique-green" ||
    normalizedVariant === "unique-stroke" ||
    normalizedVariant === "unique-white" ||
    normalizedVariant === "unique-red";

  // Determine icon color based on variant
  const getIconColor = () => {
    switch (normalizedVariant) {
      case "fill":
      case "unique-green":
      case "unique-red":
      case "ghost-white":
        return "#ffffff";
      case "stroke":
      case "unique-stroke":
      case "unique-white":
      case "ghost-green":
      default:
        return "#0a9863";
    }
  };

  const iconColor = getIconColor();

  // Helper to render icon using LordIcon
  const renderIcon = (icon: string | ReactNode) => {
    if (!icon) return null;
    if (typeof icon !== "string") return icon;

    // Clean up filename if passed like "Dashboard.svg" or "Dashboard"
    const cleanName = icon.replace(/\.svg$/i, "").replace(/^\/icons\//i, "");

    return (
      <div className="size-6 shrink-0 flex items-center justify-center overflow-hidden">
        <LordIcon
          name={cleanName}
          size={24}
          trigger="hover"
          target="button, a, .btn-custom"
          primaryColor={iconColor}
          secondaryColor={iconColor}
        />
      </div>
    );
  };

  // --- Standard Button Variants ---
  if (!isUniqueVariant) {
    const hasCustomJustify = className.includes("justify-");
    const defaultJustify = hasCustomJustify ? "" : "justify-center";

    return (
      <button
        disabled={disabled}
        className={`btn-custom btn-variant-${normalizedVariant} h-12 px-4 py-3 rounded-[48px] inline-flex items-center gap-2.5 text-sm font-semibold font-sans cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed ${defaultJustify} ${className}`}
        {...props}
      >
        {renderIcon(leftIcon)}
        <span className="leading-6 flex-initial font-semibold text-sm">{text}</span>
        {renderIcon(rightIcon)}
      </button>
    );
  }

  // --- Unique Button Variants (Connected Multi-Segment Pills with gap-0) ---
  return (
    <button
      disabled={disabled}
      className={`group btn-custom btn-variant-${normalizedVariant} inline-flex items-center gap-0 p-0 bg-transparent border-none outline-none cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed transition-all ${className}`}
      {...props}
    >
      {/* Left Icon Pill Segment */}
      {leftIcon && (
        <span className="pill-segment size-12 rounded-full flex items-center justify-center shrink-0">
          {renderIcon(leftIcon)}
        </span>
      )}

      {/* Center Label Pill Segment */}
      <span className="pill-segment h-12 px-5 py-3 rounded-[100px] flex items-center justify-center text-sm font-semibold font-sans text-center leading-normal">
        {text}
      </span>

      {/* Right Icon Pill Segment */}
      {rightIcon && (
        <span className="pill-segment size-12 rounded-full flex items-center justify-center shrink-0">
          {renderIcon(rightIcon)}
        </span>
      )}
    </button>
  );
}