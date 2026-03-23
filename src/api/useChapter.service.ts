/* eslint-disable @typescript-eslint/no-explicit-any */
import APP_CONFIG from "@/config/app-config";
import { Chapter } from "@/types/story";
import useHttpClient from "./useHttpClient";

export interface ChapterCreateBody {
  title: string;
  content: string;
  coinPrice?: number;
  publishAt?: string;
  chapterOrder?: number;
}

export interface ChapterUpdateBody {
  title?: string;
  content?: string;
  coinPrice?: number;
  publishAt?: string;
}

export type ResultChapterService = {
  /** GET /chapters/story/:storyId — danh sách chapter của một truyện */
  getChaptersByStory: (storyId: string | number, params?: { page?: number; size?: number }) => Promise<any>;
  /** GET /chapters/:id — chi tiết chapter (kèm nội dung) */
  getChapter: (id: string | number) => Promise<Chapter>;
  /** POST /chapters/story/:storyId — tạo chương mới */
  createChapter: (storyId: string | number, body: ChapterCreateBody) => Promise<any>;
  /** PUT /chapters/:id — cập nhật chương */
  updateChapter: (id: string | number, body: ChapterUpdateBody) => Promise<any>;
  /** DELETE /chapters/:id — xoá chương */
  deleteChapter: (id: string | number) => Promise<any>;
  /** POST /chapters/:id/submit — nộp chương để kiểm duyệt (DRAFT/EDITED → PENDING_REVIEW) */
  submitChapter: (id: string | number) => Promise<any>;
  /** POST /chapters/:id/publish — phát hành chương (APPROVED → PUBLISHED) */
  publishChapter: (id: string | number) => Promise<any>;
  /** POST /chapters/:id/purchase — mua chương trả phí */
  purchaseChapter: (id: string | number) => Promise<any>;
};

const useChapterService = (): ResultChapterService => {
  const httpClient = useHttpClient();

  // Dùng httpClient.get (axiosAuth) để author nhận được tất cả chương (mọi trạng thái).
  // Khi không có token (guest), axiosAuth không thêm Authorization header → backend trả về như public.
  const getChaptersByStory = (
    storyId: string | number,
    params?: { page?: number; size?: number },
  ): Promise<any> => {
    return httpClient.get(APP_CONFIG.CHAPTER.BY_STORY(storyId), {}, { params });
  };

  // getChapter (đọc nội dung) giữ auth vì chapter trả phí cần xác thực
  const getChapter = (id: string | number): Promise<Chapter> => {
    return httpClient.get<Chapter>(APP_CONFIG.CHAPTER.GET(id));
  };

  const createChapter = (storyId: string | number, body: ChapterCreateBody): Promise<any> => {
    return httpClient.post(APP_CONFIG.CHAPTER.CREATE(storyId), body);
  };

  const updateChapter = (id: string | number, body: ChapterUpdateBody): Promise<any> => {
    return httpClient.put(APP_CONFIG.CHAPTER.UPDATE(id), body);
  };

  const deleteChapter = (id: string | number): Promise<any> => {
    return httpClient.delete(APP_CONFIG.CHAPTER.DELETE(id), {});
  };

  const submitChapter = (id: string | number): Promise<any> => {
    return httpClient.post(APP_CONFIG.CHAPTER.SUBMIT(id), {});
  };

  const publishChapter = (id: string | number): Promise<any> => {
    return httpClient.post(APP_CONFIG.CHAPTER.PUBLISH(id), {});
  };

  const purchaseChapter = (id: string | number): Promise<any> => {
    return httpClient.post(APP_CONFIG.CHAPTER.PURCHASE(id), {});
  };

  return {
    getChaptersByStory,
    getChapter,
    createChapter,
    updateChapter,
    deleteChapter,
    submitChapter,
    publishChapter,
    purchaseChapter,
  };
};

export default useChapterService;
