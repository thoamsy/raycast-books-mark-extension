import { useState, useCallback, useEffect, useMemo } from "react";
import { useFetch } from "@raycast/utils";
import { buildDoubanSearchUrl, parseDoubanSearchResponse } from "../utils/douban";
import { DoubanSearchResponse, StoredBook } from "../types/book";

// 用于防抖的延迟时间
const DEBOUNCE_DELAY = 300;

export function useBookSearch(query: string, searchLocalBooks?: (query: string) => StoredBook[]) {
  const [localResults, setLocalResults] = useState<StoredBook[]>([]);
  const [shouldFetch, setShouldFetch] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // 对查询进行防抖处理
  useEffect(() => {
    const trimmedQuery = query.trim();
    const timer = setTimeout(() => {
      setDebouncedQuery(trimmedQuery);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [query]);

  // 构建搜索 URL
  const searchUrl = shouldFetch && debouncedQuery ? buildDoubanSearchUrl(debouncedQuery) : "";

  // 使用 useFetch 进行远程搜索
  const {
    data: responseData,
    isLoading: isLoadingRemote,
    error: remoteError,
    revalidate: revalidateRemote,
  } = useFetch<DoubanSearchResponse>(searchUrl, {
    keepPreviousData: true,
    execute: shouldFetch && Boolean(debouncedQuery),
    onData: () => {
      // 当远程数据加载完成后，将标志位重置
      setShouldFetch(false);
    },
  });

  // 解析远程书籍数据
  const remoteBooks = useMemo(() => (responseData ? parseDoubanSearchResponse(responseData) : []), [responseData]);

  // 在本地存储中搜索
  const searchLocal = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery) {
        setLocalResults([]);
        return;
      }

      try {
        // 使用从父组件传入的搜索方法
        if (searchLocalBooks) {
          const results = searchLocalBooks(searchQuery);
          setLocalResults(results);

          // 如果本地没有结果，触发远程搜索
          if (results.length === 0) {
            setShouldFetch(true);
          }
        } else {
          // 如果没有提供搜索函数，直接触发远程搜索
          setShouldFetch(true);
          setLocalResults([]);
        }
      } catch (error) {
        console.error("本地搜索失败:", error);
      }
    },
    [searchLocalBooks],
  );

  // 当防抖后的查询变化时触发本地搜索
  useEffect(() => {
    if (debouncedQuery) {
      searchLocal(debouncedQuery);
    } else {
      setLocalResults([]);
      setShouldFetch(false);
    }
  }, [debouncedQuery, searchLocal]);

  // 强制触发远程搜索
  const triggerRemoteSearch = useCallback(() => {
    if (debouncedQuery) {
      setShouldFetch(true);
      revalidateRemote();
    }
  }, [debouncedQuery, revalidateRemote]);

  return {
    localResults,
    remoteBooks,
    isLoadingRemote,
    remoteError,
    triggerRemoteSearch,
    hasRemoteResults: remoteBooks.length > 0,
    isSearchingRemote: isLoadingRemote && shouldFetch,
  };
}
