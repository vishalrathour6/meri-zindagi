"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createTag, fetchTags, type Tag } from "./api";
import type { CreateTagInput } from "./schemas";

/** Centralised query keys so mutations can invalidate consistently. */
export const tagKeys = {
  all: ["tags"] as const,
  lists: () => [...tagKeys.all, "list"] as const,
};

export function useTags() {
  return useQuery({
    queryKey: tagKeys.lists(),
    queryFn: fetchTags,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTagInput) => createTag(input),
    onSuccess: (tag) => {
      // Seed the cache so the new tag shows immediately, then refetch.
      queryClient.setQueryData<Tag[]>(tagKeys.lists(), (previous) => {
        if (!previous) return [tag];
        if (previous.some((existing) => existing.id === tag.id)) return previous;
        return [...previous, tag].sort((a, b) => a.name.localeCompare(b.name));
      });
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
    },
  });
}
