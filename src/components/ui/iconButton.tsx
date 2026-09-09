"use client";

import React, { type ButtonHTMLAttributes, type AnchorHTMLAttributes } from "react";
import LordIcon from "../common/lordIcon";

export type IconButtonVariant = "fill" | "glass" | "stroke" | "white" | "ghost";
export type IconButtonSize = "default" | "sm" | "lg";

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size"> {
  icon: string;
  iconSize?: number;
  iconColor?: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  href?: string;
  target?: string;
  rel?: string;
  title?: string;
  className?: string;
}

export default function IconButton({
  icon,
  iconSize = 20,
  iconColor,
  variant = "fill",
  size = "default",
  href,
  target,
  rel,
  title,
  disabled,
  className = "",
  onClick,
  ...props
}: IconButtonProps) {
  // Size classes
  const sizeClasses = {
    sm: "size-10",
    default: "size-12",
    lg: "size-14",
  }[size];

  // Variant classes & icon color defaults
  let variantClasses = "";
  let defaultIconColor = "#FFFFFF";

  switch (variant) {
    case "glass":
      variantClasses =
        "bg-white/20 text-white border border-white/30 hover:bg-white/30 hover:opacity-80 active:opacity-60";
      defaultIconColor = "#FFFFFF";
      break;
    case "stroke":
      variantClasses =
        "bg-transparent text-g1 border border-g1 hover:bg-g1/10 hover:opacity-80 active:bg-g1/20";
      defaultIconColor = "#0A9863";
      break;
    case "white":
      variantClasses =
        "bg-white text-g1 border border-white-80 hover:border-g1/40 shadow-xs hover:bg-white-90 hover:opacity-80 active:opacity-60";
      defaultIconColor = "#0A9863";
      break;
    case "ghost":
      variantClasses =
        "bg-transparent text-g1 border border-transparent hover:border-g1/30 hover:bg-g1/10 hover:opacity-80 active:opacity-60";
      defaultIconColor = "#0A9863";
      break;
    case "fill":
    default:
      variantClasses =
        "bg-g1 text-white border border-g2 hover:opacity-80 active:opacity-60 shadow-none";
      defaultIconColor = "#FFFFFF";
      break;
  }

  const primaryColor = iconColor || defaultIconColor;

  const baseClasses = `group btn-custom btn-icon-custom btn-icon-${variant} ${variantClasses} ${sizeClasses} rounded-full inline-flex items-center justify-center cursor-pointer select-none transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed ${className}`;

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel || (target === "_blank" ? "noreferrer" : undefined)}
        title={title}
        className={baseClasses}
        onClick={onClick as unknown as AnchorHTMLAttributes<HTMLAnchorElement>["onClick"]}
      >
        <LordIcon
          name={icon}
          size={iconSize}
          primaryColor={primaryColor}
          target="a"
        />
      </a>
    );
  }

  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      className={baseClasses}
      onClick={onClick}
      {...props}
    >
      <LordIcon
        name={icon}
        size={iconSize}
        primaryColor={primaryColor}
        target="button"
      />
    </button>
  );
}
