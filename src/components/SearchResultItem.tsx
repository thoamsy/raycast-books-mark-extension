import { Action, ActionPanel, Grid } from "@raycast/api";
import { DoubanBook, StoredBook } from "../types/book";

interface SearchResultItemProps {
  book: DoubanBook;
  onBookAdded: (book: StoredBook) => void;
  addBook: (book: Omit<StoredBook, "id" | "addedAt">) => StoredBook;
}

export function SearchResultItem({ book, onBookAdded, addBook }: SearchResultItemProps) {
  // 添加书籍的处理函数
  const handleAddBook = async (status: "打算看" | "正在看" | "看完") => {
    try {
      const newBook = addBook({
        ...book,
        status,
      });
      onBookAdded(newBook);
    } catch (error) {
      console.error("添加书籍失败:", error);
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
            <Action
              title="添加到「打算看」"
              onAction={() => handleAddBook("打算看")}
              icon={{ source: "list.bullet" }}
            />
            <Action title="添加到「正在看」" onAction={() => handleAddBook("正在看")} icon={{ source: "book" }} />
            <Action
              title="添加到「看完」"
              onAction={() => handleAddBook("看完")}
              icon={{ source: "checkmark.circle" }}
            />
          </ActionPanel.Section>

          <ActionPanel.Section>
            <Action.OpenInBrowser url={book.url} title="在豆瓣中查看" />
            <Action.CopyToClipboard title="复制书名" content={book.title} />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
