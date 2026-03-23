/* eslint-disable @typescript-eslint/no-explicit-any */
import APP_CONFIG from "@/config/app-config";
import useHttpClient from "./useHttpClient";
import { useMemo } from "react";

const useFollowService = () => {
  const httpClient = useHttpClient();

  /** POST /follows/{storyId} — Toggle follow/unfollow, returns { storyId, status: "FOLLOWED"|"UNFOLLOWED" } */
  const toggleFollow = (storyId: number | string): Promise<any> =>
    httpClient.post(APP_CONFIG.FOLLOW.TOGGLE(storyId), {});

  /** GET /follows — Danh sách truyện đang theo dõi */
  const getFollowedStories = (): Promise<any> =>
    httpClient.get(APP_CONFIG.FOLLOW.LIST);

  /** GET /follows/{storyId}/status — true/false */
  const getFollowStatus = (storyId: number | string): Promise<boolean> =>
    httpClient.get(APP_CONFIG.FOLLOW.STATUS(storyId));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => ({ toggleFollow, getFollowedStories, getFollowStatus }), [httpClient]);
};

export default useFollowService;
