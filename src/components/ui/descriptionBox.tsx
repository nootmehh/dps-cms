import { type TextareaHTMLAttributes, type ReactNode } from "react";

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
  ...props
}: DescriptionBoxProps) {
  return (
    <div
      className={`w-full max-w-116.5 inline-flex flex-col justify-start items-start gap-1 ${containerClassName}`}
    >
      {label && (
        <label className="self-stretch justify-start text-g1 text-sm font-semibold font-sans">
          {label}
        </label>
      )}
      <div className="self-stretch px-4 py-3 bg-white rounded-xl border border-g1/30 focus-within:border-g1 focus-within:ring-2 focus-within:ring-g1/15 inline-flex justify-between items-start transition-all gap-2">
        <textarea
          placeholder={placeholder}
          rows={rows}
          className={`w-full bg-transparent text-dark text-sm font-normal font-sans placeholder:text-dark/35 outline-none border-none resize-y min-h-20 ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}