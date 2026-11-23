// Shapes returned by the backend API (see karshachamling-backend/src/app/schemas.py)

export type Status = "draft" | "published";

export interface Media {
  id: number;
  filename: string;
  mime_type: string;
  width: number;
  height: number;
  size_bytes: number;
  alt: string;
  alt_bo: string;
  source_url: string | null;
  created_at: string;
  url: string;
  urls: { sm: string; md: string; lg: string; original: string };
}

export interface Content {
  id: number;
  slug: string;
  title: string;
  title_bo: string;
  summary: string;
  summary_bo: string;
  body: string;
  body_bo: string;
  status: Status;
  cover_image_id: number | null;
  cover_image: Media | null;
  created_at: string;
  updated_at: string;
}

export interface News extends Content {
  published_at: string | null;
}

export interface Event extends Content {
  start_at: string;
  end_at: string | null;
  location: string;
  location_bo: string;
}

export interface GuideSection extends Content {
  position: number;
}

export type Page = Content;

export interface Paginated<T> {
  items: T[];
  total: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: "admin" | "editor";
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Donation {
  id: number;
  source: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  amount_paise: number;
  currency: string;
  donor_name: string;
  donor_email: string;
  donor_phone: string;
  donor_pan: string;
  donor_address: string;
  message: string;
  status: "created" | "paid" | "failed";
  created_at: string;
  paid_at: string | null;
}

export interface Dashboard {
  news_published: number;
  news_drafts: number;
  upcoming_events: number;
  guide_sections: number;
  media_count: number;
  unread_messages: number;
  donations_paid_count: number | null;
  donations_paid_total_paise: number | null;
}
