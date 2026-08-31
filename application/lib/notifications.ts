import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Lesson } from "@/types/lesson";
import { formatTime24to12, getDayName } from "@/lib/lessonUtils";

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Requests permission from the user for notifications.
 */
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

/**
 * Returns a unique identifier for a lesson's scheduled notification.
 */
function getLessonNotificationId(lessonId: number): string {
  return `lesson-reminder-${lessonId}`;
}

/**
 * Schedules a recurring weekly local push notification for a periodic lesson.
 */
export async function scheduleLessonNotification(lesson: Lesson): Promise<string | null> {
  if (Platform.OS === "web") return null;

  try {
    // Cancel previous notification if exists
    await cancelLessonNotification(lesson.id);

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    const [sH, sM] = lesson.start_time.split(":").map(Number);
    const reminderOffset = lesson.reminder_minutes ?? 15;

    // Total minutes from Sunday 00:00 of the week
    const lessonWeekMinutes = lesson.day_of_week * 24 * 60 + sH * 60 + sM;
    const totalWeekMinutes = 7 * 24 * 60; // 10080 minutes in a 7-day week

    // Calculate trigger in weekly minutes (wrapping cleanly across the 7-day week)
    let triggerWeekMinutes = (lessonWeekMinutes - reminderOffset) % totalWeekMinutes;
    if (triggerWeekMinutes < 0) {
      triggerWeekMinutes += totalWeekMinutes;
    }

    const triggerDayOfWeek = Math.floor(triggerWeekMinutes / (24 * 60)); // 0=Sunday .. 6=Saturday
    const remainingMinutesInDay = triggerWeekMinutes % (24 * 60);
    const triggerHour = Math.floor(remainingMinutesInDay / 60);
    const triggerMinute = remainingMinutesInDay % 60;

    // Weekday in expo-notifications: 1=Sunday, 2=Monday, ..., 7=Saturday
    const expoWeekday = triggerDayOfWeek + 1;

    const timeFormatted = formatTime24to12(lesson.start_time);
    const dayName = getDayName(lesson.day_of_week);

    let reminderText = "Starting now";
    if (reminderOffset > 0) {
      if (reminderOffset >= 1440) {
        const days = Math.round(reminderOffset / 1440);
        reminderText = `Starts in ${days} day${days === 1 ? "" : "s"}`;
      } else if (reminderOffset >= 60) {
        const hours = Math.round(reminderOffset / 60);
        reminderText = `Starts in ${hours} hour${hours === 1 ? "" : "s"}`;
      } else {
        reminderText = `Starts in ${reminderOffset} mins`;
      }
    }

    const bodyParts: string[] = [];
    if (lesson.subject_name) {
      bodyParts.push(lesson.subject_name);
    }
    bodyParts.push(`${reminderText} (${timeFormatted} every ${dayName})`);
    if (lesson.location) {
      bodyParts.push(`@ ${lesson.location}`);
    }

    const identifier = getLessonNotificationId(lesson.id);

    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: `Upcoming Lesson: ${lesson.title}`,
        body: bodyParts.join(" · "),
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
export async function cancelLessonNotification(lessonId: number): Promise<void> {
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
export async function syncLessonNotifications(lessons: Lesson[]): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    for (const lesson of lessons) {
      await scheduleLessonNotification(lesson);
    }
  } catch (err) {
    console.warn("Failed to sync lesson notifications:", err);
  }
}
