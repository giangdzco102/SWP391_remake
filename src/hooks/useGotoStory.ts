/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRouter } from "next/navigation";
import { useNavStore } from "@/stores/navStore";

export function useGotoStory() {
  const router = useRouter();
  const { setSelectedStory } = useNavStore();

  return (story: any) => {
    setSelectedStory(story);
    router.push(`/storyDetailPage?id=${story.id}`);
  };
}
