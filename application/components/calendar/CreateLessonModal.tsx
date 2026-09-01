import React, { useState, useEffect, useMemo } from "react";
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
import {
  X,
  Check,
  ChevronDown,
  Plus,
  Clock,
  BookOpen,
  PlusCircle,
} from "lucide-react-native";
import { useSubjects } from "@/hooks/useSubjects";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import {
  Lesson,
  LessonInput,
  REMINDER_OPTIONS,
  DAYS_OF_WEEK,
} from "@/types/lesson";
import { useThemeColor } from "@/hooks/useThemeColor";

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

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
  const { accessToken } = useAuth();
  const { subjects, addSubject } = useSubjects();
  const ink = useThemeColor("#F1EFEC", "#2B2724");
  const inkIcon = useThemeColor("#2B2724", "#F1EFEC");

  const hasExistingSubjects = subjects.length > 0;
  const [isCreatingNewSubject, setIsCreatingNewSubject] = useState<boolean>(
    !initialLesson && !hasExistingSubjects,
  );
  const [newSubjectName, setNewSubjectName] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
    initialLesson?.subject_id ?? (subjects.length > 0 ? subjects[0].id : null),
  );

  useEffect(() => {
    if (
      !initialLesson &&
      !selectedSubjectId &&
      subjects.length > 0 &&
      !isCreatingNewSubject
    ) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, initialLesson, selectedSubjectId, isCreatingNewSubject]);

  const [selectedDays, setSelectedDays] = useState<number[]>(
    initialLesson ? [initialLesson.day_of_week] : [initialDayOfWeek],
  );

  const initialTimeParsed = useMemo(() => {
    if (!initialLesson?.start_time) {
      return { hour: 10, minute: 0, ampm: "AM" as "AM" | "PM" };
    }
    const [hStr, mStr] = initialLesson.start_time.split(":");
    const h = parseInt(hStr, 10) || 0;
    const m = parseInt(mStr, 10) || 0;
    const ampm: "AM" | "PM" = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return { hour: h12, minute: m, ampm };
  }, [initialLesson]);

  const [selectedHour, setSelectedHour] = useState<number>(
    initialTimeParsed.hour,
  );
  const [selectedMinute, setSelectedMinute] = useState<number>(
    initialTimeParsed.minute,
  );
  const [selectedAmPm, setSelectedAmPm] = useState<"AM" | "PM">(
    initialTimeParsed.ampm,
  );

  const [location, setLocation] = useState(initialLesson?.location ?? "");
  const [reminderMinutes, setReminderMinutes] = useState<number>(
    initialLesson?.reminder_minutes ?? 15,
  );

  const [openSubjectSelect, setOpenSubjectSelect] = useState(false);
  const [openReminderSelect, setOpenReminderSelect] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleDay = (dayValue: number) => {
    if (initialLesson) {
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

  const computed24hTime = useMemo(() => {
    let h24 = selectedHour;
    if (selectedAmPm === "PM" && selectedHour < 12) {
      h24 = selectedHour + 12;
    } else if (selectedAmPm === "AM" && selectedHour === 12) {
      h24 = 0;
    }
    const hStr = String(h24).padStart(2, "0");
    const mStr = String(selectedMinute).padStart(2, "0");
    return `${hStr}:${mStr}`;
  }, [selectedHour, selectedMinute, selectedAmPm]);

  const formattedDisplayTime = useMemo(() => {
    const mStr = String(selectedMinute).padStart(2, "0");
    return `${selectedHour}:${mStr} ${selectedAmPm}`;
  }, [selectedHour, selectedMinute, selectedAmPm]);

  const handleSave = async () => {
    setError(null);

    let resolvedSubjectId: number | null = null;
    let resolvedTitle = "";

    if (isCreatingNewSubject) {
      const trimmedNewSubject = newSubjectName.trim();
      if (!trimmedNewSubject) {
        setError("Please enter a subject name (e.g. Physics, Calculus)");
        return;
      }
      setIsSubmitting(true);
      try {
        const createdSubject = await apiFetch("/api/subjects", {
          method: "POST",
          body: JSON.stringify({ name: trimmedNewSubject }),
          token: accessToken!,
        });
        addSubject(createdSubject);
        resolvedSubjectId = createdSubject.id;
        resolvedTitle = createdSubject.name;
      } catch (err: any) {
        setIsSubmitting(false);
        setError(err?.message || "Failed to create new subject");
        return;
      }
    } else {
      const existing = subjects.find((s) => s.id === selectedSubjectId);
      if (!existing) {
        setError("Please select a subject or create a new one");
        return;
      }
      resolvedSubjectId = existing.id;
      resolvedTitle = existing.name;
    }

    if (selectedDays.length === 0) {
      setError("Please select at least one recurring day");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: LessonInput = {
        title: resolvedTitle,
        subject_id: resolvedSubjectId,
        start_time: computed24hTime,
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

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);
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
            <View className="flex-row items-center justify-between border-b border-rule px-6 py-5">
              <Pressable onPress={onClose}>
                <X size={22} color="#6E655C" strokeWidth={1.75} />
              </Pressable>
              <Text className="text-[17px] font-semibold text-ink">
                {initialLesson
                  ? "Edit recurring lesson"
                  : "New recurring lesson"}
              </Text>
              <View style={{ width: 22 }} />
            </View>

            <ScrollView
              className="px-6"
              contentContainerStyle={{
                paddingTop: 20,
                paddingBottom: 40,
                gap: 20,
              }}
              keyboardShouldPersistTaps="handled"
            >
              <View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-[12px] uppercase tracking-widest text-ink-faint">
                    Subject *
                  </Text>
                  {hasExistingSubjects && (
                    <Pressable
                      onPress={() => {
                        setIsCreatingNewSubject(!isCreatingNewSubject);
                        setOpenSubjectSelect(false);
                      }}
                      className="flex-row items-center"
                      style={{ gap: 4 }}
                    >
                      {isCreatingNewSubject ? (
                        <Text className="text-[12px] font-semibold text-brand">
                          Choose existing subject
                        </Text>
                      ) : (
                        <>
                          <PlusCircle
                            size={13}
                            color="#A8703F"
                            strokeWidth={2}
                          />
                          <Text className="text-[12px] font-semibold text-brand">
                            New subject
                          </Text>
                        </>
                      )}
                    </Pressable>
                  )}
                </View>

                {isCreatingNewSubject ? (
                  <View className="mt-2">
                    <TextInput
                      value={newSubjectName}
                      onChangeText={setNewSubjectName}
                      placeholder="e.g. Physics, Mathematics, Biology"
                      placeholderTextColor="#9C9086"
                      className="rounded-xl border border-brand bg-paper-card px-4 py-3.5 text-[15px] font-medium text-ink"
                      autoFocus={!initialLesson}
                    />
                    <Text className="mt-1 text-[11px] text-ink-faint">
                      Creates a subject and sets it as the lesson title
                    </Text>
                  </View>
                ) : (
                  <>
                    <Pressable
                      onPress={() => setOpenSubjectSelect((o) => !o)}
                      className="mt-2 flex-row items-center justify-between rounded-xl border border-rule bg-paper-card px-4 py-3.5"
                    >
                      <View
                        className="flex-row items-center"
                        style={{ gap: 8 }}
                      >
                        <BookOpen size={16} color="#A8703F" strokeWidth={2} />
                        <Text
                          className={
                            selectedSubject
                              ? "text-[15px] font-medium text-ink"
                              : "text-[15px] text-ink-faint"
                          }
                        >
                          {selectedSubject
                            ? selectedSubject.name
                            : "Select a subject"}
                        </Text>
                      </View>
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
                        {subjects.map((s) => {
                          const isSel = s.id === selectedSubjectId;
                          return (
                            <Pressable
                              key={s.id}
                              onPress={() => {
                                setSelectedSubjectId(s.id);
                                setOpenSubjectSelect(false);
                              }}
                              className={`flex-row items-center justify-between border-b border-rule px-4 py-3 ${
                                isSel ? "bg-brand/10" : ""
                              }`}
                            >
                              <Text
                                className={`text-[15px] ${
                                  isSel
                                    ? "font-semibold text-brand"
                                    : "text-ink"
                                }`}
                              >
                                {s.name}
                              </Text>
                              {isSel && (
                                <Check
                                  size={16}
                                  color="#A8703F"
                                  strokeWidth={2}
                                />
                              )}
                            </Pressable>
                          );
                        })}

                        <Pressable
                          onPress={() => {
                            setIsCreatingNewSubject(true);
                            setOpenSubjectSelect(false);
                          }}
                          className="flex-row items-center bg-paper px-4 py-3"
                          style={{ gap: 8 }}
                        >
                          <Plus size={16} color="#A8703F" strokeWidth={2} />
                          <Text className="text-[14px] font-semibold text-brand">
                            + Create a new subject…
                          </Text>
                        </Pressable>
                      </View>
                    )}
                  </>
                )}
              </View>

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

              <View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-[12px] uppercase tracking-widest text-ink-faint">
                    Start Time *
                  </Text>
                  <View
                    className="flex-row items-center rounded-full bg-paper px-3 py-1 border border-brand/30"
                    style={{ gap: 6 }}
                  >
                    <Clock size={13} color="#A8703F" strokeWidth={2} />
                    <Text className="text-[14px] font-bold text-brand">
                      {formattedDisplayTime}
                    </Text>
                  </View>
                </View>

                <View className="mt-2.5 flex-row rounded-xl border border-rule bg-paper-card p-1">
                  <Pressable
                    onPress={() => setSelectedAmPm("AM")}
                    className={`flex-1 items-center rounded-lg py-2 ${
                      selectedAmPm === "AM" ? "bg-onyx" : "bg-transparent"
                    }`}
                  >
                    <Text
                      className={`text-[13px] font-semibold ${
                        selectedAmPm === "AM" ? "text-paper" : "text-ink-soft"
                      }`}
                    >
                      AM (Morning)
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setSelectedAmPm("PM")}
                    className={`flex-1 items-center rounded-lg py-2 ${
                      selectedAmPm === "PM" ? "bg-onyx" : "bg-transparent"
                    }`}
                  >
                    <Text
                      className={`text-[13px] font-semibold ${
                        selectedAmPm === "PM" ? "text-paper" : "text-ink-soft"
                      }`}
                    >
                      PM (Afternoon / Evening)
                    </Text>
                  </Pressable>
                </View>

                <Text className="mt-3 text-[11px] font-medium text-ink-faint">
                  Select Hour
                </Text>
                <View className="mt-1.5 flex-row flex-wrap" style={{ gap: 6 }}>
                  {HOURS.map((h) => {
                    const isSel = selectedHour === h;
                    return (
                      <Pressable
                        key={h}
                        onPress={() => setSelectedHour(h)}
                        className={`flex-1 min-w-[44px] items-center rounded-xl border py-2.5 ${
                          isSel
                            ? "border-brand bg-brand/15"
                            : "border-rule bg-paper-card"
                        }`}
                      >
                        <Text
                          className={`text-[14px] ${
                            isSel
                              ? "font-bold text-brand"
                              : "font-medium text-ink"
                          }`}
                        >
                          {h}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text className="mt-3 text-[11px] font-medium text-ink-faint">
                  Select Minute
                </Text>
                <View className="mt-1.5 flex-row flex-wrap" style={{ gap: 6 }}>
                  {MINUTES.map((m) => {
                    const isSel = selectedMinute === m;
                    const mStr = String(m).padStart(2, "0");
                    return (
                      <Pressable
                        key={m}
                        onPress={() => setSelectedMinute(m)}
                        className={`flex-1 min-w-[44px] items-center rounded-xl border py-2 ${
                          isSel
                            ? "border-brand bg-brand/15"
                            : "border-rule bg-paper-card"
                        }`}
                      >
                        <Text
                          className={`text-[13px] ${
                            isSel
                              ? "font-bold text-brand"
                              : "font-medium text-ink"
                          }`}
                        >
                          :{mStr}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View>
                <Text className="text-[12px] uppercase tracking-widest text-ink-faint">
                  Location / Room (optional)
                </Text>
                <TextInput
                  value={location}
                  onChangeText={setLocation}
                  placeholder="e.g. Lecture Hall B, Room 204, Zoom"
                  placeholderTextColor="#9C9086"
                  className="mt-2 rounded-xl border border-rule bg-paper-card px-4 py-3.5 text-[15px] text-ink"
                />
              </View>

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

              {error && <Text className="text-[14px] text-hard">{error}</Text>}

              <Pressable
                onPress={handleSave}
                disabled={isSubmitting}
                className="mt-2 flex-row items-center justify-center rounded-xl bg-onyx py-4 shadow-sm"
                style={{
                  gap: 8,
                  opacity: isSubmitting ? 0.5 : 1,
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
