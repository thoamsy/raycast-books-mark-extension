import { useState, useEffect, useCallback, useMemo } from "react";
import { ActionPanel, Action, Grid, showToast, Toast, Icon, Color } from "@raycast/api";
import { BookStatusValue, BookStatuses, getAllStatuses, getStatusConfig, StoredBook } from "./types/book";
import { BookItem } from "./components/BookItem";
import { BookSearchForm } from "./components/BookSearchForm";
import { useBookSearch } from "./hooks/useBookSearch";
import { SearchResultItem } from "./components/SearchResultItem";
import { useBooks } from "./hooks/useBooks";
import { useLocalStorage } from "@raycast/utils";

export default function Command() {
  const [searchText, setSearchText] = useState("");
  const [books, setBooks] = useState<StoredBook[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<BookStatusValue | undefined>(undefined);

  // 使用 useBooks 钩子获取书籍数据和操作方法
  const {
    booksOrderByAddedAt: allBooks,
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

  const { planToRead, reading, finished, abandoned } = useMemo(() => {
    return {
      planToRead: allBooks.filter((book) => book.status === BookStatuses.plan_to_read.value),
      reading: allBooks.filter((book) => book.status === BookStatuses.reading.value),
      finished: allBooks.filter((book) => book.status === BookStatuses.finished.value),
      abandoned: allBooks.filter((book) => book.status === BookStatuses.abandoned.value),
    };
  }, [allBooks]);

  const { value: columns = 5, setValue: setColumns } = useLocalStorage<number>("columns", 5);

  const zoomIn = () => {
    if (columns < 8) {
      setColumns(columns + 1);
    } else {
      showToast({
        style: Toast.Style.Failure,
        title: "最多只能放大到 8 列",
      });
    }
  };

  const zoomOut = () => {
    if (columns > 4) {
      setColumns(columns - 1);
    } else {
      showToast({
        style: Toast.Style.Failure,
        title: "最少只能缩小到 4 列",
      });
    }
  };

  const resetColumns = () => {
    setColumns(5);
  };

  // 检查是否没有书籍可显示
  const isEmpty = useMemo(() => {
    if (hasRemoteResults && searchText.trim()) {
      return remoteBooks.length === 0;
    }

    if (selectedStatus) {
      return getBooksByStatus(selectedStatus).length === 0;
    }

    return allBooks.length === 0;
  }, [hasRemoteResults, searchText, remoteBooks.length, selectedStatus, getBooksByStatus, allBooks.length]);

  // 构建网格部分
  const renderSections = () => {
    // 如果没有书籍可显示，返回空视图
    if (isEmpty) {
      return (
        <Grid.EmptyView
          title="没有书籍"
          description="在搜索框中输入书名可以直接搜索并添加新书"
          icon={{ source: Icon.Book, tintColor: Color.Blue }}
          actions={
            <ActionPanel>
              <Action.Push
                title="添加新书"
                icon={Icon.Plus}
                shortcut={{ modifiers: ["cmd"], key: "n" }}
                target={<BookSearchForm onBookAdded={handleBookAdded} addBook={addBook} />}
              />
            </ActionPanel>
          }
        />
      );
    }

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

    const statusGroups: { title: string; books: StoredBook[] }[] = [];
    // 如果没有选中状态，按状态分组显示
    if (!selectedStatus && !searchText.trim()) {
      // 为每种状态创建部分
      statusGroups.push(
        { title: BookStatuses.reading.label, books: reading },
        { title: BookStatuses.plan_to_read.label, books: planToRead },
        { title: BookStatuses.finished.label, books: finished },
        { title: BookStatuses.abandoned.label, books: abandoned },
      );
    } else {
      statusGroups.push({
        title: selectedStatus ? getStatusConfig(selectedStatus).label : "所有书籍",
        books,
      });
    }

    // 只添加有书籍的状态分组
    statusGroups.forEach(({ title, books }) => {
      if (books.length > 0) {
        sections.push(
          <Grid.Section aspectRatio="2/3" fit={Grid.Fit.Fill} title={`${title} (${books.length})`} key={title}>
            {books.map((book) => (
              <BookItem
                key={book.id}
                book={book}
                onBookUpdated={handleBookUpdated}
                updateBookStatus={updateBookStatus}
                removeBook={removeBook}
                updateBookRating={updateBookRating}
                zoomIn={zoomIn}
                zoomOut={zoomOut}
                resetColumns={resetColumns}
              />
            ))}
          </Grid.Section>,
        );
      }
    });

    return sections;
  };

  return (
    <Grid
      columns={columns}
      inset={Grid.Inset.Zero}
      isLoading={isLoadingRemote}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="搜索书籍直接添加"
      searchBarAccessory={
        <Grid.Dropdown
          tooltip="筛选选项"
          onChange={(newValue) => {
            // 只处理状态过滤
            if (newValue === "all") {
              setSelectedStatus(undefined);
            } else {
              setSelectedStatus(newValue as BookStatusValue);
            }
          }}
        >
          <Grid.Dropdown.Section title="状态筛选">
            <Grid.Dropdown.Item title="所有书籍" value="all" />
            {getAllStatuses().map((status) => (
              <Grid.Dropdown.Item key={status.value} title={status.label} value={status.value} icon={status.icon} />
            ))}
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
