import { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, FlatList, RefreshControl, ActivityIndicator, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiFetch } from '@/api/client';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Folder, Plus, RefreshCw, X } from 'lucide-react-native';

export interface Subject {
  id: number;
  name: string;
}

export interface FolderItem {
  id: number;
  name: string;
  question_count?: number;
}

export default function SubjectFoldersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [subject, setSubject] = useState<Subject | null>(null);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchData = async () => {
    setError(null);
    try {
      const [subjectData, foldersData] = await Promise.all([
        apiFetch<Subject>(`/subjects/${id}`),
        apiFetch<FolderItem[]>(`/subjects/${id}/folders`)
      ]);
      setSubject(subjectData);
      setFolders(foldersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [id]);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  if (error || !subject) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-6 pt-6 flex-row items-center gap-4">
          <Pressable onPress={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
            <ChevronLeft size={24} color="#000" />
          </Pressable>
          <Text className="font-bold text-2xl">Error</Text>
        </View>
        <View className="flex-1 justify-center items-center px-6 pb-16">
          <Text className="mt-3 text-center text-gray-500">{error || "Subject not found"}</Text>
          <Pressable onPress={onRefresh} className="mt-8 flex-row items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-8 py-4">
            <RefreshCw size={16} color="#000" />
            <Text className="text-black font-medium">Try again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-6 pt-6 flex-row justify-between items-center pb-4 border-b border-gray-100">
        <View className="flex-row items-center gap-4">
          <Pressable onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-gray-100">
            <ChevronLeft size={24} color="#000" />
          </Pressable>
          <Text className="font-bold text-2xl">{subject.name}</Text>
        </View>
      </View>

      <FlatList
        data={folders}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View className="mb-6 flex-row justify-between items-end">
            <Text className="text-[22px] font-bold text-black">Folders</Text>
            <Text className="text-gray-500">{folders.length} items</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/subject/${id}/folder/${item.id}` as any)}
            className="flex-row items-center justify-between py-4 border-b border-gray-100 active:bg-gray-50"
          >
            <View className="flex-row items-center gap-4">
              <View className="w-12 h-12 rounded-2xl bg-gray-50 items-center justify-center">
                <Folder size={20} color="#6b7280" />
              </View>
              <View>
                <Text className="text-[17px] font-medium text-black">{item.name}</Text>
                <Text className="text-[14px] text-gray-500">{item.question_count || 0} questions</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </Pressable>
        )}
        ListFooterComponent={
          <Pressable
            onPress={() => setShowCreateModal(true)}
            className="mt-4 flex-row items-center gap-4 py-4 active:bg-gray-50"
          >
            <View className="w-12 h-12 rounded-2xl border border-dashed border-gray-300 bg-gray-50 items-center justify-center">
              <Plus size={20} color="#9ca3af" />
            </View>
            <Text className="text-[17px] text-gray-500 font-medium">New folder</Text>
          </Pressable>
        }
      />

      <CreateFolderModal
        visible={showCreateModal}
        subjectId={subject.id}
        onClose={() => setShowCreateModal(false)}
        onCreated={(folder) => {
          setFolders(prev => [...prev, folder]);
          setShowCreateModal(false);
        }}
      />
    </SafeAreaView>
  );
}

function CreateFolderModal({ visible, subjectId, onClose, onCreated }: { visible: boolean; subjectId: number; onClose: () => void; onCreated: (f: FolderItem) => void }) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const created = await apiFetch<FolderItem>(`/subjects/${subjectId}/folders`, {
        method: "POST",
        body: JSON.stringify({ name: trimmed }),
      });
      onCreated(created);
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40 justify-end" onPress={onClose}>
        <Pressable className="bg-white rounded-t-3xl px-6 pb-8 pt-5 max-h-[80%]" onPress={(e) => e.stopPropagation()}>
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-[22px] font-bold">New folder</Text>
            <Pressable onPress={onClose} className="w-9 h-9 items-center justify-center rounded-full bg-gray-100">
              <X size={20} color="#000" />
            </Pressable>
          </View>
          <Text className="text-[13px] tracking-[2px] text-gray-500 uppercase mb-2">Folder name</Text>
          <TextInput
            autoFocus
            value={name}
            onChangeText={setName}
            placeholder="e.g. Chapter 1, Midterm prep…"
            placeholderTextColor="#9ca3af"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-[16px] text-black"
          />
          {error && <Text className="mt-2 text-red-500 text-sm">{error}</Text>}
          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitting || !name.trim()}
            className="mt-5 flex-row items-center justify-center gap-2 rounded-xl bg-black py-4 opacity-100 disabled:opacity-50"
          >
            {isSubmitting ? <ActivityIndicator color="#fff" /> : <Plus size={20} color="#fff" />}
            <Text className="text-white font-medium text-[16px]">Create folder</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
