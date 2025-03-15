import { Action, ActionPanel, Grid, Icon, showToast, Toast } from "@raycast/api";
import { BookStatusValue, BookStatuses, getStatusConfig, StoredBook } from "../types/book";
import { RatingForm } from "./RatingForm";

interface BookItemProps {
  book: StoredBook;
  onBookUpdated: () => void;
  updateBookStatus: (bookId: string, status: BookStatusValue) => void;
  removeBook: (bookId: string) => void;
  updateBookRating: (bookId: string, rating: number, comment?: string) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetColumns: () => void;
}

export function BookItem({
  book,
  onBookUpdated,
  updateBookStatus,
  removeBook,
  updateBookRating,
  zoomIn,
  zoomOut,
  resetColumns,
}: BookItemProps) {
  // 获取当前状态配置
  const statusConfig = getStatusConfig(book.status);

  // 修改状态的处理函数
  const handleChangeStatus = async (status: BookStatusValue) => {
    if (book.status === status) return;

    try {
      updateBookStatus(book.id, status);
      onBookUpdated();
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "更新状态失败",
        message: `无法将《${book.title}》状态更新为${getStatusConfig(status).label}`,
      });
    }
  };

  // 删除书籍的处理函数
  const handleRemoveBook = async () => {
    try {
      removeBook(book.id);
      onBookUpdated();
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "删除失败",
        message: `无法删除《${book.title}》`,
      });
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
      keywords={[book.title, statusConfig.label]}
      accessory={{ icon: statusConfig.icon }}
      actions={
        <ActionPanel>
          <ActionPanel.Section title="书籍操作">
            <Action.Push
              title="评分 ⭐"
              target={<RatingForm book={book} onRatingUpdated={onBookUpdated} updateBookRating={updateBookRating} />}
            />

            <ActionPanel.Submenu title="修改状态">
              {Object.entries(BookStatuses).map(([key, status]) => (
                <Action
                  key={key}
                  title={status.label}
                  onAction={() => handleChangeStatus(status.value)}
                  icon={status.icon}
                  autoFocus={book.status !== status.value}
                />
              ))}
            </ActionPanel.Submenu>

            <Action
              title="放大"
              icon={Icon.ArrowsExpand}
              shortcut={{ modifiers: ["cmd"], key: "=" }}
              onAction={zoomOut}
            />
            <Action
              title="缩小"
              icon={Icon.ArrowsContract}
              shortcut={{ modifiers: ["cmd"], key: "-" }}
              onAction={zoomIn}
            />
            <Action
              title="重置"
              icon={Icon.ArrowCounterClockwise}
              shortcut={{ modifiers: ["cmd"], key: "0" }}
              onAction={resetColumns}
            />

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
