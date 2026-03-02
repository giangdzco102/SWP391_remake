"use client";

import { useCheckAuth } from "@/hooks/useCheckAuth";

/**
 * Component wrapper để check auth khi app khởi động
 */
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useCheckAuth();

  return <>{children}</>;
}
