/* eslint-disable @typescript-eslint/no-explicit-any */
import APP_CONFIG from "@/config/app-config";
import useHttpClient from "./useHttpClient";
import { useMemo } from "react";

const useRatingService = () => {
  const httpClient = useHttpClient();

  /** POST /ratings — Đánh giá hoặc cập nhật rating */
  const rateStory = (payload: { storyId: number; score: number; review?: string }): Promise<any> =>
    httpClient.post("/ratings", payload);

  /** GET /ratings/story/{storyId} — Tất cả rating của truyện */
  const getRatingsByStory = (storyId: number | string): Promise<any> =>
    httpClient.get(`/ratings/story/${storyId}`);

  /** GET /ratings/my/{storyId} — Rating của user hiện tại cho truyện */
  const getMyRating = (storyId: number | string): Promise<any> =>
    httpClient.get(`/ratings/my/${storyId}`);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => ({ rateStory, getRatingsByStory, getMyRating }), [httpClient]);
};

export default useRatingService;
