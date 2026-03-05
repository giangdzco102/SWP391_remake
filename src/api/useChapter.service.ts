/* eslint-disable @typescript-eslint/no-explicit-any */
import APP_CONFIG from "@/config/app-config";
import { Chapter, ChapterSummary } from "@/types/story";
import useHttpClient from "./useHttpClient";

export type ResultChapterService = {
  /** GET /api/chapters/story/:storyId — danh sách chapter của một truyện */
  getChaptersByStory: (storyId: string | number, params?: { page?: number; size?: number }) => Promise<any>;
  /** GET /api/chapters/:id — chi tiết chapter (kèm nội dung) */
  getChapter: (id: string | number) => Promise<Chapter>;
};

const useChapterService = (): ResultChapterService => {
  const httpClient = useHttpClient();

  const getChaptersByStory = (
    storyId: string | number,
    params?: { page?: number; size?: number },
  ): Promise<any> => {
    return httpClient.get(APP_CONFIG.CHAPTER.BY_STORY(storyId), {}, { params });
  };

  const getChapter = (id: string | number): Promise<Chapter> => {
    return httpClient.get<Chapter>(APP_CONFIG.CHAPTER.GET(id));
  };

  return {
    getChaptersByStory,
    getChapter,
  };
};

export default useChapterService;
