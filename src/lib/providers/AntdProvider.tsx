"use client";
import { ConfigProvider, theme as antdTheme } from "antd";
import { ReactNode } from "react";
import { createContext, useContext, useState, useEffect } from "react";

interface ThemeCtx {
  theme: "light" | "dark";
  toggle: () => void;
}

const ThemeContext = createContext<ThemeCtx>({ theme: "dark", toggle: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export default function AntdProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("admin_theme")) as
      | "light"
      | "dark"
      | null;
    if (stored) setTheme(stored);
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") {
        localStorage.setItem("admin_theme", next);
      }
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <ConfigProvider
        theme={{
          algorithm: theme === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: {
            colorPrimary: "#ff9900",
            colorLink: "#ff9900",
            colorLinkHover: "#ff6600",
            borderRadius: 8,
            colorBgContainer: theme === "dark" ? "#1a1a1a" : "#ffffff",
            colorBorder: theme === "dark" ? "#2a2a2a" : "#e5e5e5",
            colorText: theme === "dark" ? "#ffffff" : "#000000",
            colorTextSecondary: theme === "dark" ? "#a0a0a0" : "#666666",
            colorBgElevated: theme === "dark" ? "#1a1a1a" : "#ffffff",
          },
          components: {
            Input: {
              colorBgContainer: theme === "dark" ? "#121212" : "#ffffff",
              colorBorder: theme === "dark" ? "#2a2a2a" : "#d9d9d9",
              colorText: theme === "dark" ? "#ffffff" : "#000000",
              activeBorderColor: "#ff9900",
              hoverBorderColor: "#ff9900",
            },
            Select: {
              colorBgContainer: theme === "dark" ? "#121212" : "#ffffff",
              colorBorder: theme === "dark" ? "#2a2a2a" : "#d9d9d9",
              colorText: theme === "dark" ? "#ffffff" : "#000000",
              optionSelectedBg: theme === "dark" ? "#2a2a2a" : "#f5f5f5",
              optionSelectedColor: "#ff9900",
            },
            Button: {
              colorPrimary: "#ff9900",
              colorPrimaryHover: "#ff6600",
              colorPrimaryActive: "#ff6600",
              colorBgContainerDisabled: theme === "dark" ? "#2a2a2a" : "#f5f5f5",
            },
            Menu: {
              colorItemBg: "transparent",
              colorItemText: theme === "dark" ? "#a0a0a0" : "#666666",
              colorItemTextSelected: "#ff9900",
              colorItemBgSelected: theme === "dark" ? "#2a2a2a" : "#f5f5f5",
              colorItemTextHover: "#ff9900",
              colorItemBgHover: theme === "dark" ? "#2a2a2a" : "#f5f5f5",
            },
            Card: {
              colorBgContainer: theme === "dark" ? "#1a1a1a" : "#ffffff",
              colorBorderSecondary: theme === "dark" ? "#2a2a2a" : "#e5e5e5",
            },
            Table: {
              colorBgContainer: theme === "dark" ? "#1a1a1a" : "#ffffff",
              colorText: theme === "dark" ? "#ffffff" : "#000000",
              colorTextHeading: theme === "dark" ? "#ffffff" : "#000000",
              headerBg: theme === "dark" ? "#121212" : "#f5f5f5",
              headerColor: theme === "dark" ? "#ffffff" : "#000000",
              headerSortActiveBg: theme === "dark" ? "#2a2a2a" : "#e5e5e5",
              rowHoverBg: theme === "dark" ? "#2a2a2a" : "#f5f5f5",
              borderColor: theme === "dark" ? "#2a2a2a" : "#e5e5e5",
            },
            Pagination: {
              colorPrimary: "#ff9900",
              colorBgContainer: theme === "dark" ? "#1a1a1a" : "#ffffff",
              colorBorder: theme === "dark" ? "#2a2a2a" : "#d9d9d9",
              itemActiveBg: "#ff9900",
              colorText: theme === "dark" ? "#ffffff" : "#000000",
            },
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
} 