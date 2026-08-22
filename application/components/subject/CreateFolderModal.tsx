import { useState } from "react";
import { View, Text, TextInput, Pressable, Modal, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { X, Plus } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, ApiError } from "@/lib/api";
import { FolderItem } from "@/types/folder";

export function CreateFolderModal({
  subjectID,
  onClose,
  onCreated,
}: {
  subjectID: string;
  onClose: () => void;
  onCreated: (folder: FolderItem) => void;
}) {
  const { accessToken } = useAuth();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const created: FolderItem = await apiFetch(`/api/subjects/${subjectID}/folders`, {
        method: "POST",
        body: JSON.stringify({ name: trimmed }),
        token: accessToken!,
      });
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create folder");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end" style={{ backgroundColor: "rgba(42,39,36,0.4)" }} onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <Pressable onPress={(e) => e.stopPropagation()} className="rounded-t-3xl bg-paper px-6 pb-8 pt-5">
            <View className="flex-row items-center justify-between">
              <Text className="text-[22px] text-ink" style={{ fontWeight: "600" }}>New folder</Text>
              <Pressable onPress={onClose} className="items-center justify-center rounded-full" style={{ width: 36, height: 36 }}>
                <X size={20} color="#2B2724" strokeWidth={1.75} />
              </Pressable>
            </View>

            <View className="mt-5">
              <Text className="text-[13px] tracking-widest text-ink-faint uppercase">Folder name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Chapter 1, Vocabulary…"
                autoFocus
                editable={!isSubmitting}
                className="mt-2 rounded-xl border border-rule bg-paper-card px-4 text-[16px] text-ink"
                style={{ paddingVertical: 14 }}
              />
              {error && <Text className="mt-3 text-[14px] text-hard">{error}</Text>}

              <Pressable
                onPress={handleSubmit}
                disabled={isSubmitting || !name.trim()}
                className="mt-5 flex-row items-center justify-center gap-2.5 rounded-xl bg-onyx py-3.5"
                style={{ opacity: isSubmitting || !name.trim() ? 0.4 : 1 }}
              >
                {isSubmitting ? <ActivityIndicator color="#F7F5F1" /> : <Plus size={20} color="#F7F5F1" strokeWidth={1.75} />}
                <Text className="text-[16px] text-paper" style={{ fontWeight: "600" }}>
                  {isSubmitting ? "Creating…" : "Create folder"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}