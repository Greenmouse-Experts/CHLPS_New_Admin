interface AvatarColor {
  bg: string;
  text: string;
}

const AVATAR_PALETTE: AvatarColor[] = [
  { bg: "#1e293b", text: "#94a3b8" },
  { bg: "#1e1b4b", text: "#a5b4fc" },
  { bg: "#0c1f3f", text: "#7dabf8" },
  { bg: "#082f49", text: "#7dd3fc" },
  { bg: "#134e4a", text: "#5eead4" },
  { bg: "#1a2e1f", text: "#86c79a" },
  { bg: "#2e1065", text: "#c4b5fd" },
  { bg: "#3b0764", text: "#e9d5ff" },
  { bg: "#3f1d2b", text: "#f0a8bd" },
  { bg: "#1c1917", text: "#d6d3d1" },
  { bg: "#164e63", text: "#67e8f9" },
  { bg: "#27272a", text: "#a1a1aa" },
];

function hashString(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return Math.abs(hash);
}

export function getAvatarColor(seed: string): AvatarColor {
  if (!seed) return AVATAR_PALETTE[0];
  const index = hashString(seed) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[index];
}

export type { AvatarColor };
