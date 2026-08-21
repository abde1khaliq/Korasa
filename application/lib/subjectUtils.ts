export const CHIP_COLORS = [
  { bg: "#F4E4D2", text: "#A8703F" },
  { bg: "#DFEFE4", text: "#3F7D5C" },
  { bg: "#EBE1F2", text: "#7E5A9C" },
  { bg: "#F4DED6", text: "#A34A34" },
  { bg: "#DCE7F4", text: "#4C74A3" },
];

export function getSubjectMeta(subjectId: number, name: string) {
  const code = name.substring(0, 3).toUpperCase();
  const chip = CHIP_COLORS[subjectId % CHIP_COLORS.length];
  return { code, chip };
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function getFormattedName(name: string) {
  if (!name) return "";
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}