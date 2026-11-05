export type Admin = { id: string; name: string; email: string };
export type AuthSession = { access_token: string; token_type: "Bearer"; expires_in: number; admin: Admin };
export type PostStatus = "draft" | "published";
export type Post = {
  id: string; title: string; slug: string; excerpt: string | null; body: string;
  cover_image_url: string | null; video_url: string | null;
  attachment_url: string | null; attachment_name: string | null;
  status: PostStatus; published_at: string | null; created_at: string; updated_at: string;
};
export type PostInput = { title: string; excerpt?: string; body: string; cover_image_url?: string; video_url?: string; attachment_url?: string; attachment_name?: string; status: PostStatus };
export type Comment = {
  id: string; post_id: string; author_name: string; author_email?: string; body: string;
  status: "pending" | "approved" | "rejected"; created_at: string;
  post?: { id: string; title: string; slug: string };
};
export type PublicComment = { id: string; post_id: string; author_name: string; body: string; created_at: string };
export type Paginated<T> = { data: T[]; current_page: number; last_page: number; per_page: number; total: number };

export type PublicationType = "article" | "book" | "chapter" | "thesis" | "conference" | "report";
export type PublicationStatus = "draft" | "published";
export type Publication = {
  id: string;
  title: string;
  type: PublicationType;
  publisher: string | null;
  year: number | null;
  url: string | null;
  abstract: string | null;
  status: PublicationStatus;
  created_at: string;
  updated_at: string;
};
export type PublicationInput = {
  title: string;
  type?: PublicationType;
  publisher?: string;
  year?: number | null;
  url?: string;
  abstract?: string;
  status?: PublicationStatus;
};

export type AchievementType = "award" | "grant" | "fellowship" | "recognition" | "appointment";
export type Achievement = {
  id: string;
  title: string;
  type: AchievementType;
  institution: string | null;
  year: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};
export type AchievementInput = {
  title: string;
  type?: AchievementType;
  institution?: string;
  year?: number | null;
  description?: string;
};

export type SiteSetting = {
  id: number;
  hero_image_url: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_cta: string | null;
  updated_at: string;
};
