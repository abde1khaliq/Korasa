import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { X, Check, ChevronDown, Plus, Clock, Repeat } from "lucide-react-native";
import { useSubjects } from "@/hooks/useSubjects";
import { Lesson, LessonInput, REMINDER_OPTIONS, DAYS_OF_WEEK } from "@/types/lesson";
import { formatTime24to12 } from "@/lib/lessonUtils";
import { useThemeColor } from "@/hooks/useThemeColor";

const DURATION_PRESETS = [
  { label: "30m", minutes: 30 },
  { label: "45m", minutes: 45 },
  { label: "1h", minutes: 60 },
  { label: "1.5h", minutes: 90 },
  { label: "2h", minutes: 120 },
];

const TIME_PRESETS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "20:00"
];

interface CreateLessonModalProps {
  initialDayOfWeek: number;
  initialLesson?: Lesson | null;
  onClose: () => void;
  onSubmit: (input: LessonInput, lessonId?: number) => Promise<void>;
}

export function CreateLessonModal({
  initialDayOfWeek,
  initialLesson,
  onClose,
  onSubmit,
}: CreateLessonModalProps) {
  const { subjects } = useSubjects();
  const ink = useThemeColor("#F1EFEC", "#2B2724");
  const inkIcon = useThemeColor("#2B2724", "#F1EFEC");

  const [title, setTitle] = useState(initialLesson?.title ?? "");
  const [subjectId, setSubjectId] = useState<number | null>(
    initialLesson?.subject_id ?? null
  );

  // Selected recurring days (array of 0..6)
  const [selectedDays, setSelectedDays] = useState<number[]>(
    initialLesson ? [initialLesson.day_of_week] : [initialDayOfWeek]
  );

  const [timeString, setTimeString] = useState(initialLesson?.start_time ?? "10:00");
  const [durationMinutes, setDurationMinutes] = useState(
    initialLesson && initialLesson.end_time
      ? (() => {
          const [sH, sM] = initialLesson.start_time.split(":").map(Number);
          const [eH, eM] = initialLesson.end_time.split(":").map(Number);
          return Math.max(15, (eH * 60 + eM) - (sH * 60 + sM));
        })()
      : 60
  );
  const [location, setLocation] = useState(initialLesson?.location ?? "");
  const [reminderMinutes, setReminderMinutes] = useState<number>(
    initialLesson?.reminder_minutes ?? 15
  );
  const [description, setDescription] = useState(
    initialLesson?.description ?? ""
  );

  const [openSubjectSelect, setOpenSubjectSelect] = useState(false);
  const [openTimeSelect, setOpenTimeSelect] = useState(false);
  const [openReminderSelect, setOpenReminderSelect] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleDay = (dayValue: number) => {
    if (initialLesson) {
      // In edit mode, switch single day
      setSelectedDays([dayValue]);
      return;
    }
    if (selectedDays.includes(dayValue)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== dayValue));
      }
    } else {
      setSelectedDays([...selectedDays, dayValue]);
    }
  };

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Please enter a lesson title");
      return;
    }
    if (selectedDays.length === 0) {
      setError("Please select at least one day for the recurring lesson");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Calculate end time string "HH:mm"
      const [sH, sM] = timeString.split(":").map(Number);
      const totalEndMins = sH * 60 + sM + durationMinutes;
      const endH = String(Math.floor(totalEndMins / 60) % 24).padStart(2, "0");
      const endM = String(totalEndMins % 60).padStart(2, "0");
      const calculatedEndTime = `${endH}:${endM}`;

      const payload: LessonInput = {
        title: trimmedTitle,
        subject_id: subjectId,
        description: description.trim() || undefined,
        start_time: timeString,
        end_time: calculatedEndTime,
        location: location.trim() || undefined,
        reminder_minutes: reminderMinutes,
        days_of_week: selectedDays,
        day_of_week: selectedDays[0],
      };

      await onSubmit(payload, initialLesson?.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to save lesson");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSubject = subjects.find((s) => s.id === subjectId);
  const selectedReminderLabel =
    REMINDER_OPTIONS.find((r) => r.value === reminderMinutes)?.label ??
    `${reminderMinutes} minutes before`;

  return (
    <Modal
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(42,39,36,0.4)" }}
          onPress={onClose}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="rounded-t-3xl bg-paper"
            style={{ maxHeight: "92%" }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between border-b border-rule px-6 py-5">
              <Pressable onPress={onClose}>
                <X size={22} color="#6E655C" strokeWidth={1.75} />
              </Pressable>
              <Text className="text-[17px] font-semibold text-ink">
                {initialLesson ? "Edit recurring lesson" : "New recurring lesson"}
              </Text>
              <View style={{ width: 22 }} />
            </View>

            <ScrollView
              className="px-6"
              contentContainerStyle={{
                paddingTop: 20,
                paddingBottom: 40,
                gap: 18,
              }}
              keyboardShouldPersistTaps="handled"
            >
              {/* Title */}
              <View>
                <Text className="text-[12px] uppercase tracking-widest text-ink-faint">
                  Lesson Title *
                </Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g. Physics Lecture, Math Recitation"
                  className="mt-2 rounded-xl border border-rule bg-paper-card px-4 py-3.5 text-[15px] text-ink"
                />
              </View>

              {/* Day(s) of Week Selector */}
              <View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-[12px] uppercase tracking-widest text-ink-faint">
                    Recurring Day(s) *
                  </Text>
                  {!initialLesson && (
                    <Text className="text-[11px] text-ink-faint">
                      Select all days that apply
                    </Text>
                  )}
                </View>
                <View className="mt-2 flex-row flex-wrap" style={{ gap: 6 }}>
                  {DAYS_OF_WEEK.map((d) => {
                    const isSel = selectedDays.includes(d.value);
                    return (
                      <Pressable
                        key={d.value}
                        onPress={() => toggleDay(d.value)}
                        className={`flex-1 min-w-[42px] items-center rounded-xl border py-2.5 ${
                          isSel
                            ? "border-onyx bg-onyx"
                            : "border-rule bg-paper-card"
                        }`}
                      >
                        <Text
                          className={`text-[13px] ${
                            isSel
                              ? "font-semibold text-paper"
                              : "font-medium text-ink-soft"
                          }`}
                        >
                          {d.short}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Subject Selector */}
              <View>
                <Text className="text-[12px] uppercase tracking-widest text-ink-faint">
                  Subject (optional)
                </Text>
                <Pressable
                  onPress={() => setOpenSubjectSelect((o) => !o)}
                  className="mt-2 flex-row items-center justify-between rounded-xl border border-rule bg-paper-card px-4 py-3.5"
                >
                  <Text
                    className={
                      selectedSubject
                        ? "text-[15px] text-ink"
                        : "text-[15px] text-ink-faint"
                    }
                  >
                    {selectedSubject ? selectedSubject.name : "None (General)"}
                  </Text>
                  <ChevronDown
                    size={18}
                    color={inkIcon}
                    strokeWidth={1.75}
                    style={{
                      transform: [
                        { rotate: openSubjectSelect ? "180deg" : "0deg" },
                      ],
                    }}
                  />
                </Pressable>

                {openSubjectSelect && (
                  <View className="mt-1.5 overflow-hidden rounded-xl border border-rule bg-paper-card">
                    <Pressable
                      onPress={() => {
                        setSubjectId(null);
                        setOpenSubjectSelect(false);
                      }}
                      className="flex-row items-center justify-between border-b border-rule px-4 py-3"
                    >
                      <Text className="text-[15px] text-ink-soft">
                        None (General)
                      </Text>
                      {subjectId === null && (
                        <Check size={16} color="#A8703F" strokeWidth={2} />
                      )}
                    </Pressable>

                    {subjects.map((s) => {
                      const isSel = s.id === subjectId;
                      return (
                        <Pressable
                          key={s.id}
                          onPress={() => {
                            setSubjectId(s.id);
                            setOpenSubjectSelect(false);
                          }}
                          className={`flex-row items-center justify-between border-b border-rule px-4 py-3 ${
                            isSel ? "bg-brand/10" : ""
                          }`}
                        >
                          <Text
                            className={`text-[15px] ${
                              isSel ? "font-semibold text-brand" : "text-ink"
                            }`}
                          >
                            {s.name}
                          </Text>
                          {isSel && (
                            <Check size={16} color="#A8703F" strokeWidth={2} />
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* Start Time Picker */}
              <View>
                <Text className="text-[12px] uppercase tracking-widest text-ink-faint">
                  Start Time
                </Text>
                <Pressable
                  onPress={() => setOpenTimeSelect((o) => !o)}
                  className="mt-2 flex-row items-center justify-between rounded-xl border border-rule bg-paper-card px-4 py-3.5"
                >
                  <Text className="text-[15px] font-semibold text-ink">
                    {formatTime24to12(timeString)}
                  </Text>
                  <Clock size={16} color="#9C9086" strokeWidth={1.75} />
                </Pressable>
              </View>

              {/* Time dropdown grid */}
              {openTimeSelect && (
                <View className="rounded-xl border border-rule bg-paper-card p-3">
                  <Text className="mb-2 text-[12px] font-medium text-ink-faint">
                    Select Start Time
                  </Text>
                  <View className="flex-row flex-wrap" style={{ gap: 6 }}>
                    {TIME_PRESETS.map((t) => {
                      const isSel = t === timeString;
                      return (
                        <Pressable
                          key={t}
                          onPress={() => {
                            setTimeString(t);
                            setOpenTimeSelect(false);
                          }}
                          className={`rounded-lg px-2.5 py-1.5 ${
                            isSel ? "bg-onyx" : "bg-paper border border-rule"
                          }`}
                        >
                          <Text
                            className={`text-[12px] ${
                              isSel ? "font-semibold text-paper" : "text-ink"
                            }`}
                          >
                            {formatTime24to12(t)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Duration Presets */}
              <View>
                <Text className="text-[12px] uppercase tracking-widest text-ink-faint">
                  Duration
                </Text>
                <View className="mt-2 flex-row" style={{ gap: 8 }}>
                  {DURATION_PRESETS.map((preset) => {
                    const isSel = durationMinutes === preset.minutes;
                    return (
                      <Pressable
                        key={preset.label}
                        onPress={() => setDurationMinutes(preset.minutes)}
                        className={`flex-1 items-center rounded-xl border py-2.5 ${
                          isSel
                            ? "border-brand bg-brand/10"
                            : "border-rule bg-paper-card"
                        }`}
                      >
                        <Text
                          className={`text-[13px] ${
                            isSel ? "font-semibold text-brand" : "text-ink-soft"
                          }`}
                        >
                          {preset.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Location */}
              <View>
                <Text className="text-[12px] uppercase tracking-widest text-ink-faint">
                  Location / Room (optional)
                </Text>
                <TextInput
                  value={location}
                  onChangeText={setLocation}
                  placeholder="e.g. Lecture Hall B, Room 204, Zoom"
                  className="mt-2 rounded-xl border border-rule bg-paper-card px-4 py-3.5 text-[15px] text-ink"
                />
              </View>

              {/* Reminder Selector */}
              <View>
                <Text className="text-[12px] uppercase tracking-widest text-ink-faint">
                  Weekly Notification Reminder
                </Text>
                <Pressable
                  onPress={() => setOpenReminderSelect((o) => !o)}
                  className="mt-2 flex-row items-center justify-between rounded-xl border border-rule bg-paper-card px-4 py-3.5"
                >
                  <Text className="text-[15px] text-ink">
                    {selectedReminderLabel}
                  </Text>
                  <ChevronDown
                    size={18}
                    color={inkIcon}
                    strokeWidth={1.75}
                    style={{
                      transform: [
                        { rotate: openReminderSelect ? "180deg" : "0deg" },
                      ],
                    }}
                  />
                </Pressable>

                {openReminderSelect && (
                  <View className="mt-1.5 overflow-hidden rounded-xl border border-rule bg-paper-card">
                    {REMINDER_OPTIONS.map((opt) => {
                      const isSel = opt.value === reminderMinutes;
                      return (
                        <Pressable
                          key={opt.value}
                          onPress={() => {
                            setReminderMinutes(opt.value);
                            setOpenReminderSelect(false);
                          }}
                          className={`flex-row items-center justify-between border-b border-rule px-4 py-3 ${
                            isSel ? "bg-brand/10" : ""
                          }`}
                        >
                          <Text
                            className={`text-[15px] ${
                              isSel ? "font-semibold text-brand" : "text-ink"
                            }`}
                          >
                            {opt.label}
                          </Text>
                          {isSel && (
                            <Check size={16} color="#A8703F" strokeWidth={2} />
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* Notes */}
              <View>
                <Text className="text-[12px] uppercase tracking-widest text-ink-faint">
                  Notes / Agenda (optional)
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Add topics, syllabus hints, or preparation notes…"
                  multiline
                  className="mt-2 rounded-xl border border-rule bg-paper-card p-4 text-[15px] text-ink"
                  style={{ minHeight: 70 }}
                />
              </View>

              {/* Error message */}
              {error && <Text className="text-[14px] text-hard">{error}</Text>}

              {/* Submit Button */}
              <Pressable
                onPress={handleSave}
                disabled={isSubmitting || !title.trim()}
                className="mt-2 flex-row items-center justify-center rounded-xl bg-onyx py-4 shadow-sm"
                style={{
                  gap: 8,
                  opacity: isSubmitting || !title.trim() ? 0.5 : 1,
                }}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#F7F5F1" />
                ) : (
                  <Plus size={18} color={ink} strokeWidth={2} />
                )}
                <Text className="text-[16px] font-semibold text-paper">
                  {isSubmitting
                    ? "Saving…"
                    : initialLesson
                    ? "Save Changes"
                    : selectedDays.length > 1
                    ? `Create ${selectedDays.length} Lessons`
                    : "Create Lesson"}
                </Text>
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
