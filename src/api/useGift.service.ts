/* eslint-disable @typescript-eslint/no-explicit-any */
import APP_CONFIG from "@/config/app-config";
import useHttpClient from "./useHttpClient";

export interface Gift {
  id: number;
  fromUserId: number;
  fromUserName: string;
  toUserId: number;
  toUserName: string;
  storyId: number;
  storyTitle: string;
  amount: number;
  createdAt: string;
}

const useGiftService = () => {
  const httpClient = useHttpClient();

  /** POST /gifts 🔒 — Tặng coin cho tác giả truyện */
  const sendGift = (storyId: number, amount: number): Promise<Gift> =>
    httpClient.post<Gift>(APP_CONFIG.GIFT.SEND, { storyId, amount });

  /** GET /gifts/story/{storyId} — Danh sách quà của truyện */
  const getGiftsByStory = (storyId: number | string): Promise<Gift[]> =>
    httpClient.getPublic<Gift[]>(APP_CONFIG.GIFT.BY_STORY(storyId));

  /** GET /gifts/sent 🔒 — Quà đã gửi */
  const getSentGifts = (): Promise<Gift[]> =>
    httpClient.get<Gift[]>(APP_CONFIG.GIFT.SENT);

  /** GET /gifts/received 🔒 — Quà đã nhận (tác giả) */
  const getReceivedGifts = (): Promise<Gift[]> =>
    httpClient.get<Gift[]>(APP_CONFIG.GIFT.RECEIVED);

  return { sendGift, getGiftsByStory, getSentGifts, getReceivedGifts };
};

export default useGiftService;
