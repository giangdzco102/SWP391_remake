/* eslint-disable @typescript-eslint/no-explicit-any */
import APP_CONFIG from "@/config/app-config";
import { Comment, CommentListParams } from "@/types/story";
import useHttpClient from "./useHttpClient";

export type ResultCommentService = {
  /** GET /api/comments/chapter/:chapterId — bình luận theo chapter */
  getCommentsByChapter: (chapterId: string | number, params?: CommentListParams) => Promise<any>;
};

const useCommentService = (): ResultCommentService => {
  const httpClient = useHttpClient();

  const getCommentsByChapter = (
    chapterId: string | number,
    params?: CommentListParams,
  ): Promise<any> => {
    return httpClient.get(APP_CONFIG.COMMENT.BY_CHAPTER(chapterId), {}, { params });
  };

  return {
    getCommentsByChapter,
  };
};

export default useCommentService;
