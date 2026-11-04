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

export function excerpt(value: string): string {
  const text = value.replace(/[#*_`>]/g, "").replace(/\s+/g, " ").trim();
  return text.length > 78 ? `${text.slice(0, 78)}…` : text;
}

export function readingTime(body: string): number {
  return Math.max(1, Math.ceil(body.trim().split(/\s+/).filter(Boolean).length / 220));
}