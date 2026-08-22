import { useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Plus, ArrowRight, Zap } from "lucide-react-native";
import Svg, { Circle } from "react-native-svg";
import { useAuth } from "@/context/AuthContext";
import { useSubjects } from "@/hooks/useSubjects";
import { useNotification } from "@/hooks/useNotification";
import { getSubjectMeta, getGreeting, getFormattedName } from "@/lib/subjectUtils";
import { Notification } from "@/components/Notification";
import { HomeSubjectsSkeleton } from "./HomeSubjectsSkeleton";
import { HomeSubjectsError } from "./HomeSubjectsError";
import { HomeEmptyState } from "./HomeEmptyState";
import { CreateSubjectModal } from "./CreateSubjectModal";
import { Subject } from "@/types/subject";

export function HomeSubjects() {
  const router = useRouter();
  const { user } = useAuth();
  const userName = user?.username ?? "";

  const [showCreateModal, setShowCreateModal] = useState(false);

  const { subjects, isLoading, error, recentSubject, fetchSubjects, deleteSubject, addSubject, updateSubjectCounts } =
    useSubjects();
  const { notification, showNotification } = useNotification();

  const handleSubjectCreated = (newSubject: Subject) => {
    addSubject(newSubject);
    showNotification(`"${newSubject.name}" created`);
  };

  const confirmDelete = (subject: Subject) => {
    Alert.alert(
      subject.name,
      "Delete this subject? This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const result = await deleteSubject(subject.id);
            showNotification(result.success ? `"${subject.name}" deleted` : result.error || "Failed to delete subject");
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-paper">
        <HomeSubjectsSkeleton />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-paper">
        <HomeSubjectsError error={error} onRetry={fetchSubjects} />
      </SafeAreaView>
    );
  }

  if (subjects.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-paper">
        <HomeEmptyState onCreateClick={() => setShowCreateModal(true)} />
        {showCreateModal && (
          <CreateSubjectModal onClose={() => setShowCreateModal(false)} onCreated={handleSubjectCreated} />
        )}
        <Notification message={notification} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-paper">
      <View className="px-6">
        <Text className="font-mono text-[13px] tracking-widest text-ink-faint uppercase">{getGreeting()}</Text>
        <Text className="font-display mt-2 text-[40px] leading-[44px] text-ink" style={{ fontWeight: "600" }}>
          {getFormattedName(userName)}
        </Text>
        <Text className="mt-2 text-[17px] text-ink-soft">Ready to pick up where you left off?</Text>
      </View>

      {recentSubject && (
        <View className="mt-6 px-6">
          <View className="overflow-hidden rounded-2xl border border-rule bg-onyx p-5" style={{ position: "relative" }}>
            <Text className="font-mono text-[13px] tracking-widest text-paper/60 uppercase text-ink-faint">Continue studying</Text>
            <Text className="font-display mt-2 text-[26px] leading-[30px] text-paper" style={{ fontWeight: "600" }}>
              {recentSubject.name}
            </Text>
            <Pressable
              onPress={() => router.push(`/subject/${recentSubject.id}`)}
              className="mt-4 flex-row items-center gap-2 self-start rounded-full bg-paper px-5 py-2.5"
            >
              <Text className="text-[15px] text-onyx" style={{ fontWeight: "600" }}>Continue</Text>
              <ArrowRight size={16} color="#2A2724" strokeWidth={1.75} />
            </Pressable>
            <View style={{ position: "absolute", right: -24, top: -24, opacity: 0.1 }} pointerEvents="none">
              <Svg width={160} height={160} viewBox="0 0 160 160">
                <Circle cx={80} cy={80} r={60} stroke="#F7F5F1" strokeWidth={1.5} fill="none" />
                <Circle cx={80} cy={80} r={44} stroke="#F7F5F1" strokeWidth={1.5} fill="none" />
                <Circle cx={80} cy={80} r={28} stroke="#F7F5F1" strokeWidth={1.5} fill="none" />
              </Svg>
            </View>
          </View>
        </View>
      )}

      <View className="px-6 pt-8">
        <Text className="font-display text-[30px] leading-[34px] text-ink" style={{ fontWeight: "600" }}>Subjects</Text>
        <Text className="mt-1 text-[17px] text-ink-soft">
          {subjects.length} {subjects.length === 1 ? "subject" : "subjects"}
        </Text>
      </View>

      <View className="flex-row flex-wrap justify-between px-6 py-6" style={{ rowGap: 16 }}>
        {subjects.map((subject) => {
          const { code, chip } = getSubjectMeta(subject.id, subject.name);
          return (
            <Pressable
              key={subject.id}
              onPress={() => router.push(`/subject/${subject.id}`)}
              onLongPress={() => confirmDelete(subject)}
              style={{ width: "48%", height: 190 }}
              className="rounded-2xl border border-rule bg-paper-card p-4"
            >
              <View
                className="self-start rounded-lg px-3 py-1.5"
                style={{ backgroundColor: chip.bg }}
              >
                <Text style={{ color: chip.text, fontSize: 13, letterSpacing: 1 }}>{code}</Text>
              </View>
              <View style={{ flex: 1 }} />
              <Text className="font-display text-[26px] leading-[30px] text-ink" numberOfLines={1} style={{ fontWeight: "600" }}>
                {subject.name}
              </Text>
              <View className="mt-3" style={{ gap: 4 }}>
                <Text className="text-[14px] text-ink-soft">{subject.folder_count || 0} folders</Text>
                <Text className="text-[14px] text-ink-soft">{subject.question_count || 0} questions</Text>
              </View>
            </Pressable>
          );
        })}

        <Pressable
          onPress={() => setShowCreateModal(true)}
          style={{ width: "48%", height: 190 }}
          className="items-center justify-center gap-3 rounded-2xl border border-dashed border-rule"
        >
          <View className="items-center justify-center rounded-full border border-ink-faint" style={{ width: 48, height: 48 }}>
            <Plus size={20} color="#6E655C" strokeWidth={1.5} />
          </View>
          <Text className="text-[16px] text-ink-soft">New subject</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() => Alert.alert("Quick create", "Folder/question quick-add isn't built yet.")}
        className="absolute bottom-6 right-6 items-center justify-center rounded-full bg-onyx"
        style={{ width: 56, height: 56 }}
      >
        <Zap size={24} color="#F7F5F1" fill="#F7F5F1" />
      </Pressable>

      {showCreateModal && (
        <CreateSubjectModal onClose={() => setShowCreateModal(false)} onCreated={handleSubjectCreated} />
      )}
      <Notification message={notification} />
    </SafeAreaView>
  );
}