import { useState } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { ChevronRight, Folder, Plus } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useSubjectFolders } from "@/hooks/useSubjectFolders";
import { useNotification } from "@/hooks/useNotification";
import { Notification } from "@/components/Notification";
import { SubjectFoldersSkeleton } from "./SubjectFoldersSkeleton";
import { SubjectFoldersError } from "./SubjectFoldersError";
import { CreateFolderModal } from "./CreateFolderModal";
import { FolderItem } from "@/types/folder";
import { useThemeColor } from "@/hooks/useThemeColor";

export function SubjectFolders({ subjectID }: { subjectID: string }) {
  const ink = useThemeColor("#F1EFEC", "#2B2724")
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { subject, folders, isLoading, error, fetchData, addFolder } = useSubjectFolders(subjectID);
  const { notification, showNotification } = useNotification();

  const handleFolderCreated = (newFolder: FolderItem) => {
    addFolder(newFolder);
    showNotification(`"${newFolder.name}" created`);
  };

  if (isLoading) return <SubjectFoldersSkeleton />;
  if (error) return <SubjectFoldersError error={error} onRetry={fetchData} />;

  return (
    <View className="flex-1">
      <View className="px-6 pt-6">
        <Text className="font-display text-[46px] leading-[50px] text-ink">
          {subject?.name}
        </Text>
        <Text className="font-mono mt-3 text-[15px] text-ink-soft">
          {subject?.folder_count ?? 0} folders <Text className="text-ink-faint">·</Text> {subject?.question_count ?? 0} questions
        </Text>
      </View>

      <View className="mt-8 px-6">
        <Text className="text-[13px] tracking-widest text-ink-faint uppercase">Folders</Text>
      </View>

      <FlatList
        data={folders}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 112 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/subject/[id]/folder/[folderId]",
                params: { id: subjectID, folderId: String(item.id), name: item.name },
              })
            }
            className="flex-row items-center rounded-xl px-2 py-4"
            style={{ gap: 16 }}
          >
            <View className="items-center justify-center rounded-2xl bg-tag" style={{ width: 56, height: 56 }}>
              <Folder size={24} color="#A8703F" strokeWidth={1.5} />
            </View>

            <View style={{ flex: 1 }}>
              <Text className="text-[18px] text-ink" numberOfLines={1} style={{ fontWeight: "500" }}>
                {item.name}
              </Text>
              <View className="mt-1 flex-row items-center" style={{ gap: 10 }}>
                <Text className="text-[13px] text-ink-soft">{item.question_count || 0} questions</Text>
                <View style={{ width: 3, height: 3, borderRadius: 999, backgroundColor: "#9C9086" }} />
                <Text className="text-[13px] text-ink-soft" style={{ textTransform: "capitalize" }}>
                  {item.difficulty || "Mixed"}
                </Text>
              </View>
            </View>

            <ChevronRight size={20} color="#9C9086" strokeWidth={2} />
          </Pressable>
        )}
      />

      <Pressable
        onPress={() => setShowCreateModal(true)}
        className="absolute self-center flex-row items-center rounded-full bg-onyx"
        style={{ bottom: 24, gap: 8, paddingHorizontal: 24, paddingVertical: 14 }}
      >
        <Plus size={20} color={ink} strokeWidth={2} />
        <Text className="text-[16px] text-paper">Add Folder</Text>
      </Pressable>

      {showCreateModal && (
        <CreateFolderModal
          subjectID={subjectID}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleFolderCreated}
        />
      )}
      <Notification message={notification} />
    </View>
  );
}