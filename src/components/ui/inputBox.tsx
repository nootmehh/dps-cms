"use client";

import { useState, useId, type InputHTMLAttributes, type ReactNode } from "react";
import LordIcon from "../common/lordIcon";
import InfoButton from "./infoButton";

export interface InputBoxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  info?: string;
  labelInfo?: ReactNode;
  containerClassName?: string;
  inputWrapperClassName?: string;
  leftIcon?: string | ReactNode;
  rightIcon?: string | ReactNode;
  iconColor?: string;
  iconSize?: number;
}

export default function InputBox({
  label,
  info,
  labelInfo,
  placeholder,
  className = "",
  containerClassName = "",
  inputWrapperClassName = "",
  leftIcon,
  rightIcon,
  iconColor,
  iconSize = 20,
  onFocus,
  onBlur,
  ...props
}: InputBoxProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const uniqueId = useId().replace(/:/g, "-");
  const targetId = `input-box-target-${uniqueId}`;

  const isActive = isHovered || isFocused;
  const pColor = iconColor || (isActive ? "#0A9863" : "#0A9863");
  const sColor = iconColor || (isActive ? "#06d07a" : "#0A9863");

  // Helper to render icon using LordIcon or ReactNode
  const renderIcon = (icon: string | ReactNode) => {
    if (!icon) return null;
    if (typeof icon !== "string") {
      return (
        <div className="shrink-0 flex items-center justify-center">
          {icon}
        </div>
      );
    }

    const cleanName = icon.replace(/\.svg$/i, "").replace(/^\/icons\//i, "");

    return (
      <div className="size-5 relative shrink-0 flex items-center justify-center pointer-events-none transition-colors duration-200">
        <LordIcon
          name={cleanName}
          size={iconSize}
          trigger="hover"
          target={`#${targetId}`}
          primaryColor={pColor}
          secondaryColor={sColor}
        />
      </div>
    );
  };

  const renderLabel = () => {
    if (!label) return null;

    let labelContent: ReactNode = label;
    const labelText = typeof label === "string" ? label : "Informasi";

    if (typeof label === "string" && label.includes("*")) {
      const parts = label.split("*");
      labelContent = (
        <>
          {parts[0]}
          <span className="text-red-state">*</span>
          {parts.slice(1).join("*")}
        </>
      );
    }

    if (info || labelInfo) {
      return (
        <div className="self-stretch flex items-center gap-1.5">
          <label className="text-dark text-sm font-semibold font-sans">
            {labelContent}
          </label>
          {info ? (
            <InfoButton info={info} title={labelText.replace(/\*/g, "").trim()} />
          ) : (
            labelInfo
          )}
        </div>
      );
    }

    return (
      <label className="self-stretch justify-start text-dark text-sm font-semibold font-sans">
        {labelContent}
      </label>
    );
  };

  const defaultMaxWidth = containerClassName.includes("max-w-") ? "" : "max-w-full lg:max-w-116.5";

  return (
    <div className={`w-full ${defaultMaxWidth} inline-flex flex-col justify-start items-start gap-1 ${containerClassName}`}>
      {renderLabel()}
      <div
        id={targetId}
        data-hover-target="true"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group self-stretch h-12 px-3.5 py-2.5 bg-stone-100 rounded-[120px] inline-flex justify-start items-center gap-2.5 border transition-all duration-200 cursor-text ${
          isFocused
            ? "border-g1 bg-white shadow-[0px_2px_6px_0px_rgba(6,137,81,0.2)]"
            : isHovered
            ? "border-g1 opacity-95"
            : "border-transparent hover:border-g1"
        } ${inputWrapperClassName}`}
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
