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

export const WATCH_STATUS_COLOR: Record<string, string> = {
  plan_to_watch: "#efecca",
  watching: "#64a338",
  dropped: "#e03b24",
  completed: "#3865a3",
  on_hold: "#ffcc00",
}
