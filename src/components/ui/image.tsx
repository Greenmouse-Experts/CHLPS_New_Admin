"use client";

import { useEffect, useState } from "react";
import NextImage from "next/image";
import { cn } from "@/lib/tokens";
import { getInitials } from "@/utils/helper/formate_name";
import { getAvatarColor } from "@/utils/avatar.colors";

type ImageSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

interface ProfileImageProps {
  src?: string | null;
  name?: string | null;
  alt?: string;
  size?: ImageSize | number;
  shape?: "circle" | "square";
  priority?: boolean;
  unoptimized?: boolean;
  className?: string;
}

const sizeMap: Record<ImageSize, { box: string; text: string; px: number }> = {
  xs: { box: "w-6 h-6", text: "text-2xs", px: 24 },
  sm: { box: "w-8 h-8", text: "text-xs", px: 32 },
  md: { box: "w-10 h-10", text: "text-sm", px: 40 },
  lg: { box: "w-12 h-12", text: "text-base", px: 48 },
  xl: { box: "w-16 h-16", text: "text-xl", px: 64 },
  "2xl": { box: "w-20 h-20", text: "text-2xl", px: 80 },
};

function ProfileImage({
  src,
  name,
  alt,
  size = "md",
  shape = "circle",
  priority = false,
  unoptimized = false,
  className,
}: ProfileImageProps) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [src]);

  const isCustomSize = typeof size === "number";
  const preset = isCustomSize ? null : sizeMap[size];
  const pxSize = isCustomSize ? size : preset!.px;

  const trimmedSrc = src?.trim() || "";
  const showFallback = !trimmedSrc || failed;

  const radius = shape === "circle" ? "rounded-full" : "rounded-lg";
  const dimensionClass = isCustomSize ? "" : preset!.box;
  const dimensionStyle = isCustomSize
    ? { width: pxSize, height: pxSize }
    : undefined;

  const altText = alt ?? (name ? `${name}'s profile photo` : "Profile photo");

  if (showFallback) {
    const initial = getInitials(name ?? "", 1) || "?";
    const { bg, text } = getAvatarColor(name?.trim() || trimmedSrc || "user");

    return (
      <div
        role="img"
        aria-label={altText}
        className={cn(
          "flex items-center justify-center font-semibold shrink-0 select-none",
          radius,
          dimensionClass,
          !isCustomSize && preset!.text,
          className,
        )}
        style={{ backgroundColor: bg, color: text, ...dimensionStyle }}
      >
        {initial}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden shrink-0",
        radius,
        dimensionClass,
        className,
      )}
      style={dimensionStyle}
    >
      <NextImage
        src={trimmedSrc}
        alt={altText}
        fill
        sizes={`${pxSize}px`}
        priority={priority}
        unoptimized={unoptimized}
        className="object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// AppImage — a general-purpose, highly customisable image component
// Falls back to a coloured container with centred initials when the image
// cannot be loaded (broken URL, 404, empty src, etc.)
// ---------------------------------------------------------------------------

type AppImageShape =
  | "circle"
  | "square"
  | "rounded-sm"
  | "rounded"
  | "rounded-md"
  | "rounded-lg"
  | "rounded-xl"
  | "rounded-2xl"
  | "none";

type AppImageObjectFit = "cover" | "contain" | "fill";

interface AppImageProps {
  /** Image URL. Falls back to initials when absent, empty, or broken. */
  src?: string | null;
  /** Alt text for accessibility. */
  alt?: string;
  /**
   * Explicit initials to show on the fallback (e.g. "AZ").
   * When omitted, initials are derived from `name`.
   */
  initials?: string;
  /**
   * Name used to auto-generate initials and pick a deterministic
   * fallback background colour.
   */
  name?: string | null;
  /** Preset size token — resolves to equal width & height. */
  size?: ImageSize | number;
  /** Explicit width in px (overrides `size` width). */
  width?: number;
  /** Explicit height in px (overrides `size` height). */
  height?: number;
  /** Border-radius style. Defaults to "rounded-md". */
  shape?: AppImageShape;
  /** How the image fills its container. Defaults to "cover". */
  objectFit?: AppImageObjectFit;
  /** Extra classes applied to the outer container. */
  className?: string;
  /** Extra classes applied to the `<img>` element (image-only). */
  imgClassName?: string;
  /** Extra classes applied to the fallback container (fallback-only). */
  fallbackClassName?: string;
  /** Override the fallback background colour (hex / css colour). */
  fallbackBg?: string;
  /** Override the fallback text / initials colour. */
  fallbackColor?: string;
  /** Next.js priority hint. */
  priority?: boolean;
  /** Disable Next.js image optimisation. */
  unoptimized?: boolean;
}

