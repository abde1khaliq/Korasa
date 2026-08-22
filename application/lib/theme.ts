export type ColorScheme = "light" | "dark";

export const lightVars = {
  "--color-paper": "#F7F5F1",
  "--color-paper-card": "#FBFAF8",
  "--color-ink": "#2B2724",
  "--color-ink-soft": "#6E655C",
  "--color-ink-faint": "#9C9086",
  "--color-rule": "#E4DED4",
  "--color-brand": "#A8703F",
  "--color-onyx": "#2A2724",
  "--color-easy": "#3F7D5C",
  "--color-easy-soft": "#E3F1E9",
  "--color-medium": "#A17A2E",
  "--color-medium-soft": "#F1E6C9",
  "--color-hard": "#A34A34",
  "--color-hard-soft": "#F3E3DE",
  "--color-tag": "#EFE2CD",
};

export const darkVars = {
  "--color-paper": "#211D1A",
  "--color-paper-card": "#272220",
  "--color-ink": "#F1EFEC",
  "--color-ink-soft": "#B3AA9F",
  "--color-ink-faint": "#7A7166",
  "--color-rule": "#3A332C",
  "--color-brand": "#C99A66",
  "--color-onyx": "#F1EFEC",
  "--color-easy": "#7FBF9B",
  "--color-easy-soft": "#1E3A2C",
  "--color-medium": "#D9B25C",
  "--color-medium-soft": "#3A2E14",
  "--color-hard": "#D97F5C",
  "--color-hard-soft": "#3A2013",
  "--color-tag": "#3A3128",
};

export function varsFor(scheme: ColorScheme) {
  return scheme === "dark" ? darkVars : lightVars;
}