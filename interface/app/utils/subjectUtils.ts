export const CHIP_COLORS = [
  "bg-[oklch(0.94_0.03_60)] text-brand",
  "bg-[oklch(0.94_0.025_160)] text-easy",
  "bg-[oklch(0.93_0.03_300)] text-[oklch(0.5_0.11_300)]",
  "bg-[oklch(0.94_0.03_35)] text-hard",
  "bg-[oklch(0.93_0.025_255)] text-[oklch(0.52_0.09_255)]",
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
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}