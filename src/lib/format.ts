import { isAxiosError } from "axios";

export function messageFor(error: unknown): string {
  if (isAxiosError(error)) {
    return typeof error.response?.data?.message === "string"
      ? error.response.data.message
      : "Could not reach the journal API. Check the connection and try again.";
  }

  return "Something went wrong. Please try again.";
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&[a-zA-Z]+;/g, " ").replace(/\s+/g, " ").trim();
}

export function excerpt(value: string): string {
  const text = stripHtml(value).replace(/[#*_`]/g, "");
  return text.length > 90 ? `${text.slice(0, 90)}…` : text;
}

export function readingTime(body: string): number {
  return Math.max(1, Math.ceil(body.trim().split(/\s+/).filter(Boolean).length / 220));
}

/** Extracts the first <img src="..."> from an HTML string — used as OG image fallback. */
export function firstImageSrc(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? null;
}

/** Truncates plain text to at most `max` characters for meta descriptions. */
export function metaDescription(html: string, max = 160): string {
  const text = stripHtml(html).replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}