import { useState, useEffect, useCallback } from "react";
import { ActionPanel, Action, Grid, showToast, Toast, Icon, Color } from "@raycast/api";
import { BookStatus, StoredBook } from "./types/book";
import { BookItem } from "./components/BookItem";
import { BookSearchForm } from "./components/BookSearchForm";
import { useBookSearch } from "./hooks/useBookSearch";
import { SearchResultItem } from "./components/SearchResultItem";
import { useBooks } from "./hooks/useBooks";

export default function Command() {
  const [searchText, setSearchText] = useState("");
  const [books, setBooks] = useState<StoredBook[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<BookStatus | undefined>(undefined);

  // 使用 useBooks 钩子获取书籍数据和操作方法
  const {
    books: allBooks,
    getBooksByStatus,
    addBook,
    updateBookStatus,
    updateBookRating,
    removeBook,
    searchBooks,
  } = useBooks();

  // 使用自定义钩子进行搜索
  const { localResults, remoteBooks, isLoadingRemote, hasRemoteResults } = useBookSearch(searchText, searchBooks);

  // 处理书籍更新 - 不再需要实际操作，因为 useBooks 已自动更新状态
  const handleBookUpdated = useCallback(() => {
    // 钩子内部会更新状态
  }, []);

  // 处理添加新书
  const handleBookAdded = useCallback((newBook: StoredBook) => {
    showToast({
      style: Toast.Style.Success,
      title: "添加成功",
      message: `《${newBook.title}》已添加`,
    });
  }, []);

  // 根据搜索文本和选中状态过滤书籍
  useEffect(() => {
    if (searchText.trim()) {
      setBooks(localResults);
    } else if (selectedStatus) {
      setBooks(getBooksByStatus(selectedStatus));
    } else {
      setBooks(allBooks);
    }
  }, [searchText, localResults, selectedStatus, allBooks, getBooksByStatus]);

  // 构建网格部分
  const renderSections = () => {
    const sections = [];

    // 如果有远程搜索结果，添加搜索结果部分
    if (hasRemoteResults && searchText.trim()) {
      sections.push(
        <Grid.Section aspectRatio="2/3" fit={Grid.Fit.Fill} title="搜索结果" key="search-results">
          {remoteBooks.map((book) => (
            <SearchResultItem key={book.url} book={book} onBookAdded={handleBookAdded} addBook={addBook} />
          ))}
        </Grid.Section>,
      );
    }

    // 如果没有选中状态，按状态分组显示
    if (!selectedStatus && !searchText.trim()) {
      // 获取各状态的书籍
      const planToRead = allBooks.filter((book) => book.status === "打算看");
      const reading = allBooks.filter((book) => book.status === "正在看");
      const finished = allBooks.filter((book) => book.status === "看完");
      const abandoned = allBooks.filter((book) => book.status === "放弃");

      // 添加各状态部分
      if (planToRead.length > 0) {
        sections.push(
          <Grid.Section aspectRatio="2/3" fit={Grid.Fit.Fill} title="打算看" key="plan-to-read">
            {planToRead.map((book) => (
              <BookItem
                key={book.id}
                book={book}
                onBookUpdated={handleBookUpdated}
                updateBookStatus={updateBookStatus}
                removeBook={removeBook}
                updateBookRating={updateBookRating}
              />
            ))}
          </Grid.Section>,
        );
      }

      if (reading.length > 0) {
        sections.push(
          <Grid.Section aspectRatio="2/3" fit={Grid.Fit.Fill} title="正在看" key="reading">
            {reading.map((book) => (
              <BookItem
                key={book.id}
                book={book}
                onBookUpdated={handleBookUpdated}
                updateBookStatus={updateBookStatus}
                removeBook={removeBook}
                updateBookRating={updateBookRating}
              />
            ))}
          </Grid.Section>,
        );
      }

      if (finished.length > 0) {
        sections.push(
          <Grid.Section aspectRatio="2/3" fit={Grid.Fit.Fill} title="看完" key="finished">
            {finished.map((book) => (
              <BookItem
                key={book.id}
                book={book}
                onBookUpdated={handleBookUpdated}
                updateBookStatus={updateBookStatus}
                removeBook={removeBook}
                updateBookRating={updateBookRating}
              />
            ))}
          </Grid.Section>,
        );
      }

      if (abandoned.length > 0) {
        sections.push(
          <Grid.Section aspectRatio="2/3" fit={Grid.Fit.Fill} title="放弃" key="abandoned">
            {abandoned.map((book) => (
              <BookItem
                key={book.id}
                book={book}
                onBookUpdated={handleBookUpdated}
                updateBookStatus={updateBookStatus}
                removeBook={removeBook}
                updateBookRating={updateBookRating}
              />
            ))}
          </Grid.Section>,
        );
      }
    } else {
      // 添加过滤后或搜索结果部分
      sections.push(
        <Grid.Section aspectRatio="2/3" fit={Grid.Fit.Fill} title={selectedStatus || "所有书籍"} key="filtered-books">
          {books.map((book) => (
            <BookItem
              key={book.id}
              book={book}
              onBookUpdated={handleBookUpdated}
              updateBookStatus={updateBookStatus}
              removeBook={removeBook}
              updateBookRating={updateBookRating}
            />
          ))}
        </Grid.Section>,
      );
    }

    return sections;
  };

  return (
    <Grid
      columns={5} // 固定为5列
      inset={Grid.Inset.Zero}
      isLoading={isLoadingRemote}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="搜索书籍..."
      searchBarAccessory={
        <Grid.Dropdown
          tooltip="筛选选项"
          storeValue
          onChange={(newValue) => {
            // 只处理状态过滤
            if (newValue === "all") {
              setSelectedStatus(undefined);
            } else {
              setSelectedStatus(newValue as BookStatus);
            }
          }}
        >
          <Grid.Dropdown.Section title="状态筛选">
            <Grid.Dropdown.Item title="所有书籍" value="all" />
            <Grid.Dropdown.Item title="打算看" value="打算看" icon={{ source: Icon.List, tintColor: Color.Blue }} />
            <Grid.Dropdown.Item title="正在看" value="正在看" icon={{ source: Icon.Book, tintColor: Color.Green }} />
            <Grid.Dropdown.Item title="看完" value="看完" icon={{ source: Icon.Checkmark, tintColor: Color.Purple }} />
            <Grid.Dropdown.Item title="放弃" value="放弃" icon={{ source: Icon.XMarkCircle, tintColor: Color.Red }} />
          </Grid.Dropdown.Section>
        </Grid.Dropdown>
      }
      navigationTitle="我的书架"
      actions={
        <ActionPanel>
          <Action.Push
            title="添加新书"
            icon={Icon.Plus}
            shortcut={{ modifiers: ["cmd"], key: "n" }}
            target={<BookSearchForm onBookAdded={handleBookAdded} addBook={addBook} />}
          />

          <Action
            title="刷新"
            icon={Icon.Repeat}
            shortcut={{ modifiers: ["cmd"], key: "r" }}
            onAction={() => {
              /* 不需要刷新操作，数据自动同步 */
            }}
          />
        </ActionPanel>
      }
    >
      {renderSections()}
    </Grid>
  );
}
