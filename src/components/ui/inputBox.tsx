import { type InputHTMLAttributes, type ReactNode } from "react";

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
  ...props
}: InputBoxProps) {
  // Helper to render icon
  const renderIcon = (icon: string | ReactNode, iconClass: string = "bg-dark") => {
    if (!icon) return null;
    if (typeof icon !== "string") return icon;

    const formattedName = icon.endsWith(".svg") ? icon : `${icon}.svg`;
    const iconSrc = icon.startsWith("/") ? icon : `/icons/${formattedName}`;

    return (
      <div className="size-5 relative shrink-0 flex items-center justify-center pointer-events-none">
        <span
          style={{
            maskImage: `url("${iconSrc}")`,
            WebkitMaskImage: `url("${iconSrc}")`,
          }}
          className={`size-4 ${iconClass} mask-contain mask-no-repeat mask-center shrink-0 inline-block`}
          aria-hidden="true"
        />
      </div>
    );
  };

  return (
    <div className={`w-full max-w-[466px] inline-flex flex-col justify-start items-start gap-1 ${containerClassName}`}>
      {label && (
        <label className="self-stretch justify-start text-dark text-sm font-semibold font-sans">
          {label}
        </label>
      )}
      <div className="self-stretch h-12 px-3 py-2.5 bg-brand-background rounded-[120px] inline-flex justify-start items-center gap-3 border border-transparent focus-within:border-g1/40 focus-within:ring-2 focus-within:ring-g1/20 transition-all">
        {renderIcon(leftIcon, "bg-dark")}
        <input
          placeholder={placeholder}
          className={`w-full bg-transparent text-dark text-sm font-normal font-sans placeholder:text-dark/40 outline-none border-none ${className}`}
          {...props}
        />
        {renderIcon(rightIcon, "bg-dark/60")}
      </div>
    </div>
  );
}
