const NAME_PARTICLES = new Set([
  "de",
  "del",
  "della",
  "der",
  "di",
  "da",
  "das",
  "dos",
  "du",
  "la",
  "le",
  "van",
  "von",
  "bin",
  "al",
  "el",
  "ibn",
  "st",
  "st.",
]);

function splitWords(name: string): string[] {
  return name.trim().replace(/\s+/g, " ").split(" ").filter(Boolean);
}

function capitalizeWord(word: string): string {
  return word
    .split("-")
    .map((segment) =>
      segment
        .split("'")
        .map((part, i, parts) => {
          const lower = part.toLowerCase();
          if (i > 0 && parts[0].toLowerCase() === "o") {
            return lower.charAt(0).toUpperCase() + lower.slice(1);
          }
          if (lower.startsWith("mac") && lower.length > 5) {
            return "Mac" + lower.charAt(3).toUpperCase() + lower.slice(4);
          }
          if (lower.startsWith("mc") && lower.length > 2) {
            return "Mc" + lower.charAt(2).toUpperCase() + lower.slice(3);
          }
          return lower.charAt(0).toUpperCase() + lower.slice(1);
        })
        .join("'"),
    )
    .join("-");
}

export function formatName(name: string | null | undefined): string {
  if (!name) return "";
  const words = splitWords(name);

  return words
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index > 0 && NAME_PARTICLES.has(lower)) return lower;
      return capitalizeWord(word);
    })
    .join(" ");
}

export function getInitials(
  name: string | null | undefined,
  count = 2,
): string {
  const words = splitWords(name ?? "");
  if (words.length === 0) return "";

  return words
    .slice(0, count)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

export function getFirstName(name: string | null | undefined): string {
  const words = splitWords(name ?? "");
  return words[0] ? formatName(words[0]) : "";
}

export function getLastName(name: string | null | undefined): string {
  const words = splitWords(name ?? "");
  return words.length > 1 ? formatName(words.slice(1).join(" ")) : "";
}

export function maskName(name: string | null | undefined): string {
  const words = splitWords(name ?? "");
  if (words.length === 0) return "";
  if (words.length === 1) return formatName(words[0]);
  const first = formatName(words[0]);
  const lastInitial = words[words.length - 1].charAt(0).toUpperCase();
  return `${first} ${lastInitial}.`;
}

export function truncateName(
  name: string | null | undefined,
  maxLength = 20,
): string {
  const formatted = formatName(name);
  if (formatted.length <= maxLength) return formatted;
  const truncated = formatted.slice(0, maxLength).trim();
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + "…";
}

export function toUsernameSlug(name: string | null | undefined): string {
  return splitWords(name ?? "")
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
}
