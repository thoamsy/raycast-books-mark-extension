import { Action, ActionPanel, Grid, showToast, Toast } from "@raycast/api";
import { BookStatusValue, BookStatuses, DoubanBook, StoredBook } from "../types/book";

interface SearchResultItemProps {
  book: DoubanBook;
  onBookAdded: (book: StoredBook) => void;
  addBook: (book: Omit<StoredBook, "id" | "addedAt">) => StoredBook;
}

export function SearchResultItem({ book, onBookAdded, addBook }: SearchResultItemProps) {
  // 添加书籍的处理函数
  const handleAddBook = async (status: BookStatusValue) => {
    try {
      const newBook = addBook({
        ...book,
        status,
      });
      onBookAdded(newBook);
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "添加失败",
        message: `无法添加《${book.title}》`,
      });
    }
  };

  return (
    <Grid.Item
      content={{ source: book.cover_url, tintColor: null }}
      title={book.title}
      subtitle={book.card_subtitle}
      actions={
        <ActionPanel>
          <ActionPanel.Section title="添加书籍">
            {Object.entries(BookStatuses).map(([key, status]) => (
              <Action
                key={key}
                title={`添加到「${status.label}」`}
                onAction={() => handleAddBook(status.value)}
                icon={status.icon}
              />
            ))}
          </ActionPanel.Section>

          <ActionPanel.Section>
            <Action.OpenInBrowser shortcut={{ modifiers: ["cmd"], key: "o" }} url={book.url} title="在豆瓣中查看" />
            <Action.CopyToClipboard
              shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
              title="复制书名"
              content={book.title}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
