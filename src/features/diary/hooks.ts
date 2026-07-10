"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createDiary,
  deleteDiary,
  fetchDiaries,
  updateDiary,
  type Diary,
  type DiaryListParams,
  type DiaryListResult,
} from "./api";
import type { CreateDiaryInput, UpdateDiaryInput } from "./schemas";

/** Centralised query keys so mutations can invalidate consistently. */
export const diaryKeys = {
  all: ["diary"] as const,
  lists: () => [...diaryKeys.all, "list"] as const,
  list: (params: DiaryListParams) => [...diaryKeys.lists(), params] as const,
};

export function useDiaries(params: DiaryListParams) {
  return useQuery({
    queryKey: diaryKeys.list(params),
    queryFn: () => fetchDiaries(params),
  });
}

export function useCreateDiary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDiaryInput) => createDiary(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: diaryKeys.lists() }),
  });
}

export function useUpdateDiary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDiaryInput }) =>
      updateDiary(id, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: diaryKeys.lists() }),
  });
}

export function useDeleteDiary(params: DiaryListParams) {
  const queryClient = useQueryClient();
  const key = diaryKeys.list(params);

  return useMutation({
    mutationFn: (id: string) => deleteDiary(id),
    // Optimistically remove the entry from the current list, rolling back on error.
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<DiaryListResult>(key);
      if (previous) {
        queryClient.setQueryData<DiaryListResult>(key, {
          ...previous,
          items: previous.items.filter((entry: Diary) => entry.id !== id),
          total: Math.max(0, previous.total - 1),
        });
      }
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: diaryKeys.lists() }),
  });
}
