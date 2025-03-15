import { Action, ActionPanel, Color, Grid } from "@raycast/api";
import { BookStatus, StoredBook } from "../types/book";
import { RatingForm } from "./RatingForm";

interface BookItemProps {
  book: StoredBook;
  onBookUpdated: () => void;
  updateBookStatus: (bookId: string, status: BookStatus) => void;
  removeBook: (bookId: string) => void;
  updateBookRating: (bookId: string, rating: number, comment?: string) => void;
}

export function BookItem({ book, onBookUpdated, updateBookStatus, removeBook, updateBookRating }: BookItemProps) {
  // 修改状态的处理函数
  const handleChangeStatus = async (status: BookStatus) => {
    if (book.status === status) return;

    try {
      updateBookStatus(book.id, status);
      onBookUpdated();
    } catch (error) {
      console.error("更新书籍状态失败:", error);
    }
  };

  // 删除书籍的处理函数
  const handleRemoveBook = async () => {
    try {
      removeBook(book.id);
      onBookUpdated();
    } catch (error) {
      console.error("删除书籍失败:", error);
    }
  };

  // 构建子标题文本
  const getSubtitle = () => {
    const parts = book.card_subtitle.split("/");
    if (parts.length > 2) {
      return parts[1].trim() + " - " + parts[2].trim();
    }
    return book.card_subtitle;
  };

  // 构建图书封面的源
  const bookContent = { source: book.cover_url, tintColor: null };

  return (
    <Grid.Item
      content={bookContent}
      title={book.title}
      subtitle={getSubtitle()}
      keywords={[book.title, book.status]}
      actions={
        <ActionPanel>
          <ActionPanel.Section title="书籍操作">
            <Action.Push
              title="评分"
              target={<RatingForm book={book} onRatingUpdated={onBookUpdated} updateBookRating={updateBookRating} />}
            />

            <ActionPanel.Submenu title="修改状态">
              <Action
                title="打算看"
                onAction={() => handleChangeStatus("打算看")}
                icon={{ source: "list.bullet", tintColor: Color.Blue }}
              />
              <Action
                title="正在看"
                onAction={() => handleChangeStatus("正在看")}
                icon={{ source: "book", tintColor: Color.Green }}
              />
              <Action
                title="看完"
                onAction={() => handleChangeStatus("看完")}
                icon={{ source: "checkmark.circle", tintColor: Color.Purple }}
              />
              <Action
                title="放弃"
                onAction={() => handleChangeStatus("放弃")}
                icon={{ source: "xmark.circle", tintColor: Color.Red }}
              />
            </ActionPanel.Submenu>

            <Action
              title="删除"
              style={Action.Style.Destructive}
              onAction={handleRemoveBook}
              shortcut={{ modifiers: ["cmd"], key: "delete" }}
            />
          </ActionPanel.Section>

          <ActionPanel.Section title="其他操作">
            <Action.OpenInBrowser url={book.url} title="在豆瓣中查看" />
            <Action.CopyToClipboard title="复制书名" content={book.title} />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