const appSizeMap: Record<ImageSize, { box: string; text: string; px: number }> =
  {
    xs: { box: "w-6 h-6", text: "text-[10px]", px: 24 },
    sm: { box: "w-8 h-8", text: "text-xs", px: 32 },
    md: { box: "w-10 h-10", text: "text-sm", px: 40 },
    lg: { box: "w-12 h-12", text: "text-base", px: 48 },
    xl: { box: "w-16 h-16", text: "text-xl", px: 64 },
    "2xl": { box: "w-20 h-20", text: "text-2xl", px: 80 },
  };

const shapeClassMap: Record<AppImageShape, string> = {
  circle: "rounded-full",
  square: "rounded-none",
  "rounded-sm": "rounded-sm",
  rounded: "rounded",
  "rounded-md": "rounded-md",
  "rounded-lg": "rounded-lg",
  "rounded-xl": "rounded-xl",
  "rounded-2xl": "rounded-2xl",
  none: "",
};

const objectFitClassMap: Record<AppImageObjectFit, string> = {
  cover: "object-cover",
  contain: "object-contain",
  fill: "object-fill",
};

function AppImage({
  src,
  alt,
  initials,
  name,
  size = "md",
  width,
  height,
  shape = "rounded-md",
  objectFit = "cover",
  className,
  imgClassName,
  fallbackClassName,
  fallbackBg,
  fallbackColor,
  priority = false,
  unoptimized = false,
}: AppImageProps) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [src]);

  const isPresetSize = typeof size !== "number";
  const preset = isPresetSize ? appSizeMap[size as ImageSize] : null;

  // Resolve dimensions
  const resolvedWidth = width ?? (preset?.px ?? (size as number));
  const resolvedHeight = height ?? (preset?.px ?? (size as number));
  const isSquare = resolvedWidth === resolvedHeight;

  const dimensionClass =
    !width && !height && preset ? preset.box : "";
  const dimensionStyle: React.CSSProperties =
    width || height || !preset
      ? { width: resolvedWidth, height: resolvedHeight }
      : {};

  const trimmedSrc = src?.trim() || "";
  const showFallback = !trimmedSrc || failed;
  const radiusClass = shapeClassMap[shape];
  const altText = alt ?? name ?? "Image";

  if (showFallback) {
    // Derive initials: explicit > from name > first char of src filename > "?"
    const derivedInitials =
      initials?.trim() ||
      (name ? getInitials(name, 2) : "") ||
      trimmedSrc.split("/").pop()?.charAt(0)?.toUpperCase() ||
      "?";

    const seed = name?.trim() || initials?.trim() || trimmedSrc || "img";
    const { bg, text } = getAvatarColor(seed);

    return (
      <div
        role="img"
        aria-label={altText}
        className={cn(
          "flex items-center justify-center font-semibold shrink-0 select-none overflow-hidden",
          radiusClass,
          dimensionClass,
          preset && isSquare ? preset.text : "text-sm",
          fallbackClassName,
          className,
        )}
        style={{
          backgroundColor: fallbackBg ?? bg,
          color: fallbackColor ?? text,
          ...dimensionStyle,
        }}
      >
        {derivedInitials}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden shrink-0",
        radiusClass,
        dimensionClass,
        className,
      )}
      style={dimensionStyle}
    >
      <NextImage
        src={trimmedSrc}
        alt={altText}
        fill
        sizes={`${resolvedWidth}px`}
        priority={priority}
        unoptimized={unoptimized}
        className={cn(objectFitClassMap[objectFit], imgClassName)}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export { ProfileImage, AppImage };
export type { ProfileImageProps, ImageSize, AppImageProps, AppImageShape };
