"use client";
import { useAppStore } from "@/stores";
import { Spin } from "antd";

const Loading = () => {
  const { loading } = useAppStore();
  if (!loading) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[9999]">
      <Spin size="large" />
    </div>
  );
};

export default Loading;
