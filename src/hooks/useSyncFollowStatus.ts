import { useEffect } from "react";
import { useAuthStore } from "@/stores";
import { useStoryStore } from "@/stores/storyStore";
import useFollowService from "@/api/useFollow.service";

export function useSyncFollowStatus() {
  const { user } = useAuthStore();
  const { setFollowedIds } = useStoryStore();
  const { getFollowedStories } = useFollowService(); // ← tên đúng

  useEffect(() => {
    if (!user) {
      setFollowedIds([]);
      return;
    }
    getFollowedStories()
      .then((res: any) => {
        const list: any[] = Array.isArray(res?.data) ? res.data
          : Array.isArray(res) ? res : [];
        const ids = list.map((item: any) => item?.storyId ?? item?.id ?? item);
        setFollowedIds(ids.filter((id): id is number => typeof id === "number"));
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
}