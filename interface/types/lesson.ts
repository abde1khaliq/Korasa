export interface Lesson {
  id: number;
  subject_id: number | null;
  subject_name: string | null;
  title: string;
  description?: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  day_name: string;
  start_time: string; // "HH:mm" e.g. "10:00"
  end_time: string | null; // "HH:mm" e.g. "11:30"
  location: string;
  color: string;
  reminder_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface LessonInput {
  subject_id?: number | null;
  title: string;
  description?: string;
  day_of_week?: number;
  days_of_week?: number[];
  start_time: string; // "HH:mm" e.g. "10:00"
  end_time?: string | null;
  location?: string;
  color?: string;
  reminder_minutes?: number;
}

export interface DayOfWeekOption {
  value: number;
  label: string;
  short: string;
}

export const DAYS_OF_WEEK: DayOfWeekOption[] = [
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
  { value: 0, label: "Sunday", short: "Sun" },
];

export interface ReminderOption {
  value: number;
  label: string;
}

export const REMINDER_OPTIONS: ReminderOption[] = [
  { value: 0, label: "At start of lesson" },
  { value: 5, label: "5 minutes before" },
  { value: 10, label: "10 minutes before" },
  { value: 15, label: "15 minutes before" },
  { value: 30, label: "30 minutes before" },
  { value: 45, label: "45 minutes before" },
  { value: 60, label: "1 hour before" },
  { value: 120, label: "2 hours before" },
  { value: 180, label: "3 hours before" },
  { value: 240, label: "4 hours before" },
  { value: 360, label: "6 hours before" },
  { value: 480, label: "8 hours before" },
  { value: 720, label: "12 hours before" },
  { value: 1440, label: "1 day before" },
  { value: 2880, label: "2 days before" },
  { value: 4320, label: "3 days before" },
];
