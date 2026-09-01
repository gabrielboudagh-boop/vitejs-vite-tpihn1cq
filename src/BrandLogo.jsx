import { useState } from "react";

function resolveConfiguredLogoSrc() {
  if (typeof window === "undefined") return "/logo.svg";
  const raw = window.localStorage.getItem("vimavima_logo_src") || "/logo.svg";
  const value = raw.trim();
  if (value.startsWith("<svg")) {
    return `data:image/svg+xml;utf8,${encodeURIComponent(value)}`;
  }
  return value;
}

export default function BrandLogo({
  alt = "VIMA VIMA",
  dark = false,
  height = 28,
  width,
  fallbackSrc = "",
  style = {},
}) {
  const [src, setSrc] = useState(() => resolveConfiguredLogoSrc());
  const [showTextFallback, setShowTextFallback] = useState(false);

  const onError = () => {
    if (fallbackSrc && src !== fallbackSrc) {
      setSrc(fallbackSrc);
      return;
    }
    setShowTextFallback(true);
  };

  if (showTextFallback) {
    return (
      <span
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: dark ? "#dce8ff" : "#0a0d1a",
          letterSpacing: "-0.3px",
          ...style,
        }}
      >
        VIMA VIMA
      </span>
    );
  }

  const sizeStyle = width ? { width, height: "auto" } : { height };
  const useLegacyFilter = dark && !!fallbackSrc && src === fallbackSrc;

  return (
    <img
      src={src}
      alt={alt}
      onError={onError}
      style={{
        display: "block",
        filter: useLegacyFilter ? "invert(1) brightness(1.1)" : "none",
        ...sizeStyle,
        ...style,
      }}
    />
  );
}
