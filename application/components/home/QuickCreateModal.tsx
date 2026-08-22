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
import { X, Plus, ChevronDown, Check } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, ApiError } from "@/lib/api";
import { Difficulty, difficultyStyles, difficultyHex } from "@/components/misc/Screen";
import type { Subject } from "@/types/subject";
import { useThemeColor } from "@/hooks/useThemeColor";

interface FolderOption {
  id: number;
  name: string;
}

const MAX_LEN = 2000;
const levels: Difficulty[] = ["Easy", "Medium", "Hard"];
const difficultyToApi: Record<Difficulty, "easy" | "medium" | "hard"> = {
  Easy: "easy",
  Medium: "medium",
  Hard: "hard",
};

// Inline expand/collapse in place of a native <select> — no picker
// dependency is installed in this project, and this project's other
// modals already use pressable-list selection (see difficulty buttons
// in CreateQuestionModal), so this stays consistent with that pattern
// rather than introducing a new UI primitive.
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
      <Text className="text-[12px] tracking-widest text-ink-faint uppercase">{label}</Text>
      <Pressable
        onPress={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className="mt-2 flex-row items-center justify-between rounded-xl border border-rule bg-paper-card px-4 py-3.5"
        style={{ opacity: disabled ? 0.5 : 1 }}
      >
        <Text className={value === "" ? "text-[15px] text-ink-faint" : "text-[15px] text-ink"}>
          {value === "" ? placeholder : getLabel(value)}
        </Text>
        <ChevronDown size={18} color={ink} strokeWidth={1.75} style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }} />
      </Pressable>

      {open && (
        <View className="mt-1.5 overflow-hidden rounded-xl border border-rule bg-paper-card">
          {options.length === 0 ? (
            <Text className="px-4 py-3 text-[14px] text-ink-faint">No options available</Text>
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
                    backgroundColor: selected ? "rgba(168,112,63,0.08)" : "transparent",
                  }}
                >
                  <Text className={selected ? "text-brand text-[15px]" : "text-ink text-[15px]"} style={{ flex: 1 }}>
                    {opt.label}
                  </Text>
                  {selected && <Check size={16} color="#A8703F" strokeWidth={2} />}
                </Pressable>
              );
            })
          )}
        </View>
      )}
    </View>
  );
}

