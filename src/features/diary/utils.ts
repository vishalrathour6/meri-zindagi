// Diary formatting helpers now live in the shared `lib/format` module so the
// tasks feature can reuse them. Re-exported here to keep existing imports stable.
export { formatDateLabel, snippet, toDateParam } from "@/lib/format";
