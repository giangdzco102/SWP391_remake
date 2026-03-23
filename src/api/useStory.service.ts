/* eslint-disable @typescript-eslint/no-explicit-any */
import APP_CONFIG from "@/config/app-config";
import { Story, StoryDetail, StoryListParams, StorySearchParams } from "@/types/story";
import useHttpClient from "./useHttpClient";

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
  /** GET /stories/rankings — top xem nhiều (public) */
  getRankings:   () => Promise<any>;
  /** GET /stories/top-rated — top đánh giá cao (public) */
  getTopRated:   () => Promise<any>;
  /** GET /stories/completed — truyện đã hoàn thành (public) */
  getCompleted:  () => Promise<any>;
  /** GET /stories/category/:id — truyện theo thể loại (public) */
  getByCategory: (categoryId: string | number) => Promise<any>;
};

const useStoryService = (): ResultStoryService => {
  const httpClient = useHttpClient();

  // Public endpoints — dùng httpClient.get (axiosAuth) để gửi token khi user đã đăng nhập.
  // Backend trả về isFollowing/myRating khi có token, null khi không có token.
  const getStories = (params?: StoryListParams): Promise<any> =>
    httpClient.get(APP_CONFIG.STORY.LIST, {}, { params });

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

  const getRankings = (): Promise<any> =>
    httpClient.get(APP_CONFIG.STORY.RANKINGS);

  const getTopRated = (): Promise<any> =>
    httpClient.get(APP_CONFIG.STORY.TOP_RATED);

  const getCompleted = (): Promise<any> =>
    httpClient.get(APP_CONFIG.STORY.COMPLETED);

  const getByCategory = (categoryId: string | number): Promise<any> =>
    httpClient.get(APP_CONFIG.STORY.BY_CATEGORY(categoryId));

  return { getStories, getAllStories, getMyStories, searchStories, getStory, getStoryDetail, getRankings, getTopRated, getCompleted, getByCategory };
};

export default useStoryService;