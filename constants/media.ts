export const SEASON_LIST = ["winter", "spring", "summer", "fall"]

export const WEEKDAY_LIST = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

export const FOLLOWLIST_WATCH_STATUS_OPTIONS = [
  { text: "planning", value: "plan_to_watch" },
  { text: "watching", value: "watching" },
  { text: "dropped", value: "dropped" },
  { text: "completed", value: "completed" },
  { text: "stopped", value: "on_hold" },
]

// todo use icon instead
export const WATCH_STATUS_COLOR: Record<string, string> = {
  plan_to_watch: "gray",
  watching: "forestgreen",
  dropped: "crimson",
  completed: "dodgerblue",
  on_hold: "gold",
}

export const FOLLOW_OPTIONS = [
  { text: "hide", value: "hide" },
  { text: "show", value: "show" },
]

export const SORT_OPTIONS = [
  { text: "none", value: "none" },
  { text: "MAL", value: "mal-score" },
  { text: "Anilist", value: "anilist-score" },
]

export const FOLLOWLIST_SORT_OPTIONS = [
  { text: "year", value: "year" },
  { text: "score", value: "score" },
  { text: "create", value: "created_at" },
]
