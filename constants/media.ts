export const seasonIntMap = {
  WINTER: 1,
  SPRING: 2,
  SUMMER: 3,
  FALL: 4,
}

export const seasonList = ["winter", "spring", "summer", "fall"]

export const weekdayOption = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

export const WATCH_STATUS_OPTIONS = ["plan_to_watch", "watching", "dropped", "completed", "on_hold"]

export const WATCH_STATUS_DISPLAY_NAME: Record<string, string> = {
  plan_to_watch: "待看",
  watching: "追梗",
  dropped: "棄番",
  completed: "看完",
  on_hold: "暫停",
}

// todo use icon instead
export const WATCH_STATUS_COLOR: Record<string, string> = {
  plan_to_watch: "gray",
  watching: "forestgreen",
  dropped: "crimson",
  completed: "dodgerblue",
  on_hold: "gold",
}

export const FOLLOW_OPTIONS = [
  { text: "all", value: "all" },
  { text: "hide", value: "hide" },
  { text: "show", value: "show" },
]

export const SORT_OPTIONS = [
  { text: "none", value: "none" },
  { text: "day", value: "day" },
  { text: "MAL", value: "mal-score" },
  { text: "Anilist", value: "anilist-score" },
]
