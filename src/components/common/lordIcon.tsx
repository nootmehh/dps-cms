"use client";

import { useEffect, useState, type CSSProperties } from "react";

// Name mapping to lord-icons files in public/lord-icons
export const LORD_ICON_MAP: Record<string, string> = {
  // Navigation & Menu
  Dashboard: "/lord-icons/system-outline-153-bar-chart-vertical-grow-hover-pinch.json",
  Category: "/lord-icons/system-outline-153-bar-chart-vertical-grow-hover-pinch.json",
  User: "/lord-icons/system-outline-44-avatar-circle-hover-pinch.json",
  Profile: "/lord-icons/system-outline-44-avatar-circle-hover-pinch.json",
  Global: "/lord-icons/system-outline-458-target-center-hover-pinch.json",
  SEO: "/lord-icons/system-outline-458-target-center-hover-pinch.json",
  Document: "/lord-icons/system-outline-4040-spinner-four-squares-hover-tubes.json",
  Content: "/lord-icons/system-outline-4040-spinner-four-squares-hover-tubes.json",
  Square: "/lord-icons/system-outline-4040-spinner-four-squares-hover-tubes.json",
  Squares: "/lord-icons/system-outline-4040-spinner-four-squares-hover-tubes.json",
  Setting: "/lord-icons/system-outline-187-briefcase-hover-pinch.json",
  Services: "/lord-icons/system-outline-187-briefcase-hover-pinch.json",
  Box: "/lord-icons/system-outline-2870-shopping-bag-hover-pinch.json",
  Product: "/lord-icons/system-outline-2870-shopping-bag-hover-pinch.json",
  Paper: "/lord-icons/system-outline-4062-pencil-line-hover-pinch.json",
  Article: "/lord-icons/system-outline-4062-pencil-line-hover-pinch.json",
  "Image 2": "/lord-icons/system-outline-54-image-mountain-hover-pinch.json",
  Media: "/lord-icons/system-outline-54-image-mountain-hover-pinch.json",

  // Actions
  Logout: "/lord-icons/system-outline-1725-person-exit-hover-pinch.json",
  Exit: "/lord-icons/system-outline-1725-person-exit-hover-pinch.json",
  Delete: "/lord-icons/system-outline-185-trash-bin-morph-fill.json",
  Trash: "/lord-icons/system-outline-185-trash-bin-morph-fill.json",
  Edit: "/lord-icons/system-outline-4062-pencil-line-hover-pinch.json",
  Add: "/lord-icons/system-outline-48-plus-hover-pinch.json",
  Plus: "/lord-icons/system-outline-48-plus-hover-pinch.json",
  Eye: "/lord-icons/system-outline-69-eye-morph-cross.json",
  Close: "/lord-icons/system-outline-185-trash-bin-morph-fill.json",
  Attachment: "/lord-icons/system-outline-4062-pencil-line-hover-pinch.json",

  // Directional
  "Right 1": "/lord-icons/system-outline-230-arrow-right-hover-slide.json",
  Right: "/lord-icons/system-outline-230-arrow-right-hover-slide.json",
  "Left 1": "/lord-icons/system-outline-2753-arrow-left-hover-slide.json",
  Left: "/lord-icons/system-outline-2753-arrow-left-hover-slide.json",
  "Down 2": "/lord-icons/system-outline-33-chevron-down-hover-pinch.json",
  Down: "/lord-icons/system-outline-33-chevron-down-hover-pinch.json",
  Up: "/lord-icons/system-outline-34-chevron-up-hover-pinch.json",
};

export interface LordIconProps {
  name?: string;
  src?: string;
  trigger?: "hover" | "click" | "loop" | "loop-on-hover" | "morph" | "boomerang" | "in";
  target?: string;
  colors?: {
    primary?: string;
    secondary?: string;
  };
  primaryColor?: string;
  secondaryColor?: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

let isElementRegistered = false;

export default function LordIcon({
  name,
  src,
  trigger = "hover",
  target,
  colors,
  primaryColor,
  secondaryColor,
  size = 24,
  className = "",
  style,
}: LordIconProps) {
  const [ready, setReady] = useState(isElementRegistered);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!isElementRegistered) {
        import("@lordicon/element")
          .then(({ defineElement }) => {
            defineElement();
            isElementRegistered = true;
            setReady(true);
          })
          .catch((err) => {
            console.error("Failed to load @lordicon/element", err);
          });
      } else {
        setReady(true);
      }
    }
  }, []);

  const iconSrc = src || (name ? LORD_ICON_MAP[name] || name : "");

  const pColor = primaryColor || colors?.primary || "#0A9863";
  const sColor = secondaryColor || colors?.secondary || pColor;
  const colorAttr = `primary:${pColor},secondary:${sColor}`;

  if (!ready || !iconSrc) {
    return (
      <span
        style={{ width: `${size}px`, height: `${size}px` }}
        className={`inline-flex shrink-0 ${className}`}
      />
    );
  }

  return (
    // @ts-expect-error lord-icon custom web component
    <lord-icon
      src={iconSrc}
      trigger={trigger}
      target={target || "button, a, [data-hover-target], .group, .btn-custom"}
      colors={colorAttr}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
      className={`shrink-0 ${className}`}
    />
  );
}
