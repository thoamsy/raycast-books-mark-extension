import { BookStatusValue, StoredBook } from "../types/book";
import { nanoid } from "nanoid";

export const BOOKS_STORAGE_KEY = "stored-books";

/**
 * 添加一本新书
 */
export function addBookToStore(
  books: StoredBook[],
  book: Omit<StoredBook, "id" | "addedAt">,
): [StoredBook[], StoredBook] {
  // 检查书是否已存在
  const existingBookIndex = books.findIndex((b) => b.url === book.url);

  const newBook: StoredBook = {
    ...book,
    id: nanoid(),
    addedAt: Date.now(),
  };

  if (existingBookIndex >= 0) {
    // 更新已存在的书
    const updatedBooks = [...books];
    updatedBooks[existingBookIndex] = {
      ...newBook,
      id: books[existingBookIndex].id,
      addedAt: books[existingBookIndex].addedAt,
      updatedAt: Date.now(),
    };
    return [updatedBooks, updatedBooks[existingBookIndex]];
  } else {
    // 添加新书
    return [[...books, newBook], newBook];
  }
}

/**
 * 更新一本书的状态
 */
export function updateBookStatusInStore(books: StoredBook[], bookId: string, status: BookStatusValue): StoredBook[] {
  return books.map((book) => {
    if (book.id === bookId) {
      return { ...book, status, updatedAt: Date.now() };
    }
    return book;
  });
}

/**
 * 更新一本书的评分和评论
 */
export function updateBookRatingInStore(
  books: StoredBook[],
  bookId: string,
  rating: number,
  comment?: string,
): StoredBook[] {
  return books.map((book) => {
    if (book.id === bookId) {
      return {
        ...book,
        rating,
        comment,
        updatedAt: Date.now(),
      };
    }
    return book;
  });
}

/**
 * 删除一本书
 */
export function removeBookFromStore(books: StoredBook[], bookId: string): StoredBook[] {
  return books.filter((book) => book.id !== bookId);
}

/**
 * 根据状态过滤书籍
 */
export function filterBooksByStatus(books: StoredBook[], status?: BookStatusValue): StoredBook[] {
  if (!status) {
    return books;
  }

  return books.filter((book) => book.status === status);
}

/**
 * 在书籍列表中搜索
 */
export function searchBooksInStore(books: StoredBook[], query: string): StoredBook[] {
  if (!query.trim()) {
    return books;
  }

  const lowerQuery = query.toLowerCase();

  return books.filter(
    (book) => book.title.toLowerCase().includes(lowerQuery) || book.card_subtitle.toLowerCase().includes(lowerQuery),
  );
}
