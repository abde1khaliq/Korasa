import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Lesson } from "@/types/lesson";
import { formatTime24to12, getDayName } from "@/lib/lessonUtils";
import { getFormattedName } from "@/lib/subjectUtils";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "web") return false;

  try {
    const existing = (await Notifications.getPermissionsAsync()) as {
      granted?: boolean;
      status?: string;
    };
    let isGranted = Boolean(existing.granted || existing.status === "granted");

    if (!isGranted) {
      const requested = (await Notifications.requestPermissionsAsync()) as {
        granted?: boolean;
        status?: string;
      };
      isGranted = Boolean(requested.granted || requested.status === "granted");
    }

    if (!isGranted) {
      return false;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("lesson-reminders", {
        name: "Lesson Reminders",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#A8703F",
      });
    }

    return true;
  } catch (err) {
    console.warn("Error requesting notification permissions:", err);
    return false;
  }
}

function getLessonNotificationId(lessonId: number): string {
  return `lesson-reminder-${lessonId}`;
}

export function generateNotificationMessage(
  lesson: Lesson,
  userName?: string,
): { title: string; body: string } {
  const name = userName ? getFormattedName(userName) : "";
  const prefix = name ? `${name}, ` : "";
  const subjectName = lesson.subject_name || lesson.title;
  const timeFormatted = formatTime24to12(lesson.start_time);
  const dayName = getDayName(lesson.day_of_week);
  const reminderOffset = lesson.reminder_minutes ?? 15;

  let body = "";
  if (reminderOffset === 0) {
    body = `${prefix}your ${subjectName} lesson is starting right now at ${timeFormatted}! 📚`;
  } else if (reminderOffset === 1440) {
    // Exactly 1 day before
    body = `${prefix}tomorrow at ${timeFormatted} you have ${subjectName} lesson.`;
  } else if (reminderOffset === 2880) {
    // 2 days before
    body = `${prefix}in 2 days (${dayName}) at ${timeFormatted} you have ${subjectName} lesson.`;
  } else if (reminderOffset === 4320) {
    // 3 days before
    body = `${prefix}in 3 days (${dayName}) at ${timeFormatted} you have ${subjectName} lesson.`;
  } else if (reminderOffset >= 60) {
    const hours = Math.round(reminderOffset / 60);
    body = `${prefix}today at ${timeFormatted} you have ${subjectName} lesson (in ${hours} ${hours === 1 ? "hour" : "hours"}).`;
  } else {
    body = `${prefix}in ${reminderOffset} minutes you have ${subjectName} lesson at ${timeFormatted}! 📚`;
  }

  if (lesson.location) {
    body += ` · Location: ${lesson.location}`;
  }

  return {
    title: `${subjectName} Lesson Reminder`,
    body,
  };
}

/**
 * Schedules a recurring weekly local push notification for a periodic lesson.
 */
export async function scheduleLessonNotification(
  lesson: Lesson,
  userName?: string,
): Promise<string | null> {
  if (Platform.OS === "web") return null;

  try {
    await cancelLessonNotification(lesson.id);

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    const [sH, sM] = lesson.start_time.split(":").map(Number);
    const reminderOffset = lesson.reminder_minutes ?? 15;

    // Total minutes from Sunday 00:00 of the week
    const lessonWeekMinutes = lesson.day_of_week * 24 * 60 + sH * 60 + sM;
    const totalWeekMinutes = 7 * 24 * 60; // 10080 minutes in a 7-day week

    // Calculate trigger in weekly minutes (wrapping cleanly across the 7-day week)
    let triggerWeekMinutes =
      (lessonWeekMinutes - reminderOffset) % totalWeekMinutes;
    if (triggerWeekMinutes < 0) {
      triggerWeekMinutes += totalWeekMinutes;
    }

    const triggerDayOfWeek = Math.floor(triggerWeekMinutes / (24 * 60)); // 0=Sunday .. 6=Saturday
    const remainingMinutesInDay = triggerWeekMinutes % (24 * 60);
    const triggerHour = Math.floor(remainingMinutesInDay / 60);
    const triggerMinute = remainingMinutesInDay % 60;

    // Weekday in expo-notifications: 1=Sunday, 2=Monday, ..., 7=Saturday
    const expoWeekday = triggerDayOfWeek + 1;

    const { title, body } = generateNotificationMessage(lesson, userName);
    const identifier = getLessonNotificationId(lesson.id);

    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title,
        body,
        data: { lessonId: lesson.id, type: "lesson_reminder" },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: expoWeekday,
        hour: triggerHour,
        minute: triggerMinute,
        channelId: "lesson-reminders",
      },
    });

    return identifier;
  } catch (err) {
    console.warn("Failed to schedule periodic lesson notification:", err);
    return null;
  }
}

/**
 * Cancels a scheduled notification for a given lesson ID.
 */
export async function cancelLessonNotification(
  lessonId: number,
): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const identifier = getLessonNotificationId(lessonId);
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (err) {
    console.warn("Failed to cancel lesson notification:", err);
  }
}

/**
 * Synchronizes weekly notifications for all user lessons.
 */
export async function syncLessonNotifications(
  lessons: Lesson[],
  userName?: string,
): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    for (const lesson of lessons) {
      await scheduleLessonNotification(lesson, userName);
    }
  } catch (err) {
    console.warn("Failed to sync lesson notifications:", err);
  }
}
