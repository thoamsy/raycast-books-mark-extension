import { useState, useEffect } from "react";
import { Action, ActionPanel, Form, useNavigation } from "@raycast/api";
import { BookFormValues, DoubanBook, DoubanSearchResponse, StoredBook } from "../types/book";
import { useFetch } from "@raycast/utils";
import { buildDoubanSearchUrl, parseDoubanSearchResponse } from "../utils/douban";

// 用于防抖的延迟时间
const DEBOUNCE_DELAY = 300;

interface BookSearchFormProps {
  onBookAdded?: (book: StoredBook) => void;
  addBook: (book: Omit<StoredBook, "id" | "addedAt">) => StoredBook;
}

export function BookSearchForm({ onBookAdded, addBook }: BookSearchFormProps) {
  const { pop } = useNavigation();
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

  const { data: responseData, isLoading } = useFetch<DoubanSearchResponse>(searchUrl, {
    execute: Boolean(debouncedQuery),
    keepPreviousData: false,
  });

  // 解析搜索结果
  const searchResults = responseData ? parseDoubanSearchResponse(responseData) : [];

  const handleSubmit = async (values: BookFormValues) => {
    if (!selectedBook) {
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

      pop();
    } catch (error) {
      console.error("添加书籍失败:", error);
    }
  };

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="添加书籍" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Description text="搜索并添加新书" />

      <Form.TextField id="query" title="书名" placeholder="输入书名搜索..." value={query} onChange={setQuery} />

      {searchResults.length > 0 && (
        <Form.Dropdown
          id="book"
          title="搜索结果"
          onChange={(value) => {
            const selected = searchResults.find((book) => book.url === value);
            setSelectedBook(selected);
          }}
        >
          {searchResults.map((book) => (
            <Form.Dropdown.Item key={book.url} value={book.url} title={book.title} icon={book.cover_url} />
          ))}
        </Form.Dropdown>
      )}

      <Form.Dropdown id="status" title="状态" defaultValue="正在看">
        <Form.Dropdown.Item value="打算看" title="打算看" />
        <Form.Dropdown.Item value="正在看" title="正在看" />
        <Form.Dropdown.Item value="看完" title="看完" />
        <Form.Dropdown.Item value="放弃" title="放弃" />
      </Form.Dropdown>
    </Form>
  );
}
