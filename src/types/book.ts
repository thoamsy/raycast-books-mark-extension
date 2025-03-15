import { Color, Icon, type Image } from "@raycast/api";

export type BookStatusValue = "plan_to_read" | "reading" | "finished" | "abandoned";

export interface BookStatusConfig {
  label: string;
  value: BookStatusValue;
  icon: Image.ImageLike;
}

export const BookStatuses: Record<BookStatusValue, BookStatusConfig> = {
  plan_to_read: {
    label: "打算看",
    value: "plan_to_read",
    icon: { source: Icon.List, tintColor: Color.Blue },
  },
  reading: {
    label: "正在看",
    value: "reading",
    icon: { source: Icon.Book, tintColor: Color.Green },
  },
  finished: {
    label: "看完",
    value: "finished",
    icon: { source: Icon.Checkmark, tintColor: Color.Purple },
  },
  abandoned: {
    label: "放弃",
    value: "abandoned",
    icon: { source: Icon.XMarkCircle, tintColor: Color.Red },
  },
};

// 辅助函数
export function getStatusByLabel(label: string): BookStatusValue | undefined {
  const status = Object.values(BookStatuses).find((s) => s.label === label);
  return status?.value;
}

export function getStatusConfig(value: BookStatusValue): BookStatusConfig {
  return BookStatuses[value];
}

export function getAllStatuses(): BookStatusConfig[] {
  return Object.values(BookStatuses);
}

export interface DoubanBook {
  title: string;
  url: string;
  abstract: string;
  cover_url: string;
  card_subtitle: string;
  type: string;
}

export interface DoubanSearchResponse {
  q: string;
  cards: DoubanBook[];
  words: string[];
}

export interface StoredBook extends DoubanBook {
  id: string;
  status: BookStatusValue;
  addedAt: number;
  rating?: number;
  comment?: string;
  updatedAt?: number;
}

export interface BookFormValues {
  query: string;
  status: BookStatusValue;
}

export interface RatingFormValues {
  rating: string;
  comment: string;
}
