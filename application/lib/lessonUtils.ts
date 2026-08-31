import { Lesson } from "@/types/lesson";

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function getDayName(dayOfWeek: number): string {
  return DAY_NAMES[dayOfWeek] ?? "Unknown";
}

export function formatTime24to12(time24: string): string {
  if (!time24) return "";
  const parts = time24.split(":");
  const h = parseInt(parts[0], 10);
  const m = parts[1] ?? "00";
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

/**
 * Parses user handwritten time input (e.g. "10:00 AM", "2:30 PM", "14:30", "9:30")
 * into normalized 24-hour "HH:mm" format.
 */
export function parseManualTimeTo24h(input: string): string | null {
  if (!input) return null;
  const str = input.trim().toLowerCase();

  const match = str.match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?$/);
  if (!match) return null;

  let hour = parseInt(match[1], 10);
  const minute = match[2] ? parseInt(match[2], 10) : 0;
  const ampm = match[3];

  if (minute < 0 || minute > 59) return null;

  if (ampm) {
    if (hour < 1 || hour > 12) return null;
    if (ampm === "pm" && hour < 12) hour += 12;
    if (ampm === "am" && hour === 12) hour = 0;
  } else {
    if (hour < 0 || hour > 23) return null;
  }

  const hStr = String(hour).padStart(2, "0");
  const mStr = String(minute).padStart(2, "0");
  return `${hStr}:${mStr}`;
}

export function formatTimeRange(start: string, end: string | null): string {
  const startStr = formatTime24to12(start);
  if (!end) return startStr;
  const endStr = formatTime24to12(end);
  return `${startStr} – ${endStr}`;
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function formatDateHeading(date: Date): string {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) {
    return `Today (${getDayName(date.getDay())}, ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`;
  }
  if (isSameDay(date, tomorrow)) {
    return `Tomorrow (${getDayName(date.getDay())}, ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`;
  }
  if (isSameDay(date, yesterday)) {
    return `Yesterday (${getDayName(date.getDay())}, ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`;
  }

  return `${getDayName(date.getDay())}, ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function isToday(d: Date): boolean {
  return isSameDay(d, new Date());
}

/**
 * Calculates the next specific Date timestamp when this weekly lesson will occur.
 */
export function getNextOccurrenceDate(lesson: Lesson): Date {
  const now = new Date();
  const currentDay = now.getDay();
  const [hour, minute] = lesson.start_time.split(":").map(Number);

  let daysToAdd = 0;
  if (lesson.day_of_week === currentDay) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const lessonMinutes = hour * 60 + minute;
    if (lessonMinutes <= currentMinutes) {
      daysToAdd = 7; // Next week
    } else {
      daysToAdd = 0; // Later today
    }
  } else if (lesson.day_of_week > currentDay) {
    daysToAdd = lesson.day_of_week - currentDay;
  } else {
    daysToAdd = 7 - (currentDay - lesson.day_of_week);
  }

  const occurrence = new Date(now);
  occurrence.setDate(now.getDate() + daysToAdd);
  occurrence.setHours(hour, minute, 0, 0);
  return occurrence;
}

export type LessonStatus = "upcoming" | "ongoing" | "completed";

export function getLessonStatusForDate(lesson: Lesson, targetDate: Date): LessonStatus {
  const today = new Date();
  if (isSameDay(targetDate, today)) {
    const nowMinutes = today.getHours() * 60 + today.getMinutes();
    const [sH, sM] = lesson.start_time.split(":").map(Number);
    const startMinutes = sH * 60 + sM;

    let endMinutes = startMinutes + 60; // Default 1 hour
    if (lesson.end_time) {
      const [eH, eM] = lesson.end_time.split(":").map(Number);
      endMinutes = eH * 60 + eM;
    }

    if (nowMinutes < startMinutes) return "upcoming";
    if (nowMinutes >= startMinutes && nowMinutes <= endMinutes) return "ongoing";
    return "completed";
  }

  if (targetDate.getTime() > today.getTime()) {
    return "upcoming";
  }
  return "completed";
}

export function getCountdownText(lesson: Lesson): string {
  const nextDate = getNextOccurrenceDate(lesson);
  const now = new Date();
  const diffMs = nextDate.getTime() - now.getTime();

  const diffMins = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMins / 60);

  if (isSameDay(nextDate, now)) {
    if (diffMins < 60) {
      return diffMins <= 0 ? "Starting now" : `In ${diffMins} min${diffMins === 1 ? "" : "s"}`;
    }
    const remMins = diffMins % 60;
    return remMins === 0
      ? `Today in ${diffHours}h`
      : `Today in ${diffHours}h ${remMins}m`;
  }

  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);
  if (isSameDay(nextDate, tomorrow)) {
    return `Tomorrow at ${formatTime24to12(lesson.start_time)}`;
  }

  return `Every ${getDayName(lesson.day_of_week)} at ${formatTime24to12(lesson.start_time)}`;
}

export interface CalendarDayCell {
  date: Date;
  dateKey: string; // YYYY-MM-DD
  dayNumber: number;
  dayOfWeek: number; // 0=Sun..6=Sat
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getDaysInMonthGrid(year: number, month: number): CalendarDayCell[] {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Day of week: Mon=0 .. Sun=6
  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  const cells: CalendarDayCell[] = [];

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i);
    cells.push({
      date: d,
      dateKey: toDateKey(d),
      dayNumber: d.getDate(),
      dayOfWeek: d.getDay(),
      isCurrentMonth: false,
      isToday: isToday(d),
    });
  }

  // Current month days
  const totalDays = lastDayOfMonth.getDate();
  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(year, month, day);
    cells.push({
      date: d,
      dateKey: toDateKey(d),
      dayNumber: day,
      dayOfWeek: d.getDay(),
      isCurrentMonth: true,
      isToday: isToday(d),
    });
  }

  // Next month leading days
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    cells.push({
      date: d,
      dateKey: toDateKey(d),
      dayNumber: i,
      dayOfWeek: d.getDay(),
      isCurrentMonth: false,
      isToday: isToday(d),
    });
  }

  return cells;
}
