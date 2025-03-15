import { useCallback } from "react";
import { useLocalStorage } from "@raycast/utils";
import { BookStatusValue, StoredBook } from "../types/book";
import {
  BOOKS_STORAGE_KEY,
  addBookToStore,
  updateBookStatusInStore,
  updateBookRatingInStore,
  removeBookFromStore,
  filterBooksByStatus,
  searchBooksInStore,
} from "../store/bookStore";

export function useBooks() {
  // 使用 useLocalStorage 来管理书籍数据
  const { value: books = [], setValue: setBooks } = useLocalStorage<StoredBook[]>(BOOKS_STORAGE_KEY, []);

  // 添加一本新书
  const addBook = useCallback(
    (book: Omit<StoredBook, "id" | "addedAt">) => {
      const [newBooks, newBook] = addBookToStore(books, book);
      setBooks(newBooks);
      return newBook;
    },
    [books, setBooks],
  );

  // 更新一本书的状态
  const updateBookStatus = useCallback(
    (bookId: string, status: BookStatusValue) => {
      setBooks(updateBookStatusInStore(books, bookId, status));
    },
    [books, setBooks],
  );

  // 更新一本书的评分和评论
  const updateBookRating = useCallback(
    (bookId: string, rating: number, comment?: string) => {
      setBooks(updateBookRatingInStore(books, bookId, rating, comment));
    },
    [books, setBooks],
  );

  // 删除一本书
  const removeBook = useCallback(
    (bookId: string) => {
      setBooks(removeBookFromStore(books, bookId));
    },
    [books, setBooks],
  );

  // 获取某状态的书籍
  const getBooksByStatus = useCallback(
    (status?: BookStatusValue) => {
      return filterBooksByStatus(books, status);
    },
    [books],
  );

  // 搜索书籍
  const searchBooks = useCallback(
    (query: string) => {
      return searchBooksInStore(books, query);
    },
    [books],
  );

  return {
    books,
    addBook,
    updateBookStatus,
    updateBookRating,
    removeBook,
    getBooksByStatus,
    searchBooks,
  };
}