export function QuickCreateModal({
  subjects,
  onClose,
  onFolderCreated,
  onQuestionCreated,
}: {
  subjects: Subject[];
  onClose: () => void;
  onFolderCreated: (subjectId: number) => void;
  onQuestionCreated: (subjectId: number) => void;
}) {
  const { accessToken } = useAuth();
  const ink = useThemeColor("#F1EFEC", "#2B2724");
  const ink2 = useThemeColor("#2B2724", "#F1EFEC");

  const [tab, setTab] = useState<"folder" | "question">("folder");
  const [subjectId, setSubjectId] = useState<number | "">(subjects[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [folderName, setFolderName] = useState("");

  const [folders, setFolders] = useState<FolderOption[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [folderId, setFolderId] = useState<number | "new" | "">("");
  const [newFolderName, setNewFolderName] = useState("");
  const [text, setText] = useState("");
  const [answer, setAnswer] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (tab !== "question" || !subjectId || !accessToken) {
      setFolders([]);
      setFolderId("");
      return;
    }
    let cancelled = false;
    setLoadingFolders(true);
    setFolderId("");
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
  }, [tab, subjectId, accessToken]);

  const resetQuestionFields = () => {
    setText("");
    setAnswer("");
    setDifficulty("Medium");
    setNote("");
    setFolderId("");
    setNewFolderName("");
  };

  const handleCreateFolder = async () => {
    const trimmed = folderName.trim();
    if (!trimmed || !subjectId || !accessToken) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await apiFetch(`/api/subjects/${subjectId}/folders`, {
        method: "POST",
        body: JSON.stringify({ name: trimmed }),
        token: accessToken,
      });
      onFolderCreated(Number(subjectId));
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const trimmedText = text.trim();
  const trimmedAnswer = answer.trim();
  const questionValid =
    !!subjectId &&
    (folderId === "new" ? newFolderName.trim().length > 0 : !!folderId) &&
    trimmedText.length > 0 &&
    trimmedText.length <= MAX_LEN &&
    trimmedAnswer.length > 0 &&
    trimmedAnswer.length <= MAX_LEN &&
    note.length <= MAX_LEN;

  const handleCreateQuestion = async () => {
    if (!questionValid || isSubmitting || !accessToken) return;

    setIsSubmitting(true);
    setError(null);
    try {
      let targetFolderId: number | "new" | "" = folderId;

      if (folderId === "new") {
        const createdFolder = await apiFetch(`/api/subjects/${subjectId}/folders`, {
          method: "POST",
          body: JSON.stringify({ name: newFolderName.trim() }),
          token: accessToken,
        });
        targetFolderId = createdFolder.id;
      }

      await apiFetch(`/api/folders/${targetFolderId}/questions`, {
        method: "POST",
        body: JSON.stringify({
          text: trimmedText,
          answer: trimmedAnswer,
          difficulty: difficultyToApi[difficulty],
          note: note.trim(),
        }),
        token: accessToken,
      });

      onQuestionCreated(Number(subjectId));
      resetQuestionFields();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const subjectOptions = subjects.map((s) => ({ value: s.id, label: s.name }));
  const subjectLabelById = (id: number) => subjects.find((s) => s.id === id)?.name ?? "";

  const folderOptions: { value: number | "new"; label: string }[] = [
    ...folders.map((f) => ({ value: f.id as number | "new", label: f.name })),
    { value: "new" as const, label: "+ New folder…" },
  ];
  const folderLabelById = (v: number | "new") =>
    v === "new" ? "+ New folder…" : folders.find((f) => f.id === v)?.name ?? "";

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end" style={{ backgroundColor: "rgba(42,39,36,0.4)" }} onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ maxHeight: "90%" }}>
          <Pressable onPress={(e) => e.stopPropagation()} className="rounded-t-3xl bg-paper">
            <View className="flex-row items-center justify-between px-6 py-5 border-b border-rule">
              <Pressable onPress={onClose}>
                <X size={22} color="#6E655C" strokeWidth={1.75} />
              </Pressable>
              <Text className="text-[17px] text-ink">Quick add</Text>
              <View style={{ width: 22 }} />
            </View>

            <View className="flex-row px-6 pt-4" style={{ gap: 8 }}>
              <Pressable
                onPress={() => {
                  setTab("folder");
                  setError(null);
                }}
                className={`flex-1 items-center rounded-full border py-2 ${tab === "folder" ? "bg-onyx border-onyx" : "border-rule"}`}
              >
                <Text className={`text-[14px] ${tab === "folder" ? "text-paper" : "text-ink-soft"}`} style={{ fontWeight: "500" }}>
                  Folder
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setTab("question");
                  setError(null);
                }}
                className={`flex-1 items-center rounded-full border py-2 ${tab === "question" ? "bg-onyx border-onyx" : "border-rule"}`}
              >
                <Text className={`text-[14px] ${tab === "question" ? "text-paper" : "text-ink-soft"}`} style={{ fontWeight: "500" }}>
                  Question
                </Text>
              </Pressable>
            </View>

            <ScrollView className="px-6" contentContainerStyle={{ paddingTop: 20, paddingBottom: 32, gap: 16 }}>
              {subjects.length === 0 ? (
                <Text className="text-[15px] text-ink-soft">
                  Create a subject first before adding folders or questions.
                </Text>
              ) : tab === "folder" ? (
                <>
                  <SelectField
                    label="Subject"
                    value={subjectId}
                    placeholder="Select a subject…"
                    options={subjectOptions}
                    getLabel={subjectLabelById}
                    onSelect={(v) => setSubjectId(v)}
                  />

                  <View>
                    <Text className="text-[12px] tracking-widest text-ink-faint uppercase">Folder name</Text>
                    <TextInput
                      value={folderName}
                      onChangeText={setFolderName}
                      placeholder="e.g. Chapter 1, Vocabulary…"
                      className="mt-2 rounded-xl border border-rule bg-paper-card px-4 text-[15px] text-ink"
                      style={{ paddingVertical: 14 }}
                    />
                  </View>

                  {error && <Text className="text-[14px] text-hard">{error}</Text>}

                  <Pressable
                    onPress={handleCreateFolder}
                    disabled={isSubmitting || !folderName.trim()}
                    className="mt-1 flex-row items-center justify-center rounded-xl bg-onyx py-3.5"
                    style={{ gap: 8, opacity: isSubmitting || !folderName.trim() ? 0.4 : 1 }}
                  >
                    {isSubmitting ? <ActivityIndicator color="#F7F5F1" /> : <Plus size={18} color={ink} strokeWidth={1.75} />}
                    <Text className="text-[15px] text-paper" style={{ fontWeight: "500" }}>
                      {isSubmitting ? "Creating…" : "Create folder"}
                    </Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <SelectField
                    label="Subject"
                    value={subjectId}
                    placeholder="Select a subject…"
                    options={subjectOptions}
                    getLabel={subjectLabelById}
                    onSelect={(v) => setSubjectId(v)}
                  />

                  {loadingFolders ? (
                    <View className="flex-row items-center" style={{ gap: 8 }}>
                      <ActivityIndicator size="small" color="#6E655C" />
                      <Text className="text-[14px] text-ink-soft">Loading folders…</Text>
                    </View>
                  ) : (
                    <SelectField
                      label="Folder"
                      value={folderId}
                      placeholder="Select a folder…"
                      options={folderOptions}
                      getLabel={folderLabelById}
                      onSelect={(v) => setFolderId(v)}
                    />
                  )}

                  {folderId === "new" && (
                    <TextInput
                      value={newFolderName}
                      onChangeText={setNewFolderName}
                      placeholder="New folder name"
                      className="rounded-xl border border-rule bg-paper-card px-4 text-[15px] text-ink"
                      style={{ paddingVertical: 14 }}
                    />
                  )}

                  <View>
                    <Text className="text-[12px] tracking-widest text-ink-faint uppercase">Question</Text>
                    <View className="mt-2 rounded-xl border border-rule bg-paper-card p-4">
                      <TextInput
                        value={text}
                        onChangeText={setText}
                        placeholder="Type the question…"
                        maxLength={MAX_LEN}
                        multiline
                        className="text-[15px] text-ink"
                      />
                    </View>
                  </View>

                  <View>
                    <Text className="text-[12px] tracking-widest text-ink-faint uppercase">Answer</Text>
                    <View className="mt-2 rounded-xl border border-rule bg-paper-card p-4">
                      <TextInput
                        value={answer}
                        onChangeText={setAnswer}
                        placeholder="Type the answer…"
                        maxLength={MAX_LEN}
                        multiline
                        className="text-[15px] text-ink"
                      />
                    </View>
                  </View>

                  <View>
                    <Text className="text-[12px] tracking-widest text-ink-faint uppercase mb-1.5">Difficulty</Text>
                    <View className="flex-row" style={{ gap: 8 }}>
                      {levels.map((l) => {
                        const on = l === difficulty;
                        return (
                          <Pressable
                            key={l}
                            onPress={() => setDifficulty(l)}
                            className="flex-1 items-center rounded-xl border py-2.5"
                            style={{ borderColor: on ? difficultyHex[l] : "#E4DED4", backgroundColor: on ? "rgba(168,112,63,0.08)" : "transparent" }}
                          >
                            <Text className={on ? difficultyStyles[l].pillText : "text-ink-soft"} style={{ fontSize: 14, fontWeight: "500" }}>
                              {l}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  <View>
                    <Text className="text-[12px] tracking-widest text-ink-faint uppercase">Notes (optional)</Text>
                    <View className="mt-2 rounded-xl border border-rule bg-paper-card p-4">
                      <TextInput
                        value={note}
                        onChangeText={setNote}
                        placeholder="Add extra context or hints…"
                        maxLength={MAX_LEN}
                        multiline
                        className="text-[14px] text-ink"
                      />
                    </View>
                  </View>

                  {error && <Text className="text-[14px] text-hard">{error}</Text>}

                  <Pressable
                    onPress={handleCreateQuestion}
                    disabled={!questionValid || isSubmitting}
                    className="mt-1 flex-row items-center justify-center rounded-xl bg-onyx py-3.5"
                    style={{ gap: 8, opacity: !questionValid || isSubmitting ? 0.4 : 1 }}
                  >
                    {isSubmitting ? <ActivityIndicator color="#F7F5F1" /> : <Plus size={18} color={ink} strokeWidth={1.75} />}
                    <Text className="text-[15px] text-paper" style={{ fontWeight: "500" }}>
                      {isSubmitting ? "Creating…" : "Create question"}
                    </Text>
                  </Pressable>
                </>
              )}
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}