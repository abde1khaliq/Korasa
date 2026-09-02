"use client";

import { useEffect, useState, useMemo } from "react";
import {
  X,
  Check,
  ChevronDown,
  Plus,
  Clock,
  BookOpen,
  PlusCircle,
  Loader2,
} from "lucide-react";
import { useSubjects } from "@/app/hooks/useSubjects";
import { useSession } from "next-auth/react";
import {
  Lesson,
  LessonInput,
  REMINDER_OPTIONS,
  DAYS_OF_WEEK,
} from "@/types/lesson";

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

interface CreateLessonModalProps {
  initialDayOfWeek?: number;
  initialLesson?: Lesson | null;
  onClose: () => void;
  onSubmit: (input: LessonInput, lessonId?: number) => Promise<void>;
}

export function CreateLessonModal({
  initialDayOfWeek = 1,
  initialLesson,
  onClose,
  onSubmit,
}: CreateLessonModalProps) {
  const { data: session } = useSession();
  const { subjects, addSubject } = useSubjects();

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subjects`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.accessToken}`,
            },
            body: JSON.stringify({ name: trimmedNewSubject }),
          },
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to create new subject");
        }
        const createdSubject = await res.json();
        addSubject(createdSubject);
        resolvedSubjectId = createdSubject.id;
        resolvedTitle = createdSubject.name;
      } catch (err: unknown) {
        setIsSubmitting(false);
        setError(err instanceof Error ? err.message : "Failed to create new subject");
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save lesson");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);
  const selectedReminderLabel =
    REMINDER_OPTIONS.find((r) => r.value === reminderMinutes)?.label ??
    `${reminderMinutes} minutes before`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-onyx/40 backdrop-blur-sm p-0 md:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[500px] md:max-w-xl max-h-[92vh] flex flex-col animate-[slideUp_0.25s_ease-out] md:animate-in md:fade-in md:zoom-in-95 rounded-t-3xl md:rounded-3xl bg-paper md:border md:border-rule md:shadow-xl overflow-hidden my-0 md:my-6">
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between border-b border-rule/60 px-6 py-4 md:py-5">
          <div>
            <h2 className="font-display text-[20px] md:text-[22px] font-normal text-ink">
              {initialLesson ? "Edit recurring lesson" : "New recurring lesson"}
            </h2>
            <p className="text-[12px] text-ink-soft hidden md:block">
              Schedule weekly classes and automatic study reminders.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-ink-soft hover:text-ink hover:bg-tag/60 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </header>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="overflow-y-auto px-6 py-5 space-y-5">
          {/* Subject Field */}
          <div>
            <div className="flex items-center justify-between">
              <label className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
                Subject *
              </label>
              {hasExistingSubjects && (
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNewSubject(!isCreatingNewSubject);
                    setOpenSubjectSelect(false);
                  }}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-brand hover:underline cursor-pointer"
                >
                  {isCreatingNewSubject ? (
                    <span>Choose existing subject</span>
                  ) : (
                    <>
                      <PlusCircle className="size-3.5 text-brand" />
                      <span>New subject</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {isCreatingNewSubject ? (
              <div className="mt-2">
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="e.g. Physics, Mathematics, Biology"
                  autoFocus={!initialLesson}
                  className="w-full rounded-xl border border-brand bg-paper-card px-4 py-3 text-[15px] font-medium text-ink placeholder:text-ink-faint outline-none transition-colors"
                />
                <p className="mt-1 text-[11px] text-ink-faint">
                  Creates a subject and sets it as the lesson title
                </p>
              </div>
            ) : (
              <div className="relative mt-2">
                <button
                  type="button"
                  onClick={() => setOpenSubjectSelect((o) => !o)}
                  className="flex w-full items-center justify-between rounded-xl border border-rule bg-paper-card px-4 py-3 text-left transition-colors hover:border-brand cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <BookOpen className="size-4 text-brand shrink-0" />
                    <span
                      className={`text-[15px] truncate ${
                        selectedSubject ? "font-medium text-ink" : "text-ink-faint"
                      }`}
                    >
                      {selectedSubject ? selectedSubject.name : "Select a subject"}
                    </span>
                  </div>
                  <ChevronDown
                    className={`size-4 text-ink-soft transition-transform ${
                      openSubjectSelect ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openSubjectSelect && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-52 overflow-y-auto rounded-xl border border-rule bg-paper shadow-xl">
                    {subjects.map((s) => {
                      const isSel = s.id === selectedSubjectId;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setSelectedSubjectId(s.id);
                            setOpenSubjectSelect(false);
                          }}
                          className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-[14px] transition-colors hover:bg-tag/40 cursor-pointer ${
                            isSel ? "bg-brand/10 font-semibold text-brand" : "text-ink"
                          }`}
                        >
                          <span>{s.name}</span>
                          {isSel && <Check className="size-4 text-brand" />}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingNewSubject(true);
                        setOpenSubjectSelect(false);
                      }}
                      className="flex w-full items-center gap-2 border-t border-rule bg-paper px-4 py-2.5 text-left text-[13px] font-medium text-brand hover:bg-tag/40 cursor-pointer"
                    >
                      <Plus className="size-4" />
                      <span>+ Create a new subject…</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recurring Days */}
          <div>
            <div className="flex items-center justify-between">
              <label className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
                Recurring Day(s) *
              </label>
              {!initialLesson && (
                <span className="text-[11px] text-ink-faint">
                  Select all days that apply
                </span>
              )}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1.5">
              {DAYS_OF_WEEK.map((d) => {
                const isSel = selectedDays.includes(d.value);
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => toggleDay(d.value)}
                    className={`py-2 rounded-xl text-[13px] transition-all cursor-pointer ${
                      isSel
                        ? "border border-onyx bg-onyx text-paper font-semibold shadow-xs"
                        : "border border-rule bg-paper-card text-ink-soft hover:bg-tag/40"
                    }`}
                  >
                    {d.short}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start Time Visual Picker */}
          <div>
            <div className="flex items-center justify-between">
              <label className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
                Start Time *
              </label>
              <div className="flex items-center gap-1.5 rounded-full border border-brand/30 bg-paper px-3 py-0.5">
                <Clock className="size-3.5 text-brand" />
                <span className="font-mono text-[13px] font-bold text-brand">
                  {formattedDisplayTime}
                </span>
              </div>
            </div>

            {/* AM / PM Segmented Control */}
            <div className="mt-2 flex rounded-xl border border-rule bg-paper-card p-1">
              <button
                type="button"
                onClick={() => setSelectedAmPm("AM")}
                className={`flex-1 py-1.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
                  selectedAmPm === "AM"
                    ? "bg-onyx text-paper font-semibold shadow-xs"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                AM (Morning)
              </button>
              <button
                type="button"
                onClick={() => setSelectedAmPm("PM")}
                className={`flex-1 py-1.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
                  selectedAmPm === "PM"
                    ? "bg-onyx text-paper font-semibold shadow-xs"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                PM (Afternoon / Evening)
              </button>
            </div>

            {/* Select Hour Chips */}
            <p className="mt-3 text-[11px] font-medium text-ink-faint">
              Select Hour
            </p>
            <div className="mt-1.5 grid grid-cols-6 sm:grid-cols-12 gap-1.5">
              {HOURS.map((h) => {
                const isSel = selectedHour === h;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setSelectedHour(h)}
                    className={`py-2 rounded-xl text-[13px] font-mono transition-all cursor-pointer ${
                      isSel
                        ? "border border-brand bg-brand/15 text-brand font-bold"
                        : "border border-rule bg-paper-card text-ink hover:bg-tag/40"
                    }`}
                  >
                    {h}
                  </button>
                );
              })}
            </div>

            {/* Select Minute Chips */}
            <p className="mt-3 text-[11px] font-medium text-ink-faint">
              Select Minute
            </p>
            <div className="mt-1.5 grid grid-cols-6 sm:grid-cols-12 gap-1.5">
              {MINUTES.map((m) => {
                const isSel = selectedMinute === m;
                const mStr = String(m).padStart(2, "0");
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMinute(m)}
                    className={`py-1.5 rounded-xl text-[12px] font-mono transition-all cursor-pointer ${
                      isSel
                        ? "border border-brand bg-brand/15 text-brand font-bold"
                        : "border border-rule bg-paper-card text-ink hover:bg-tag/40"
                    }`}
                  >
                    :{mStr}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location / Room */}
          <div>
            <label className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
              Location / Room (Optional)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Lecture Hall B, Room 204, Zoom"
              className="mt-2 w-full rounded-xl border border-rule bg-paper-card px-4 py-3 text-[15px] text-ink placeholder:text-ink-faint outline-none focus:border-brand transition-colors"
            />
          </div>

          {/* Weekly Notification Reminder */}
          <div>
            <label className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
              Weekly Notification Reminder
            </label>
            <div className="relative mt-2">
              <button
                type="button"
                onClick={() => setOpenReminderSelect((o) => !o)}
                className="flex w-full items-center justify-between rounded-xl border border-rule bg-paper-card px-4 py-3 text-left transition-colors hover:border-brand cursor-pointer"
              >
                <span className="text-[15px] text-ink">
                  {selectedReminderLabel}
                </span>
                <ChevronDown
                  className={`size-4 text-ink-soft transition-transform ${
                    openReminderSelect ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openReminderSelect && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-52 overflow-y-auto rounded-xl border border-rule bg-paper shadow-xl">
                  {REMINDER_OPTIONS.map((opt) => {
                    const isSel = opt.value === reminderMinutes;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setReminderMinutes(opt.value);
                          setOpenReminderSelect(false);
                        }}
                        className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-[14px] transition-colors hover:bg-tag/40 cursor-pointer ${
                          isSel ? "bg-brand/10 font-semibold text-brand" : "text-ink"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSel && <Check className="size-4 text-brand" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-hard-soft/30 border border-hard/20 p-3 text-[13px] text-hard">
              {error}
            </p>
          )}

          {/* Action Footer */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 border-t border-rule/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-rule text-[14px] text-ink hover:bg-tag/40 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 rounded-xl bg-onyx px-5 py-2.5 text-[14px] font-medium text-paper hover:bg-onyx/90 active:scale-95 disabled:opacity-40 transition-all cursor-pointer shadow-xs"
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" strokeWidth={2.2} />
              )}
              <span>
                {isSubmitting
                  ? "Saving…"
                  : initialLesson
                    ? "Save Changes"
                    : selectedDays.length > 1
                      ? `Create ${selectedDays.length} Lessons`
                      : "Create Lesson"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
