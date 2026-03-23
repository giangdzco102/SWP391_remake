import { useRouter } from "next/navigation";
import { useNavStore } from "@/stores/navStore";
import Utils from "@/utils/utils";

export function useGotoReader() {
  const router = useRouter();
  const { setSelectedChapterId } = useNavStore();

  return (storyId: number | string, chapterId: number | string, chapterTitle?: string) => {
    setSelectedChapterId(Number(chapterId));
    const slug = chapterTitle ? Utils.slugify(chapterTitle) : chapterId;
    router.push(`/readerPage?storyId=${storyId}&chapterId=${slug}`);
  };
}
