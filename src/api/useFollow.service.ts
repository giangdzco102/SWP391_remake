/* eslint-disable @typescript-eslint/no-explicit-any */
import APP_CONFIG from "@/config/app-config";
import useHttpClient from "./useHttpClient";

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

  return { toggleFollow, getFollowedStories, getFollowStatus };
};

export default useFollowService;
