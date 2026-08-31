import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { Plus, ArrowRight } from "lucide-react-native";
import Svg, { Circle } from "react-native-svg";
import { useAuth } from "@/context/AuthContext";
import { useSubjects } from "@/hooks/useSubjects";
import { useNotification } from "@/hooks/useNotification";
import {
  getGreeting,
  getFormattedName,
} from "@/lib/subjectUtils";
import { Notification } from "@/components/Notification";
import { HomeSubjectsSkeleton } from "./HomeSubjectsSkeleton";
import { HomeSubjectsError } from "./HomeSubjectsError";
import { HomeEmptyState } from "./HomeEmptyState";
import { CreateSubjectModal } from "./CreateSubjectModal";
import { SubjectCard } from "./SubjectCard";
import { Subject } from "@/types/subject";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { ActionSheet } from "@/components/common/ActionSheet";
import { registerHomeRefresh } from "@/lib/refreshBus";

export function HomeSubjects() {
  const ink = useThemeColor("#2B2724", "#F1EFEC");
  const paper = useThemeColor("#F7F5F1", "#211D1A");

  const router = useRouter();
  const { user } = useAuth();
  const userName = user?.username ?? "";

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [managingSubject, setManagingSubject] = useState<Subject | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Subject | null>(null);

  const {
    subjects,
    isLoading,
    isRefreshing,
    error,
    recentSubject,
    fetchSubjects,
    onRefresh,
    deleteSubject,
    addSubject,
  } = useSubjects();
  const { notification, showNotification } = useNotification();

  useEffect(() => {
    registerHomeRefresh(fetchSubjects);
    return () => registerHomeRefresh(null);
  });

  const handleSubjectCreated = (newSubject: Subject) => {
    addSubject(newSubject);
    showNotification(`"${newSubject.name}" created`);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    const subject = pendingDelete;
    setPendingDelete(null);
    const result = await deleteSubject(subject.id);
    showNotification(
      result.success
        ? `"${subject.name}" deleted`
        : result.error || "Failed to delete subject",
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-paper">
        <HomeSubjectsSkeleton />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-paper">
        <HomeSubjectsError error={error} onRetry={fetchSubjects} />
      </View>
    );
  }

  if (subjects.length === 0) {
    return (
      <View className="flex-1 bg-paper">
        <HomeEmptyState onCreateClick={() => setShowCreateModal(true)} />
        {showCreateModal && (
          <CreateSubjectModal
            onClose={() => setShowCreateModal(false)}
            onCreated={handleSubjectCreated}
          />
        )}
        <Notification message={notification} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-paper">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={ink}
          />
        }
      >
        <View className="px-6">
          <Text className="font-mono text-[13px] tracking-widest text-ink-faint uppercase">
            {getGreeting()}
          </Text>
          <Text className="font-display mt-2 text-[40px] leading-[44px] text-ink">
            {getFormattedName(userName)}
          </Text>
          <Text className="mt-2 text-[17px] text-ink-soft">
            Ready to pick up where you left off?
          </Text>
        </View>

        {recentSubject && (
          <View className="mt-6 px-6">
            <View
              className="overflow-hidden rounded-2xl border border-rule bg-onyx p-5"
              style={{ position: "relative" }}
            >
              <Text className="font-mono text-[13px] tracking-widest text-paper/60 uppercase text-ink-faint">
                Continue studying
              </Text>
              <Text className="font-display mt-2 text-[26px] leading-[30px] text-paper">
                {recentSubject.name}
              </Text>
              <Pressable
                onPress={() => router.push(`/subject/${recentSubject.id}`)}
                className="mt-4 flex-row items-center gap-2 self-start rounded-full bg-paper px-5 py-2.5"
              >
                <Text className="text-[15px] text-onyx">Continue</Text>
                <ArrowRight size={16} color={ink} strokeWidth={1.75} />
              </Pressable>
              <View
                style={{
                  position: "absolute",
                  right: -24,
                  top: -24,
                  opacity: 0.1,
                }}
                pointerEvents="none"
              >
                <Svg width={160} height={160} viewBox="0 0 160 160">
                  <Circle
                    cx={80}
                    cy={80}
                    r={60}
                    stroke={paper}
                    strokeWidth={1.5}
                    fill="none"
                  />
                  <Circle
                    cx={80}
                    cy={80}
                    r={44}
                    stroke={paper}
                    strokeWidth={1.5}
                    fill="none"
                  />
                  <Circle
                    cx={80}
                    cy={80}
                    r={28}
                    stroke={paper}
                    strokeWidth={1.5}
                    fill="none"
                  />
                </Svg>
              </View>
            </View>
          </View>
        )}

        <View className="px-6 pt-8">
          <Text className="font-display text-[30px] leading-[34px] text-ink">
            Subjects
          </Text>
          <Text className="mt-1 text-[17px] text-ink-soft">
            {subjects.length} {subjects.length === 1 ? "subject" : "subjects"}
          </Text>
        </View>

        <View
          className="flex-row flex-wrap justify-between px-6 py-6"
          style={{ rowGap: 16 }}
        >
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onPress={() => router.push(`/subject/${subject.id}`)}
              onOpenMenu={() => setManagingSubject(subject)}
            />
          ))}

          <Pressable
            onPress={() => setShowCreateModal(true)}
            style={{ width: "48%", height: 190 }}
            className="items-center justify-center gap-3 rounded-2xl border border-dashed border-rule"
          >
            <View
              className="items-center justify-center rounded-full border border-ink-faint"
              style={{ width: 48, height: 48 }}
            >
              <Plus size={20} color="#6E655C" strokeWidth={1.5} />
            </View>
            <Text className="text-[16px] text-ink-soft">New subject</Text>
          </Pressable>
        </View>
      </ScrollView>

      {showCreateModal && (
        <CreateSubjectModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleSubjectCreated}
        />
      )}

      <ActionSheet
        visible={!!managingSubject}
        title={managingSubject?.name}
        options={[
          {
            label: "Open subject",
            onPress: () => {
              const s = managingSubject;
              setManagingSubject(null);
              if (s) router.push(`/subject/${s.id}`);
            },
          },
          {
            label: "Delete subject",
            destructive: true,
            onPress: () => {
              const s = managingSubject;
              setManagingSubject(null);
              setPendingDelete(s);
            },
          },
        ]}
        onCancel={() => setManagingSubject(null)}
      />

      <ConfirmModal
        visible={!!pendingDelete}
        title={pendingDelete?.name ?? ""}
        message="Delete this subject? This can't be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <Notification message={notification} />
    </View>
  );
}
