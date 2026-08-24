"use client";

import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

interface PageTitleContextValue {
  title: string;
  setTitle: (title: string) => void;
}

const PageTitleContext = createContext<PageTitleContextValue>({
  title: "",
  setTitle: () => {},
});

export function PageTitleProvider({ children }: { children: React.ReactNode }) {
  const [title, setTitle] = useState("");
  const value = useMemo(() => ({ title, setTitle }), [title]);
  return (
    <PageTitleContext.Provider value={value}>{children}</PageTitleContext.Provider>
  );
}

export function usePageTitle(title?: string) {
  const { setTitle } = useContext(PageTitleContext);

  useLayoutEffect(() => {
    if (!title) return;
    setTitle(title);
  }, [title, setTitle]);
}

export function usePageTitleValue() {
  return useContext(PageTitleContext).title;
}
