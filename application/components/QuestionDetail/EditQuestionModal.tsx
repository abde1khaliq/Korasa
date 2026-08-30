import { useState } from "react";
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
import { X, Check } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, ApiError } from "@/lib/api";
import {
  Difficulty,
  difficultyStyles,
  difficultyHex,
} from "@/components/misc/Screen";
import { Question } from "@/types/question";

const levels: Difficulty[] = ["Easy", "Medium", "Hard"];
const difficultyToApi: Record<Difficulty, "easy" | "medium" | "hard"> = {
  Easy: "easy",
  Medium: "medium",
  Hard: "hard",
};
const difficultyFromApi: Record<Question["difficulty"], Difficulty> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};
const MAX_LEN = 2000;

export function EditQuestionModal({
  question,
  onClose,
  onUpdated,
}: {
  question: Question;
  onClose: () => void;
  onUpdated: (q: Question) => void;
}) {
  const { accessToken } = useAuth();
  const [text, setText] = useState(question.text ?? "");
  const [answer, setAnswer] = useState(question.answer);
  const [difficulty, setDifficulty] = useState<Difficulty>(
    difficultyFromApi[question.difficulty],
  );
  const [note, setNote] = useState(question.note ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedAnswer = answer.trim();
  const isValid =
    trimmedAnswer.length > 0 &&
    trimmedAnswer.length <= MAX_LEN &&
    note.length <= MAX_LEN &&
    text.length <= MAX_LEN;

  const handleSave = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const updated: Question = await apiFetch(
        `/api/questions/${question.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            text: text.trim(),
            answer: trimmedAnswer,
            difficulty: difficultyToApi[difficulty],
            note: note.trim(),
          }),
          token: accessToken!,
        },
      );
      onUpdated(updated);
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to update question",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
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
              <Text className="text-[17px] text-ink">Edit question</Text>
              <Pressable
                onPress={handleSave}
                disabled={!isValid || isSubmitting}
                className="flex-row items-center rounded-full bg-onyx px-5 py-2"
                style={{ gap: 8, opacity: !isValid || isSubmitting ? 0.4 : 1 }}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#F7F5F1" />
                ) : (
                  <Check size={16} color="#F7F5F1" strokeWidth={1.75} />
                )}
                <Text
                  className="text-[14px] text-paper"
                  style={{ fontWeight: "500" }}
                >
                  {isSubmitting ? "Saving…" : "Save"}
                </Text>
              </Pressable>
            </View>

            <ScrollView
              className="px-6"
              contentContainerStyle={{ paddingTop: 24, paddingBottom: 48, gap: 24 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
            >
              {error && (
                <Text className="rounded-xl bg-hard-soft px-4 py-3 text-[14px] text-hard">
                  {error}
                </Text>
              )}

              <View>
                <View className="flex-row justify-between">
                  <Text className="text-[12px] tracking-widest text-ink-faint uppercase">
                    Question text (optional)
                  </Text>
                  <Text className="text-[12px] text-ink-faint">
                    {text.length}/{MAX_LEN}
                  </Text>
                </View>
                <View className="mt-2 rounded-2xl border border-rule bg-paper-card p-4">
                  <TextInput
                    value={text}
                    onChangeText={setText}
                    placeholder="Add a text transcript…"
                    maxLength={MAX_LEN}
                    multiline
                    className="text-ink text-[15px]"
                  />
                </View>
              </View>

              <View>
                <View className="flex-row justify-between">
                  <Text className="text-[12px] tracking-widest text-ink-faint uppercase">
                    Answer
                  </Text>
                  <Text className="text-[12px] text-ink-faint">
                    {answer.length}/{MAX_LEN}
                  </Text>
                </View>
                <View className="mt-2 rounded-2xl border border-rule bg-paper-card p-4">
                  <TextInput
                    value={answer}
                    onChangeText={setAnswer}
                    placeholder="Type the answer…"
                    maxLength={MAX_LEN}
                    multiline
                    className="text-ink text-[15px]"
                  />
                </View>
              </View>

              <View>
                <Text className="text-[12px] tracking-widest text-ink-faint uppercase">
                  Difficulty
                </Text>
                <View className="mt-2 flex-row" style={{ gap: 8 }}>
                  {levels.map((l) => {
                    const s = difficultyStyles[l];
                    const on = l === difficulty;
                    return (
                      <Pressable
                        key={l}
                        onPress={() => setDifficulty(l)}
                        className={`flex-1 items-center rounded-xl border py-3.5 ${on ? s.pillBg : "bg-paper-card"}`}
                        style={{
                          borderColor: on ? difficultyHex[l] : "#E4DED4",
                        }}
                      >
                        <Text
                          className={`text-[14px] ${on ? s.pillText : "text-ink"}`}
                        >
                          {l}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View>
                <View className="flex-row justify-between">
                  <Text className="text-[12px] tracking-widest text-ink-faint uppercase">
                    Notes
                  </Text>
                  <Text className="text-[12px] text-ink-faint">
                    {note.length}/{MAX_LEN}
                  </Text>
                </View>
                <View className="mt-2 rounded-2xl border border-rule bg-paper-card p-4">
                  <TextInput
                    value={note}
                    onChangeText={setNote}
                    placeholder="Optional context, mnemonics, or exam tips…"
                    maxLength={MAX_LEN}
                    multiline
                    className="text-ink text-[14px]"
                  />
                </View>
              </View>

              {/* Bottom gap spacing */}
              <View style={{ height: 20 }} />
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
