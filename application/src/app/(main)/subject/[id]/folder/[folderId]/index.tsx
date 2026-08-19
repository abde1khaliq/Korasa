import { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, FlatList, RefreshControl, ActivityIndicator, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiFetch } from '@/api/client';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Plus, RefreshCw, X, Camera } from 'lucide-react-native';

export interface Question {
  id: number;
  text: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
  note: string;
  folder_id: number;
}

const difficultyStyles = {
  easy: { bg: "bg-green-100", text: "text-green-600" },
  medium: { bg: "bg-orange-100", text: "text-orange-600" },
  hard: { bg: "bg-red-100", text: "text-red-600" },
};

export default function FolderQuestionsScreen() {
  const { id, folderId } = useLocalSearchParams<{ id: string; folderId: string }>();
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"All" | "easy" | "medium" | "hard">("All");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchData = async () => {
    setError(null);
    try {
      const data = await apiFetch<Question[]>(`/folders/${folderId}/questions`);
      setQuestions(data);
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
  }, [folderId]);

  useEffect(() => {
    if (folderId) fetchData();
  }, [folderId]);

  const filteredQuestions = filter === "All" 
    ? questions 
    : questions.filter(q => q.difficulty === filter);

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
        <View className="px-6 pt-6 flex-row items-center gap-4">
          <Pressable onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-gray-100">
            <ChevronLeft size={24} color="#000" />
          </Pressable>
          <Text className="font-bold text-2xl">Error</Text>
        </View>
        <View className="flex-1 justify-center items-center px-6 pb-16">
          <Text className="mt-3 text-center text-gray-500">{error}</Text>
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
      <View className="px-6 pt-6 flex-row justify-between items-center pb-4">
        <View className="flex-row items-center gap-4">
          <Pressable onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-gray-100">
            <ChevronLeft size={24} color="#000" />
          </Pressable>
          <Text className="font-bold text-2xl">Questions</Text>
        </View>
        <Pressable onPress={() => setShowCreateModal(true)} className="p-2 -mr-2">
          <Plus size={24} color="#000" />
        </Pressable>
      </View>

      <View className="px-6 pb-4 border-b border-gray-100 flex-row gap-2">
        {(["All", "easy", "medium", "hard"] as const).map(f => (
          <Pressable 
            key={f}
            onPress={() => setFilter(f)}
            className={`px-4 py-2 rounded-full border ${filter === f ? 'bg-black border-black' : 'bg-gray-50 border-gray-200'}`}
          >
            <Text className={`capitalize font-medium ${filter === f ? 'text-white' : 'text-gray-600'}`}>{f}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filteredQuestions}
        contentContainerStyle={{ padding: 24, paddingBottom: 100, gap: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/subject/${id}/folder/${folderId}/question/${item.id}` as any)}
            className="p-5 rounded-2xl border border-gray-200 bg-white"
          >
            <View className={`self-start rounded-lg px-2 py-1 mb-3 ${difficultyStyles[item.difficulty].bg}`}>
              <Text className={`text-[12px] font-bold uppercase tracking-widest ${difficultyStyles[item.difficulty].text}`}>
                {item.difficulty}
              </Text>
            </View>
            <Text className="text-[17px] font-medium text-black" numberOfLines={3}>{item.text}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <View className="mt-12 items-center justify-center">
            <Text className="text-gray-500 text-[16px]">No questions found.</Text>
          </View>
        }
      />

      <CreateQuestionModal
        visible={showCreateModal}
        folderId={Number(folderId)}
        onClose={() => setShowCreateModal(false)}
        onCreated={(question) => {
          setQuestions(prev => [...prev, question]);
          setShowCreateModal(false);
        }}
      />
    </SafeAreaView>
  );
}

function CreateQuestionModal({ visible, folderId, onClose, onCreated }: { visible: boolean; folderId: number; onClose: () => void; onCreated: (q: Question) => void }) {
  const [text, setText] = useState("");
  const [answer, setAnswer] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmedText = text.trim();
    const trimmedAnswer = answer.trim();
    if (!trimmedText || !trimmedAnswer) return;
    
    setIsSubmitting(true);
    setError(null);
    try {
      const created = await apiFetch<Question>(`/folders/${folderId}/questions`, {
        method: "POST",
        body: JSON.stringify({ text: trimmedText, answer: trimmedAnswer, difficulty, note: "" }),
      });
      onCreated(created);
      setText("");
      setAnswer("");
      setDifficulty("easy");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40 justify-end" onPress={onClose}>
        <Pressable className="bg-white rounded-t-3xl px-6 pb-8 pt-5 max-h-[90%]" onPress={(e) => e.stopPropagation()}>
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-[22px] font-bold">New question</Text>
            <Pressable onPress={onClose} className="w-9 h-9 items-center justify-center rounded-full bg-gray-100">
              <X size={20} color="#000" />
            </Pressable>
          </View>
          
          <Text className="text-[13px] tracking-[2px] text-gray-500 uppercase mb-2">Question</Text>
          <TextInput
            multiline
            numberOfLines={3}
            value={text}
            onChangeText={setText}
            placeholder="Type your question..."
            placeholderTextColor="#9ca3af"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[16px] text-black h-24 textAlignVertical-top"
          />

          <Text className="text-[13px] tracking-[2px] text-gray-500 uppercase mt-5 mb-2">Answer</Text>
          <TextInput
            multiline
            numberOfLines={4}
            value={answer}
            onChangeText={setAnswer}
            placeholder="Type the answer..."
            placeholderTextColor="#9ca3af"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[16px] text-black h-32 textAlignVertical-top"
          />

          <Text className="text-[13px] tracking-[2px] text-gray-500 uppercase mt-5 mb-2">Difficulty</Text>
          <View className="flex-row gap-2">
            {(["easy", "medium", "hard"] as const).map(d => (
              <Pressable 
                key={d}
                onPress={() => setDifficulty(d)}
                className={`flex-1 items-center justify-center py-3 rounded-xl border ${difficulty === d ? 'border-black bg-black' : 'border-gray-200 bg-gray-50'}`}
              >
                <Text className={`capitalize font-medium ${difficulty === d ? 'text-white' : 'text-gray-600'}`}>{d}</Text>
              </Pressable>
            ))}
          </View>

          {error && <Text className="mt-4 text-red-500 text-sm">{error}</Text>}
          
          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitting || !text.trim() || !answer.trim()}
            className="mt-6 flex-row items-center justify-center gap-2 rounded-xl bg-black py-4 opacity-100 disabled:opacity-50"
          >
            {isSubmitting ? <ActivityIndicator color="#fff" /> : <Plus size={20} color="#fff" />}
            <Text className="text-white font-medium text-[16px]">Create question</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
