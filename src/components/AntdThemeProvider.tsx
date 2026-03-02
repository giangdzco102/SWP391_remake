"use client";

import { ConfigProvider, theme as antdTheme } from "antd";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";

interface AntdThemeProviderProps {
  children: React.ReactNode;
}

export default function AntdThemeProvider({
  children,
}: AntdThemeProviderProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = theme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not applying theme until mounted
  if (!mounted) {
    return (
      <ConfigProvider
        theme={{
          algorithm: antdTheme.defaultAlgorithm,
        }}
      >
        {children}
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark
          ? antdTheme.darkAlgorithm
          : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#1890ff",
          colorSuccess: "#52c41a",
          colorWarning: "#faad14",
          colorError: "#ff4d4f",
          colorInfo: "#1890ff",
          borderRadius: 8,

          // Font
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

          // Dark mode specific tokens
          ...(isDark && {
            colorBgBase: "#0a0a0a",
            colorBgContainer: "#141414",
            colorBgElevated: "#1a1a1a",
            colorBorder: "#262626",
            colorText: "#ededed",
            colorTextSecondary: "#a3a3a3",
            colorTextTertiary: "#737373",
            colorTextQuaternary: "#525252",
          }),
        },
        components: {
          Button: {
            controlHeight: 40,
            fontSize: 14,
          },
          Input: {
            controlHeight: 40,
            fontSize: 14,
          },
          Select: {
            controlHeight: 40,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
