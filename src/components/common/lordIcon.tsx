"use client";

import { useEffect, useState, type CSSProperties } from "react";

// Name mapping to lord-icons files in public/lord-icons/system and public/lord-icons/lineal
export const LORD_ICON_MAP: Record<string, string> = {
  // Navigation & Menu
  Dashboard: "/lord-icons/system/system-outline-153-bar-chart-vertical-grow-hover-pinch.json",
  Category: "/lord-icons/system/system-outline-153-bar-chart-vertical-grow-hover-pinch.json",
  Hamburger: "/lord-icons/system/system-outline-4172-menu-hamburger-morph-cross.json",
  HamburgerMorph: "/lord-icons/system/system-outline-4172-menu-hamburger-morph-cross.json",
  Menu: "/lord-icons/system/system-outline-4172-menu-hamburger-morph-cross.json",
  User: "/lord-icons/system/system-outline-44-avatar-circle-hover-pinch.json",
  Profile: "/lord-icons/system/system-outline-44-avatar-circle-hover-pinch.json",
  Global: "/lord-icons/system/system-outline-458-target-center-hover-pinch.json",
  SEO: "/lord-icons/system/system-outline-458-target-center-hover-pinch.json",
  Document: "/lord-icons/system/system-outline-4040-spinner-four-squares-hover-tubes.json",
  Content: "/lord-icons/system/system-outline-4040-spinner-four-squares-hover-tubes.json",
  Square: "/lord-icons/system/system-outline-4040-spinner-four-squares-hover-tubes.json",
  Squares: "/lord-icons/system/system-outline-4040-spinner-four-squares-hover-tubes.json",
  Setting: "/lord-icons/system/system-outline-187-briefcase-hover-pinch.json",
  Services: "/lord-icons/system/system-outline-187-briefcase-hover-pinch.json",
  Box: "/lord-icons/system/system-outline-2870-shopping-bag-hover-pinch.json",
  Product: "/lord-icons/system/system-outline-2870-shopping-bag-hover-pinch.json",
  Paper: "/lord-icons/system/system-outline-4062-pencil-line-hover-pinch.json",
  Article: "/lord-icons/system/system-outline-4062-pencil-line-hover-pinch.json",
  "Image 2": "/lord-icons/system/system-outline-54-image-mountain-hover-pinch.json",
  Media: "/lord-icons/system/system-outline-54-image-mountain-hover-pinch.json",

  // Actions
  Logout: "/lord-icons/system/system-outline-1725-person-exit-hover-pinch.json",
  Exit: "/lord-icons/system/system-outline-1725-person-exit-hover-pinch.json",
  Delete: "/lord-icons/system-outline-185-trash-bin-morph-fill.json",
  Trash: "/lord-icons/system-outline-185-trash-bin-morph-fill.json",
  Edit: "/lord-icons/system/system-outline-4062-pencil-line-hover-pinch.json",
  Add: "/lord-icons/system/system-outline-48-plus-hover-pinch.json",
  Plus: "/lord-icons/system/system-outline-48-plus-hover-pinch.json",
  Eye: "/lord-icons/system/system-outline-69-eye-morph-cross.json",
  Close: "/lord-icons/system/system-outline-185-trash-bin-morph-fill.json",
  Attachment: "/lord-icons/system/system-outline-4062-pencil-line-hover-pinch.json",
  Search: "/lord-icons/system/system-outline-19-magnifier-morph-select.json",
  Clock: "/lord-icons/system/system-outline-45-clock-morph-select.json",
  CheckCircle: "/lord-icons/system/system-outline-24-check-circle-morph-select.json",
  CheckCircleSelect: "/lord-icons/system/system-outline-24-check-circle-morph-select.json",
  CheckCircleTick: "/lord-icons/system/system-outline-24-check-circle-morph-tick.json",
  CrossCircle: "/lord-icons/system/system-outline-25-cross-circle-hover-pinch.json",
  Cross: "/lord-icons/system/system-outline-25-cross-circle-hover-pinch.json",
  X: "/lord-icons/system/system-outline-25-cross-circle-hover-pinch.json",
  Figures: "/lord-icons/system/system-outline-372-figures-hover-pinch.json",
  Target: "/lord-icons/system/system-outline-458-target-center-hover-pinch.json",
  Goal: "/lord-icons/system/system-outline-458-target-center-hover-pinch.json",
  Info: "/lord-icons/system/system-outline-367-info-circle-hover-pinch.json",
  InfoCircle: "/lord-icons/system/system-outline-367-info-circle-hover-pinch.json",

  // Directional
  "Right 1": "/lord-icons/system/system-outline-230-arrow-right-hover-slide.json",
  Right: "/lord-icons/system/system-outline-230-arrow-right-hover-slide.json",
  "Left 1": "/lord-icons/system/system-outline-2753-arrow-left-hover-slide.json",
  Left: "/lord-icons/system/system-outline-2753-arrow-left-hover-slide.json",
  "Down 2": "/lord-icons/system/system-outline-33-chevron-down-hover-pinch.json",
  Down: "/lord-icons/system/system-outline-33-chevron-down-hover-pinch.json",
  ChevronDown: "/lord-icons/system/system-outline-33-chevron-down-hover-pinch.json",
  Up: "/lord-icons/system/system-outline-34-chevron-up-hover-pinch.json",
  ChevronUp: "/lord-icons/system/system-outline-34-chevron-up-hover-pinch.json",

  // Lineal / Illustration icons
  Quote: "/lord-icons/lineal/wired-lineal-15-quote-left-hover-pinch.json",
  ThumbsUp: "/lord-icons/lineal/wired-lineal-760-thumb-up-stars-hover-pinch.json",
  Road: "/lord-icons/lineal/wired-lineal-3369-road-traffic-cone-hover-pinch.json",
  Bucket: "/lord-icons/lineal/wired-lineal-1428-paint-bucket-hover-pinch.json",
  Check: "/lord-icons/lineal/wired-lineal-37-check-hover-pinch.json",
  Wheelbarrow: "/lord-icons/lineal/wired-lineal-1823-wheelbarrow-hover-pinch.json",
  WheelBarrow: "/lord-icons/lineal/wired-lineal-1823-wheelbarrow-hover-pinch.json",
  PaintBucket: "/lord-icons/lineal/wired-lineal-769-paint-bucket-hover-pinch.json",
  StorageBox: "/lord-icons/lineal/wired-lineal-988-storage-box-morph-open.json",
  "storage-box": "/lord-icons/lineal/wired-lineal-988-storage-box-morph-open.json",
  PhoneQuestion: "/lord-icons/lineal/wired-lineal-3600-phone-question-hover-calling.json",
  "phone-question": "/lord-icons/lineal/wired-lineal-3600-phone-question-hover-calling.json",
  RoadNavigation: "/lord-icons/lineal/wired-lineal-3367-road-navigation-hover-pinch.json",
  "road-navigation": "/lord-icons/lineal/wired-lineal-3367-road-navigation-hover-pinch.json",
  Signature: "/lord-icons/lineal/wired-lineal-1019-file-signature-hover-pinch.json",
  signature: "/lord-icons/lineal/wired-lineal-1019-file-signature-hover-pinch.json",
  BrushAlt: "/lord-icons/lineal/wired-lineal-762-brush-alt-hover-pinch.json",
  "brush-alt": "/lord-icons/lineal/wired-lineal-762-brush-alt-hover-pinch.json",
  Handshake: "/lord-icons/lineal/wired-lineal-456-handshake-hover-pinch.json",
  handshake: "/lord-icons/lineal/wired-lineal-456-handshake-hover-pinch.json",
};

export interface LordIconProps {
  name?: string;
  src?: string;
  trigger?: "hover" | "click" | "loop" | "loop-on-hover" | "morph" | "boomerang" | "in";
  target?: string;
  colors?: {
    primary?: string;
    secondary?: string;
    tertiary?: string;
    quaternary?: string;
  };
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  quaternaryColor?: string;
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
  tertiaryColor,
  quaternaryColor,
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

  const iconSrc =
    src ||
    (name
      ? LORD_ICON_MAP[name] ||
        (name.startsWith("/") || name.startsWith("http") ? name : "")
      : "");

  const pColor = primaryColor || colors?.primary || "#0A9863";
  const sColor = secondaryColor || colors?.secondary;
  const tColor = tertiaryColor || colors?.tertiary;
  const qColor = quaternaryColor || colors?.quaternary;
  const colorParts = [`primary:${pColor}`];
  if (sColor) colorParts.push(`secondary:${sColor}`);
  if (tColor) colorParts.push(`tertiary:${tColor}`);
  if (qColor) colorParts.push(`quaternary:${qColor}`);
  const colorAttr = colorParts.join(",");

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
