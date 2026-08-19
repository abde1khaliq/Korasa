import { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiFetch } from '@/api/client';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Eye, Pencil, RefreshCw } from 'lucide-react-native';

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

export default function QuestionDetailScreen() {
  const { id, folderId, questionId } = useLocalSearchParams<{ id: string; folderId: string; questionId: string }>();
  const router = useRouter();

  const [question, setQuestion] = useState<Question | null>(null);
  const [siblings, setSiblings] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const fetchQuestion = async () => {
    setError(null);
    setRevealed(false);
    try {
      const q = await apiFetch<Question>(`/questions/${questionId}`);
      setQuestion(q);
      const list = await apiFetch<Question[]>(`/folders/${q.folder_id}/questions`);
      setSiblings(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (questionId) fetchQuestion();
  }, [questionId]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  if (error || !question) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-6 pt-6 flex-row items-center gap-4">
          <Pressable onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-gray-100">
            <ChevronLeft size={24} color="#000" />
          </Pressable>
          <Text className="font-bold text-2xl">Error</Text>
        </View>
        <View className="flex-1 justify-center items-center px-6 pb-16">
          <Text className="mt-3 text-center text-gray-500">{error || "Question not found"}</Text>
          <Pressable onPress={fetchQuestion} className="mt-8 flex-row items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-8 py-4">
            <RefreshCw size={16} color="#000" />
            <Text className="text-black font-medium">Try again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const currentIndex = siblings.findIndex(s => s.id === question.id);
  const prevQuestion = currentIndex > 0 ? siblings[currentIndex - 1] : null;
  const nextQuestion = currentIndex !== -1 && currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-6 pt-6 flex-row justify-between items-center pb-4 border-b border-gray-100">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-gray-100">
          <ChevronLeft size={24} color="#000" />
        </Pressable>
        <Pressable className="p-2 -mr-2 rounded-full active:bg-gray-100">
          <Pencil size={20} color="#000" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        <View className={`self-start rounded-lg px-2 py-1 mb-4 ${difficultyStyles[question.difficulty].bg}`}>
          <Text className={`text-[12px] font-bold uppercase tracking-widest ${difficultyStyles[question.difficulty].text}`}>
            {question.difficulty}
          </Text>
        </View>
        
        <Text className="text-[22px] leading-relaxed text-black font-medium">{question.text}</Text>
        
        {question.note && (
          <View className="mt-6 rounded-2xl bg-yellow-50 p-4 border border-yellow-100">
            <Text className="text-[13px] uppercase tracking-widest text-yellow-800 mb-1">Note</Text>
            <Text className="text-yellow-900 text-[15px]">{question.note}</Text>
          </View>
        )}

        <View className="mt-12">
          {!revealed ? (
            <Pressable 
              onPress={() => setRevealed(true)}
              className="flex-row items-center justify-center gap-2 rounded-full bg-black py-4"
            >
              <Eye size={20} color="#fff" />
              <Text className="text-white font-medium text-[16px]">Reveal Answer</Text>
            </Pressable>
          ) : (
            <View className="animate-fade-in">
              <Text className="text-[13px] tracking-[2px] text-gray-500 uppercase mb-3">Answer</Text>
              <View className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <Text className="text-[18px] leading-relaxed text-black">{question.answer}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-6 py-4 flex-row justify-between pb-8">
        <Pressable 
          disabled={!prevQuestion}
          onPress={() => prevQuestion && router.replace(`/subject/${id}/folder/${folderId}/question/${prevQuestion.id}` as any)}
          className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 mr-2 ${!prevQuestion ? 'opacity-50' : 'active:bg-gray-50'}`}
        >
          <ChevronLeft size={20} color="#000" />
          <Text className="font-medium text-black">Previous</Text>
        </Pressable>
        <Pressable 
          disabled={!nextQuestion}
          onPress={() => nextQuestion && router.replace(`/subject/${id}/folder/${folderId}/question/${nextQuestion.id}` as any)}
          className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 ml-2 ${!nextQuestion ? 'opacity-50' : 'active:bg-gray-50'}`}
        >
          <Text className="font-medium text-black">Next</Text>
          <ChevronRight size={20} color="#000" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
