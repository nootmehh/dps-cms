import type { ButtonHTMLAttributes, ReactNode } from "react";

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

  // Helper to render icon
  const renderIcon = (icon: string | ReactNode) => {
    if (!icon) return null;
    if (typeof icon !== "string") return icon;

    const formattedName = icon.endsWith(".svg") ? icon : `${icon}.svg`;
    const iconSrc = icon.startsWith("/") ? icon : `/icons/${formattedName}`;

    return (
      <div className="size-6 relative shrink-0 flex items-center justify-center pointer-events-none">
        <span
          style={{
            maskImage: `url("${iconSrc}")`,
            WebkitMaskImage: `url("${iconSrc}")`,
          }}
          className="size-5 bg-current mask-contain mask-no-repeat mask-center shrink-0 inline-block transition-transform duration-200"
          aria-hidden="true"
        />
      </div>
    );
  };

  // --- Standard Button Variants ---
  if (!isUniqueVariant) {
    return (
      <button
        disabled={disabled}
        className={`btn-custom btn-variant-${normalizedVariant} h-12 px-4 py-3 rounded-[48px] inline-flex justify-center items-center gap-2.5 text-sm font-semibold font-sans cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed ${className}`}
        {...props}
      >
        {renderIcon(leftIcon)}
        <span className="leading-none text-center">{text}</span>
        {renderIcon(rightIcon)}
      </button>
    );
  }

  // --- Unique Button Variants (Segmented Connected Pill with 0-Gap) ---
  return (
    <button
      disabled={disabled}
      className={`btn-custom btn-variant-${normalizedVariant} h-12 rounded-[48px] inline-flex justify-center items-center gap-0 cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {leftIcon && (
        <div className="pill-segment size-12 p-3 rounded-[100px] flex justify-center items-center shrink-0">
          {renderIcon(leftIcon)}
        </div>
      )}

      <div className="pill-segment h-12 px-4 py-3 rounded-[100px] flex justify-center items-center gap-2.5 overflow-hidden">
        <span className="justify-start text-sm font-semibold font-sans leading-none">
          {text}
        </span>
      </div>

      {rightIcon && (
        <div className="pill-segment size-12 p-3 rounded-[100px] flex justify-center items-center shrink-0">
          {renderIcon(rightIcon)}
        </div>
      )}
    </button>
  );
}