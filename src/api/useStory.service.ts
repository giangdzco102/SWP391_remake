/* eslint-disable @typescript-eslint/no-explicit-any */
import APP_CONFIG from "@/config/app-config";
import { Story, StoryDetail, StoryListParams, StorySearchParams } from "@/types/story";
import useHttpClient from "./useHttpClient";

export type ResultStoryService = {
  /** GET /api/stories — danh sách truyện đã publish */
  getStories: (params?: StoryListParams) => Promise<any>;
  /** GET /api/stories/my — truyện của tôi */
  getMyStories: (params?: StoryListParams) => Promise<any>;
  /** GET /api/stories/search?keyword=... */
  searchStories: (params: StorySearchParams) => Promise<any>;
  /** GET /api/stories/:id */
  getStory: (id: string | number) => Promise<Story>;
  /** GET /api/stories/:id/detail */
  getStoryDetail: (id: string | number) => Promise<StoryDetail>;
};

const useStoryService = (): ResultStoryService => {
  const httpClient = useHttpClient();

  const getStories = (params?: StoryListParams): Promise<any> => {
    return httpClient.get(APP_CONFIG.STORY.LIST, {}, { params });
  };

  const getMyStories = (params?: StoryListParams): Promise<any> => {
    return httpClient.get(APP_CONFIG.STORY.MY, {}, { params });
  };

  const searchStories = (params: StorySearchParams): Promise<any> => {
    return httpClient.get(APP_CONFIG.STORY.SEARCH, {}, { params });
  };

  const getStory = (id: string | number): Promise<Story> => {
    return httpClient.get<Story>(APP_CONFIG.STORY.GET(id));
  };

  const getStoryDetail = (id: string | number): Promise<StoryDetail> => {
    return httpClient.get<StoryDetail>(APP_CONFIG.STORY.DETAIL(id));
  };

  return {
    getStories,
    getMyStories,
    searchStories,
    getStory,
    getStoryDetail,
  };
};

export default useStoryService;
