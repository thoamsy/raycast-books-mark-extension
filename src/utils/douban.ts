import { DoubanBook, DoubanSearchResponse } from "../types/book";

export const DOUBAN_SEARCH_API = "https://www.douban.com/j/search_suggest";

/**
 * 构建豆瓣搜索 URL
 * @param query 搜索关键词
 * @returns 搜索 URL
 */
export function buildDoubanSearchUrl(query: string): string {
  return `${DOUBAN_SEARCH_API}?q=${encodeURIComponent(query)}`;
}

/**
 * 解析豆瓣搜索响应
 * @param data 原始响应数据
 * @returns 过滤后只包含书籍的结果
 */
export function parseDoubanSearchResponse(data: DoubanSearchResponse): DoubanBook[] {
  // 只返回类型为book的结果
  return data.cards.filter((card) => card.type === "book");
}
