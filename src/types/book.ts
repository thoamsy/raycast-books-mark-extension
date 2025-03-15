export type BookStatus = "打算看" | "正在看" | "看完" | "放弃";

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
  status: BookStatus;
  addedAt: number;
  rating?: number;
  comment?: string;
  updatedAt?: number;
}

export interface BookFormValues {
  query: string;
  status: BookStatus;
}

export interface RatingFormValues {
  rating: string;
  comment: string;
}
