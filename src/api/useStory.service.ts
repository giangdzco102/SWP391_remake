/* eslint-disable @typescript-eslint/no-explicit-any */
import APP_CONFIG from "@/config/app-config";
import { Story, StoryDetail, StoryListParams, StorySearchParams } from "@/types/story";
import useHttpClient from "./useHttpClient";
import { useMemo } from "react";

export type ResultStoryService = {
  /** GET /stories — danh sách truyện đã publish (có filter/sort/page) */
  getStories:    (params?: StoryListParams) => Promise<any>;
  /** GET /stories — toàn bộ danh sách, size lớn — dùng cho Search & store */
  getAllStories:  (params?: Omit<StoryListParams, "size"> & { size?: number }) => Promise<any>;
  /** GET /stories/my — truyện của tôi */
  getMyStories:  (params?: StoryListParams) => Promise<any>;
  /** GET /stories/search?keyword=... */
  searchStories: (params: StorySearchParams) => Promise<any>;
  /** GET /stories/:id */
  getStory:      (id: string | number) => Promise<Story>;
  /** GET /stories/:id/detail */
  getStoryDetail:(id: string | number) => Promise<StoryDetail>;
};

const useStoryService = (): ResultStoryService => {
  const httpClient = useHttpClient();

  const getStories = (params?: StoryListParams): Promise<any> =>
    httpClient.get(APP_CONFIG.STORY.LIST, {}, { params });

  // getAllStories = getStories với size mặc định lớn hơn
  // Dùng ở SearchResultsPage (show all) và HomePage (populate allStories store)
  const getAllStories = (params?: Omit<StoryListParams, "size"> & { size?: number }): Promise<any> =>
    httpClient.get(APP_CONFIG.STORY.LIST, {}, { params: { size: 200, ...params } });

  const getMyStories = (params?: StoryListParams): Promise<any> =>
    httpClient.get(APP_CONFIG.STORY.MY, {}, { params });

  const searchStories = (params: StorySearchParams): Promise<any> =>
    httpClient.get(APP_CONFIG.STORY.SEARCH, {}, { params });

  const getStory = (id: string | number): Promise<Story> =>
    httpClient.get<Story>(APP_CONFIG.STORY.GET(id));

  const getStoryDetail = (id: string | number): Promise<StoryDetail> =>
    httpClient.get<StoryDetail>(APP_CONFIG.STORY.DETAIL(id));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => ({ getStories, getAllStories, getMyStories, searchStories, getStory, getStoryDetail }), [httpClient]);
};

export default useStoryService;