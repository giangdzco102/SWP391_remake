/* eslint-disable @typescript-eslint/no-explicit-any */
import APP_CONFIG from "@/config/app-config";
import { CommentListParams } from "@/types/story";
import useHttpClient from "./useHttpClient";
import { useMemo } from "react";

export type ResultCommentService = {
  /** GET /comments/chapter/:chapterId */
  getCommentsByChapter: (chapterId: string | number, params?: CommentListParams) => Promise<any>;
  /** POST /comments */
  createComment: (payload: { chapterId: number; content: string; parentId?: number }) => Promise<any>;
  /** DELETE /comments/:id */
  deleteComment: (id: string | number) => Promise<any>;
};

const useCommentService = (): ResultCommentService => {
  const httpClient = useHttpClient();

  const getCommentsByChapter = (
    chapterId: string | number,
    params?: CommentListParams,
  ): Promise<any> => {
    return httpClient.get(APP_CONFIG.COMMENT.BY_CHAPTER(chapterId), {}, { params });
  };

  const createComment = (payload: { chapterId: number; content: string; parentId?: number }): Promise<any> => {
    return httpClient.post(APP_CONFIG.COMMENT.CREATE, payload);
  };

  const deleteComment = (id: string | number): Promise<any> => {
    return httpClient.delete(APP_CONFIG.COMMENT.DELETE(id), {});
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => ({ getCommentsByChapter, createComment, deleteComment }), [httpClient]);
};

export default useCommentService;
