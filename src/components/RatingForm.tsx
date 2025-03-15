import { useState } from "react";
import { Action, ActionPanel, Form, useNavigation } from "@raycast/api";
import { RatingFormValues, StoredBook } from "../types/book";

interface RatingFormProps {
  book: StoredBook;
  onRatingUpdated?: () => void;
  updateBookRating?: (bookId: string, rating: number, comment?: string) => void;
}

export function RatingForm({ book, onRatingUpdated, updateBookRating }: RatingFormProps) {
  const { pop } = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: RatingFormValues) => {
    if (!updateBookRating) return;

    setIsSubmitting(true);
    try {
      updateBookRating(book.id, Number(values.rating), values.comment);

      if (onRatingUpdated) {
        onRatingUpdated();
      }

      pop();
    } catch (error) {
      console.error("更新评分失败:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form
      isLoading={isSubmitting}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="提交评分" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Description text={`为《${book.title}》评分`} />

      <Form.Dropdown id="rating" title="评分" defaultValue={book.rating?.toString() || "3"}>
        <Form.Dropdown.Item value="1" title="⭐️ - 很差" />
        <Form.Dropdown.Item value="2" title="⭐️⭐️ - 较差" />
        <Form.Dropdown.Item value="3" title="⭐️⭐️⭐️ - 一般" />
        <Form.Dropdown.Item value="4" title="⭐️⭐️⭐️⭐️ - 不错" />
        <Form.Dropdown.Item value="5" title="⭐️⭐️⭐️⭐️⭐️ - 很棒" />
      </Form.Dropdown>

      <Form.TextArea
        id="comment"
        title="评论"
        placeholder="写下你对这本书的感想（可选）"
        defaultValue={book.comment || ""}
      />
    </Form>
  );
}
