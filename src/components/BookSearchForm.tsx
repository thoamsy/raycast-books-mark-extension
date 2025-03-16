import { useState, useEffect } from "react";
import { Action, ActionPanel, Form, useNavigation, showToast, Toast, showHUD, PopToRootType } from "@raycast/api";
import { BookFormValues, BookStatuses, DoubanBook, DoubanSearchResponse, StoredBook } from "../types/book";
import { useFetch } from "@raycast/utils";
import { buildDoubanSearchUrl, parseDoubanSearchResponse } from "../utils/douban";
import { useBooks } from "../hooks/useBooks";

// 用于防抖的延迟时间
const DEBOUNCE_DELAY = 300;

interface BookSearchFormProps {
  onBookAdded?: (book: StoredBook) => void;
  addBook?: (book: Omit<StoredBook, "id" | "addedAt">) => StoredBook;
}

export function BookSearchForm({ onBookAdded, addBook: externalAddBook }: BookSearchFormProps) {
  const { pop } = useNavigation();
  const { addBook: internalAddBook } = useBooks();

  // 使用外部传入的 addBook 或内部的 addBook
  const addBook = externalAddBook || internalAddBook;

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState<DoubanBook | undefined>();

  // 对输入查询进行防抖处理
  useEffect(() => {
    const trimmedQuery = query.trim();
    const timer = setTimeout(() => {
      setDebouncedQuery(trimmedQuery);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [query]);

  // 使用 useFetch 进行搜索
  const searchUrl = debouncedQuery ? buildDoubanSearchUrl(debouncedQuery) : "";

  const { data: responseData, isLoading: fetchLoading } = useFetch<DoubanSearchResponse>(searchUrl, {
    execute: Boolean(debouncedQuery),
    keepPreviousData: false,
  });

  // 解析搜索结果
  const searchResultsData = responseData ? parseDoubanSearchResponse(responseData) : [];

  const handleSubmit = async (values: BookFormValues) => {
    if (!selectedBook) {
      showToast({
        style: Toast.Style.Failure,
        title: "无法添加",
        message: "请先选择一本书",
      });
      return;
    }

    try {
      const newBook = addBook({
        ...selectedBook,
        status: values.status,
      });

      if (onBookAdded) {
        onBookAdded(newBook);
      }

      if (typeof externalAddBook === "function") {
        pop();
        showToast({
          style: Toast.Style.Success,
          title: "添加成功",
          message: `已添加《${selectedBook.title}》`,
        });
      } else {
        showHUD(`已添加《${selectedBook.title}》`, {
          popToRootType: PopToRootType.Immediate,
        });
      }
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "添加失败",
        message: `无法添加《${selectedBook.title}》`,
      });
    }
  };

  return (
    <Form
      isLoading={fetchLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="添加书籍" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Description text="搜索并添加新书" />

      <Form.TextField id="query" title="书名" placeholder="输入书名搜索..." value={query} onChange={setQuery} />

      {searchResultsData.length > 0 && (
        <Form.Dropdown
          id="book"
          title="搜索结果"
          onChange={(value) => {
            const selected = searchResultsData.find((book) => book.url === value);
            setSelectedBook(selected);
          }}
        >
          {searchResultsData.map((book) => (
            <Form.Dropdown.Item key={book.url} value={book.url} title={book.title} icon={book.cover_url} />
          ))}
        </Form.Dropdown>
      )}

      <Form.Dropdown id="status" title="状态" defaultValue="reading">
        {Object.entries(BookStatuses).map(([key, status]) => (
          <Form.Dropdown.Item key={key} value={status.value} title={status.label} icon={status.icon} />
        ))}
      </Form.Dropdown>
    </Form>
  );
}
