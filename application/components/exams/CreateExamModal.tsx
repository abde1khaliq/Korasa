import { useEffect, useState } from "react";
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
import { X, Check, ChevronDown, Plus } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, ApiError } from "@/lib/api";
import { useSubjects } from "@/hooks/useSubjects";
import { useEligibleCount } from "@/hooks/useEligibleCount";
import {
  Difficulty,
  difficultyStyles,
  difficultyHex,
} from "@/components/misc/Screen";
import { examTypeLabels, examTypeDescriptions } from "@/lib/examUtils";
import { Exam, ExamType } from "@/types/exam";
import { useThemeColor } from "@/hooks/useThemeColor";

interface FolderOption {
  id: number;
  name: string;
}

const difficultyToApi: Record<Difficulty, "easy" | "medium" | "hard"> = {
  Easy: "easy",
  Medium: "medium",
  Hard: "hard",
};
const examTypes: ExamType[] = ["practice", "timed", "full"];
const allDifficulties: Difficulty[] = ["Easy", "Medium", "Hard"];

function SelectField<T extends string | number>({
  label,
  value,
  placeholder,
  options,
  getLabel,
  onSelect,
  disabled,
}: {
  label: string;
  value: T | "";
  placeholder: string;
  options: { value: T; label: string }[];
  getLabel: (v: T) => string;
  onSelect: (v: T) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ink = useThemeColor("#2B2724", "#F1EFEC");

  return (
    <View>
      <Text className="text-[12px] tracking-widest text-ink-faint uppercase">
        {label}
      </Text>
      <Pressable
        onPress={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className="mt-2 flex-row items-center justify-between rounded-xl border border-rule bg-paper-card px-4 py-3.5"
        style={{ opacity: disabled ? 0.5 : 1 }}
      >
        <Text
          className={
            value === "" ? "text-[15px] text-ink-faint" : "text-[15px] text-ink"
          }
        >
          {value === "" ? placeholder : getLabel(value)}
        </Text>
        <ChevronDown
          size={18}
          color={ink}
          strokeWidth={1.75}
          style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}
        />
      </Pressable>

      {open && (
        <View className="mt-1.5 overflow-hidden rounded-xl border border-rule bg-paper-card">
          {options.length === 0 ? (
            <Text className="px-4 py-3 text-[14px] text-ink-faint">
              No options available
            </Text>
          ) : (
            options.map((opt, i) => {
              const selected = opt.value === value;
              return (
                <Pressable
                  key={String(opt.value)}
                  onPress={() => {
                    onSelect(opt.value);
                    setOpen(false);
                  }}
                  className="flex-row items-center justify-between px-4 py-3"
                  style={{
                    gap: 8,
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderTopColor: "#E4DED4",
                    backgroundColor: selected
                      ? "rgba(168,112,63,0.08)"
                      : "transparent",
                  }}
                >
                  <Text
                    className={
                      selected
                        ? "text-brand text-[15px]"
                        : "text-ink text-[15px]"
                    }
                    style={{ flex: 1 }}
                  >
                    {opt.label}
                  </Text>
                  {selected && (
                    <Check size={16} color="#A8703F" strokeWidth={2} />
                  )}
                </Pressable>
              );
            })
          )}
        </View>
      )}
    </View>
  );
}

export function CreateExamModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (exam: Exam) => void;
}) {
  const { accessToken } = useAuth();
  const ink = useThemeColor("#F1EFEC", "#2B2724");

  const { subjects } = useSubjects();

  const [name, setName] = useState("");
  const [subjectId, setSubjectId] = useState<number | "">("");
  const [scopeMode, setScopeMode] = useState<"subject" | "folder">("subject");
  const [folders, setFolders] = useState<FolderOption[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [folderId, setFolderId] = useState<number | "">("");
  const [type, setType] = useState<ExamType>("practice");
  const [difficulties, setDifficulties] = useState<Difficulty[]>([
    "Easy",
    "Medium",
    "Hard",
  ]);
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState("15");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!subjectId && subjects.length > 0) setSubjectId(subjects[0].id);
  }, [subjects]);

  useEffect(() => {
    setFolderId("");
    if (scopeMode !== "folder" || !subjectId || !accessToken) {
      setFolders([]);
      return;
    }
    let cancelled = false;
    setLoadingFolders(true);
    apiFetch(`/api/subjects/${subjectId}/folders`, { token: accessToken })
      .then((data: FolderOption[]) => {
        if (!cancelled) setFolders(data);
      })
      .catch(() => {
        if (!cancelled) setFolders([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingFolders(false);
      });
    return () => {
      cancelled = true;
    };
  }, [scopeMode, subjectId, accessToken]);

  const apiScopeId =
    scopeMode === "subject" ? subjectId || null : folderId || null;

  const { count: eligibleCount, isLoading: countLoading } = useEligibleCount(
    apiScopeId ? scopeMode : null,
    apiScopeId,
    difficulties,
  );

  useEffect(() => {
    if (
      eligibleCount !== null &&
      eligibleCount > 0 &&
      questionCount > eligibleCount
    ) {
      setQuestionCount(eligibleCount);
    }
  }, [eligibleCount]);

  const toggleDifficulty = (d: Difficulty) => {
    setDifficulties((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  };

  const scopeReady = scopeMode === "subject" ? !!subjectId : !!folderId;
  const trimmedName = name.trim();
  const timeValid = type !== "timed" || Number(timeLimitMinutes) >= 1;
  const countValid =
    type === "full" ||
    (questionCount >= 1 &&
      eligibleCount !== null &&
      questionCount <= eligibleCount);

  const isValid =
    trimmedName.length > 0 &&
    scopeReady &&
    difficulties.length > 0 &&
    eligibleCount !== null &&
    eligibleCount > 0 &&
    countValid &&
    timeValid &&
    !isSubmitting;

  const handleSubmit = async () => {
    if (!isValid || !accessToken) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        name: trimmedName,
        type,
        scope_type: scopeMode,
        scope_id: scopeMode === "subject" ? subjectId : folderId,
        difficulties: difficulties.map((d) => difficultyToApi[d]),
      };
      if (type !== "full") body.question_count = questionCount;
      if (type === "timed") body.time_limit_minutes = Number(timeLimitMinutes);

      const created: Exam = await apiFetch("/api/exams/", {
        method: "POST",
        body: JSON.stringify(body),
        token: accessToken,
      });
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create exam");
    } finally {
      setIsSubmitting(false);
    }
  };

  const subjectOptions = subjects.map((s) => ({ value: s.id, label: s.name }));
  const subjectLabelById = (id: number) =>
    subjects.find((s) => s.id === id)?.name ?? "";
  const folderOptions = folders.map((f) => ({ value: f.id, label: f.name }));
  const folderLabelById = (id: number) =>
    folders.find((f) => f.id === id)?.name ?? "";

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
            style={{ maxHeight: "95%" }}
          >
            <View className="flex-row items-center justify-between px-6 py-5 border-b border-rule">
              <Pressable onPress={onClose}>
                <X size={22} color="#6E655C" strokeWidth={1.75} />
              </Pressable>
              <Text className="text-[17px] text-ink">New exam</Text>
              <View style={{ width: 22 }} />
            </View>

            {subjects.length === 0 ? (
              <Text className="px-6 py-8 text-[15px] text-ink-soft">
                Create a subject first before building an exam.
              </Text>
            ) : (
              <ScrollView
                className="px-6"
                contentContainerStyle={{
                  paddingTop: 20,
                  paddingBottom: 40,
                  gap: 20,
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true}
              >
                <View>
                  <Text className="text-[12px] tracking-widest text-ink-faint uppercase">
                    Exam name
                  </Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Midterm review"
                    className="mt-2 rounded-xl border border-rule bg-paper-card px-4 text-[15px] text-ink"
                    style={{ paddingVertical: 14 }}
                  />
                </View>

                <SelectField
                  label="Subject"
                  value={subjectId}
                  placeholder="Select a subject…"
                  options={subjectOptions}
                  getLabel={subjectLabelById}
                  onSelect={(v) => setSubjectId(v)}
                />

                <View>
                  <Text className="text-[12px] tracking-widest text-ink-faint uppercase mb-1.5">
                    Scope
                  </Text>
                  <View className="flex-row" style={{ gap: 8 }}>
                    {(["subject", "folder"] as const).map((mode) => {
                      const on = scopeMode === mode;
                      return (
                        <Pressable
                          key={mode}
                          onPress={() => setScopeMode(mode)}
                          className="flex-1 items-center rounded-xl border py-2.5"
                          style={{
                            borderColor: on ? "#A8703F" : "#E4DED4",
                            backgroundColor: on
                              ? "rgba(168,112,63,0.08)"
                              : "transparent",
                          }}
                        >
                          <Text
                            className={on ? "text-brand" : "text-ink-soft"}
                            style={{ fontSize: 14, fontWeight: "500" }}
                          >
                            {mode === "subject"
                              ? "Whole subject"
                              : "Specific folder"}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {scopeMode === "folder" &&
                  (loadingFolders ? (
                    <View className="flex-row items-center" style={{ gap: 8 }}>
                      <ActivityIndicator size="small" color="#6E655C" />
                      <Text className="text-[14px] text-ink-soft">
                        Loading folders…
                      </Text>
                    </View>
                  ) : (
                    <SelectField
                      label="Folder"
                      value={folderId}
                      placeholder="Select a folder…"
                      options={folderOptions}
                      getLabel={folderLabelById}
                      onSelect={(v) => setFolderId(v)}
                      disabled={!subjectId}
                    />
                  ))}

                <View>
                  <Text className="text-[12px] tracking-widest text-ink-faint uppercase mb-1.5">
                    Type
                  </Text>
                  <View style={{ gap: 8 }}>
                    {examTypes.map((t) => {
                      const on = t === type;
                      return (
                        <Pressable
                          key={t}
                          onPress={() => setType(t)}
                          className="rounded-xl border px-4 py-3"
                          style={{
                            borderColor: on ? "#A8703F" : "#E4DED4",
                            backgroundColor: on
                              ? "rgba(168,112,63,0.08)"
                              : "transparent",
                          }}
                        >
                          <Text
                            className={on ? "text-brand" : "text-ink"}
                            style={{ fontSize: 15, fontWeight: "500" }}
                          >
                            {examTypeLabels[t]}
                          </Text>
                          <Text className="mt-0.5 text-[13px] text-ink-faint">
                            {examTypeDescriptions[t]}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View>
                  <Text className="text-[12px] tracking-widest text-ink-faint uppercase mb-1.5">
                    Difficulty
                  </Text>
                  <View className="flex-row" style={{ gap: 8 }}>
                    {allDifficulties.map((d) => {
                      const s = difficultyStyles[d];
                      const on = difficulties.includes(d);
                      return (
                        <Pressable
                          key={d}
                          onPress={() => toggleDifficulty(d)}
                          className={`flex-1 items-center rounded-xl border py-2.5 ${on ? s.pillBg : "bg-paper-card"}`}
                          style={{
                            borderColor: on ? difficultyHex[d] : "#E4DED4",
                          }}
                        >
                          <Text
                            className={`text-[14px] ${on ? s.pillText : "text-ink"}`}
                          >
                            {d}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <Text className="mt-2 text-[13px] text-ink-faint">
                    {!scopeReady
                      ? "Pick a scope to see how many questions match."
                      : countLoading
                        ? "Checking available questions…"
                        : eligibleCount === null
                          ? " "
                          : eligibleCount === 0
                            ? "No questions match these difficulties in this scope."
                            : `${eligibleCount} question${eligibleCount === 1 ? "" : "s"} available`}
                  </Text>
                </View>

                {type !== "full" && (
                  <View>
                    <Text className="text-[12px] tracking-widest text-ink-faint uppercase mb-1.5">
                      Number of questions
                    </Text>
                    <View className="flex-row items-center justify-between rounded-xl border border-rule bg-paper-card px-4 py-2">
                      <Pressable
                        onPress={() =>
                          setQuestionCount((c) => Math.max(1, c - 1))
                        }
                        className="items-center justify-center"
                        style={{ width: 36, height: 36 }}
                      >
                        <Text className="text-[20px] text-ink">–</Text>
                      </Pressable>
                      <Text className="text-[17px] text-ink">
                        {questionCount}
                      </Text>
                      <Pressable
                        onPress={() =>
                          setQuestionCount((c) =>
                            eligibleCount
                              ? Math.min(eligibleCount, c + 1)
                              : c + 1,
                          )
                        }
                        className="items-center justify-center"
                        style={{ width: 36, height: 36 }}
                      >
                        <Plus size={18} color="#2B2724" strokeWidth={1.75} />
                      </Pressable>
                    </View>
                  </View>
                )}

                {type === "timed" && (
                  <View>
                    <Text className="text-[12px] tracking-widest text-ink-faint uppercase mb-1.5">
                      Time limit (minutes)
                    </Text>
                    <TextInput
                      value={timeLimitMinutes}
                      onChangeText={(v) =>
                        setTimeLimitMinutes(v.replace(/[^0-9]/g, ""))
                      }
                      keyboardType="number-pad"
                      className="rounded-xl border border-rule bg-paper-card px-4 text-[15px] text-ink"
                      style={{ paddingVertical: 14 }}
                    />
                  </View>
                )}

                {error && (
                  <Text className="text-[14px] text-hard">{error}</Text>
                )}

                <Pressable
                  onPress={handleSubmit}
                  disabled={!isValid}
                  className="mt-1 flex-row items-center justify-center rounded-xl bg-onyx py-3.5"
                  style={{ gap: 8, opacity: !isValid ? 0.4 : 1 }}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#F7F5F1" />
                  ) : (
                    <Plus size={18} color={ink} strokeWidth={1.75} />
                  )}
                  <Text
                    className="text-[15px] text-paper"
                    style={{ fontWeight: "500" }}
                  >
                    {isSubmitting ? "Creating…" : "Create exam"}
                  </Text>
                </Pressable>
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
