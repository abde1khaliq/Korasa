import { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, Pressable, FlatList, RefreshControl, ActivityIndicator, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/auth/authContext';
import { apiFetch } from '@/api/client';
import { useRouter } from 'expo-router';
import { Plus, RefreshCw, X, Loader2, LogOut, Trash2 } from 'lucide-react-native';

export interface Subject {
  id: number;
  name: string;
  question_count?: number;
  folder_count?: number;
}

const CHIP_COLORS = [
  "bg-blue-100 text-blue-600",
  "bg-green-100 text-green-600",
  "bg-purple-100 text-purple-600",
  "bg-red-100 text-red-600",
  "bg-orange-100 text-orange-600",
];

function getSubjectMeta(subjectId: number, name: string) {
  const code = name.substring(0, 3).toUpperCase();
  const chip = CHIP_COLORS[subjectId % CHIP_COLORS.length];
  return { code, chip };
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomeSubjectsScreen() {
  const { logout } = useAuth();
  const router = useRouter();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [recentSubject, setRecentSubject] = useState<Subject | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [menuSubject, setMenuSubject] = useState<Subject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Note: we'd ideally get the user's name from an endpoint or the token, defaulting to 'User'
  const userName = "User";

  const fetchSubjects = async () => {
    setError(null);
    try {
      const data = await apiFetch<Subject[]>('/subjects/');
      setSubjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const fetchRecentSubject = async () => {
    try {
      const data = await apiFetch<Subject>('/subjects/recent');
      setRecentSubject(data);
    } catch (err) {
      setRecentSubject(null);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSubjects();
    fetchRecentSubject();
  }, []);

  useEffect(() => {
    fetchSubjects();
    fetchRecentSubject();
  }, []);

  const handleDeleteSubject = async (subject: Subject) => {
    setIsDeleting(true);
    try {
      await apiFetch(`/subjects/${subject.id}`, { method: 'DELETE' });
      setSubjects(prev => prev.filter(s => s.id !== subject.id));
      if (recentSubject?.id === subject.id) setRecentSubject(null);
      setMenuSubject(null);
    } catch (err) {
      // ignore
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-6 pt-6 flex-row justify-between items-center">
          <Text className="font-bold text-2xl">K</Text>
        </View>
        <View className="flex-1 justify-center items-center px-6 pb-16">
          <View className="w-16 h-16 bg-red-100 rounded-2xl items-center justify-center">
            <Text className="text-red-500 text-2xl font-bold">!</Text>
          </View>
          <Text className="mt-6 text-2xl font-bold text-center">Couldn't load subjects</Text>
          <Text className="mt-3 text-center text-gray-500">{error}</Text>
          <Pressable 
            onPress={onRefresh}
            className="mt-8 flex-row items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-8 py-4"
          >
            <RefreshCw size={16} color="#000" />
            <Text className="text-black font-medium">Try again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-6 flex-row justify-between items-center">
        <Text className="font-bold text-2xl">K</Text>
        <Pressable onPress={logout}>
          <LogOut size={24} color="#ef4444" strokeWidth={1.75} />
        </Pressable>
      </View>

      <FlatList
        data={subjects}
        numColumns={2}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        columnWrapperStyle={{ gap: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View className="mb-8">
            <Text className="text-[13px] tracking-[2px] text-gray-400 uppercase">
              {greeting()}
            </Text>
            <Text className="mt-2 text-[48px] leading-[50px] font-bold text-black">
              {userName}
            </Text>
            <Text className="mt-2 text-[17px] text-gray-500">
              Ready to pick up where you left off?
            </Text>

            {recentSubject && (
              <View className="mt-6 rounded-2xl border border-gray-800 bg-[#1a1a1a] p-5">
                <Text className="text-[13px] tracking-[2px] text-gray-400 uppercase">
                  Continue studying
                </Text>
                <Text className="mt-2 text-[26px] font-bold text-white">
                  {recentSubject.name}
                </Text>
                <Pressable
                  onPress={() => router.push(`/subject/${recentSubject.id}` as any)}
                  className="mt-4 self-start rounded-full bg-white px-5 py-2.5"
                >
                  <Text className="text-black font-medium">Jump back in</Text>
                </Pressable>
              </View>
            )}
            
            <View className="mt-8 flex-row justify-between items-center">
              <Text className="text-[22px] font-bold">Your subjects</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const { code, chip } = getSubjectMeta(item.id, item.name);
          return (
            <Pressable
              onPress={() => router.push(`/subject/${item.id}` as any)}
              onLongPress={() => setMenuSubject(item)}
              className="flex-1 min-h-[190px] rounded-2xl border border-gray-200 bg-white p-5 mb-4"
            >
              <View className={`self-start rounded-lg px-3 py-1.5 ${chip}`}>
                <Text className="text-[13px] tracking-widest font-mono font-bold capitalize">{code}</Text>
              </View>
              <Text className="mt-auto text-[26px] font-bold leading-tight" numberOfLines={2}>
                {item.name}
              </Text>
              <View className="mt-3 gap-1">
                <Text className="text-[14px] text-gray-500 font-mono">{item.folder_count || 0} folders</Text>
                <Text className="text-[14px] text-gray-500 font-mono">{item.question_count || 0} questions</Text>
              </View>
            </Pressable>
          );
        }}
        ListFooterComponent={
          <Pressable
            onPress={() => setShowCreateModal(true)}
            className="h-[190px] items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 mt-4"
          >
            <View className="w-12 h-12 rounded-full border border-gray-300 items-center justify-center mb-3">
              <Plus size={20} color="#9ca3af" />
            </View>
            <Text className="text-gray-500">New subject</Text>
          </Pressable>
        }
      />

      <CreateSubjectModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={(subject) => {
          setSubjects(prev => [...prev, subject]);
          setShowCreateModal(false);
        }}
      />

      <Modal
        visible={!!menuSubject}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuSubject(null)}
      >
        <Pressable 
          className="flex-1 bg-black/40 justify-end"
          onPress={() => setMenuSubject(null)}
        >
          <Pressable className="bg-white rounded-t-3xl px-6 pb-8 pt-5 max-h-[50%]" onPress={(e) => e.stopPropagation()}>
            <View className="flex-row justify-between items-center">
              <Text className="text-[22px] font-bold">{menuSubject?.name}</Text>
              <Pressable onPress={() => setMenuSubject(null)} className="w-9 h-9 items-center justify-center rounded-full bg-gray-100">
                <X size={20} color="#000" />
              </Pressable>
            </View>
            <View className="mt-5">
              <Pressable
                onPress={() => menuSubject && handleDeleteSubject(menuSubject)}
                disabled={isDeleting}
                className="flex-row items-center gap-3 rounded-xl bg-red-50 p-4"
              >
                {isDeleting ? <ActivityIndicator color="#ef4444" /> : <Trash2 size={20} color="#ef4444" />}
                <Text className="text-red-500 font-medium text-[16px]">{isDeleting ? "Deleting..." : "Delete subject"}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function CreateSubjectModal({ visible, onClose, onCreated }: { visible: boolean; onClose: () => void; onCreated: (s: Subject) => void }) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const created = await apiFetch<Subject>("/subjects/", {
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
            <Text className="text-[22px] font-bold">New subject</Text>
            <Pressable onPress={onClose} className="w-9 h-9 items-center justify-center rounded-full bg-gray-100">
              <X size={20} color="#000" />
            </Pressable>
          </View>
          <Text className="text-[13px] tracking-[2px] text-gray-500 uppercase mb-2">Subject name</Text>
          <TextInput
            autoFocus
            value={name}
            onChangeText={setName}
            placeholder="e.g. English, Chemistry…"
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
            <Text className="text-white font-medium text-[16px]">Create subject</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
