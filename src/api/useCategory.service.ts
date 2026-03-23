/* eslint-disable @typescript-eslint/no-explicit-any */
import APP_CONFIG from "@/config/app-config";
import useHttpClient from "./useHttpClient";
import { useMemo } from "react";

export type CategoryItem = {
  id: number;
  name: string;
};

const useCategoryService = () => {
  const httpClient = useHttpClient();

  // Categories là dữ liệu công khai — dùng getPublic để guest cũng load được
  const getCategories = (): Promise<CategoryItem[]> => {
    return httpClient.getPublic(APP_CONFIG.CATEGORY.LIST);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => ({ getCategories }), [httpClient]);
};

export default useCategoryService;
