import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Eye, Check, X as XIcon, Clock } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, ApiError } from "@/lib/api";
import { StartAttemptResponse, AttemptQuestion, Attempt } from "@/types/exam";
import { scorePercent, formatDuration } from "@/lib/examUtils";

type Phase = "starting" | "in_progress" | "submitting" | "results" | "error";

export function ExamAttemptRunner({ examId }: { examId: string }) {
  const router = useRouter();
  const { accessToken } = useAuth();

  const [phase, setPhase] = useState<Phase>("starting");
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<AttemptQuestion[]>([]);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [result, setResult] = useState<Attempt | null>(null);

  const answersRef = useRef(answers);
  answersRef.current = answers;
  const questionsRef = useRef(questions);
  questionsRef.current = questions;
  const attemptIdRef = useRef<number | null>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    apiFetch(`/api/exams/${examId}/attempts`, {
      method: "POST",
      token: accessToken,
    })
      .then((data: StartAttemptResponse) => {
        if (cancelled) return;
        attemptIdRef.current = data.attempt_id;
        setQuestions(data.questions);
        if (data.time_limit_minutes)
          setSecondsLeft(data.time_limit_minutes * 60);
        setPhase("in_progress");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError ? err.message : "Could not start this exam",
        );
        setPhase("error");
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, examId]);

  const submit = async (finalAnswers: Record<number, boolean>) => {
    if (submittedRef.current || !attemptIdRef.current || !accessToken) return;
    submittedRef.current = true;
    setPhase("submitting");
    const payload = {
      answers: questionsRef.current.map((q) => ({
        question_id: q.question_id,
        is_correct: finalAnswers[q.question_id] ?? false,
      })),
    };
    try {
      const data: Attempt = await apiFetch(
        `/api/exams/${examId}/attempts/${attemptIdRef.current}/complete`,
        { method: "PUT", body: JSON.stringify(payload), token: accessToken },
      );
      setResult(data);
      setPhase("results");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not submit this attempt",
      );
      setPhase("error");
    }
  };

  useEffect(() => {
    if (phase !== "in_progress" || secondsLeft === null) return;
    if (secondsLeft <= 0) {
      submit(answersRef.current);
      return;
    }
    const t = setTimeout(
      () => setSecondsLeft((s) => (s !== null ? s - 1 : s)),
      1000,
    );
    return () => clearTimeout(t);
  }, [phase, secondsLeft]);

  if (phase === "starting") {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#6E655C" />
      </View>
    );
  }

  if (phase === "error") {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-[16px] text-ink text-center">{error}</Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 rounded-full border border-rule px-6 py-3"
        >
          <Text className="text-[15px] text-ink">Go back</Text>
        </Pressable>
      </View>
    );
  }

  if (phase === "results" && result) {
    const pct = scorePercent(result.correct_count, result.total_count);
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text className="font-display text-[56px] text-ink">{pct}%</Text>
        <Text className="mt-2 text-[17px] text-ink-soft">
          {result.correct_count} of {result.total_count} correct
        </Text>
        <Text className="mt-1 text-[14px] text-ink-faint">
          {formatDuration(result.duration_secs)}
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-10 flex-row items-center justify-center rounded-full bg-onyx px-8 py-4"
        >
          <Text
            className="text-[16px] text-paper"
            style={{ fontWeight: "500" }}
          >
            Done
          </Text>
        </Pressable>
      </View>
    );
  }

  const question = questions[index];
  if (!question) return null;

  const isLast = index === questions.length - 1;
  const hasAnswered = answers[question.question_id] !== undefined;

  const mark = (correct: boolean) => {
    setAnswers((prev) => ({ ...prev, [question.question_id]: correct }));
  };

  const handleNext = () => {
    if (!hasAnswered) return;
    if (isLast) {
      submit(answersRef.current);
      return;
    }
    setRevealed(false);
    setIndex((i) => i + 1);
  };

  return (
    <View className="flex-1">
      <View className="px-6 pt-4 flex-row items-center justify-between">
        <Text className="text-[13px] text-ink-faint">
          Question {index + 1} of {questions.length}
        </Text>
        {secondsLeft !== null && (
          <View className="flex-row items-center" style={{ gap: 6 }}>
            <Clock
              size={14}
              color={secondsLeft < 30 ? "#A34A34" : "#9C9086"}
              strokeWidth={1.75}
            />
            <Text
              className="text-[13px]"
              style={{ color: secondsLeft < 30 ? "#A34A34" : "#9C9086" }}
            >
              {Math.floor(secondsLeft / 60)}:
              {String(secondsLeft % 60).padStart(2, "0")}
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        className="px-5"
        contentContainerStyle={{ paddingBottom: 140, paddingTop: 12 }}
      >
        <Image
          source={{ uri: question.image_url }}
          style={{ width: "100%", height: 260, borderRadius: 16 }}
          resizeMode="contain"
        />

        {question.text ? (
          <View className="mt-4 rounded-2xl border border-rule bg-paper-card p-5">
            <Text className="text-[15px] leading-[24px] text-ink">
              {question.text}
            </Text>
          </View>
        ) : null}

        <View className="mt-8 flex-row items-center" style={{ gap: 12 }}>
          <View style={{ height: 1, width: 20, backgroundColor: "#9C9086" }} />
          <Text className="text-[12px] tracking-widest text-ink-soft uppercase">
            Answer
          </Text>
        </View>

        {revealed ? (
          <View className="mt-3 rounded-2xl border border-rule bg-paper-card p-5">
            <Text className="text-[16px] leading-[26px] text-ink">
              {question.answer}
            </Text>
          </View>
        ) : (
          <Pressable
            onPress={() => setRevealed(true)}
            className="mt-3 items-center justify-center rounded-2xl border border-dashed border-rule py-6"
          >
            <View className="flex-row items-center" style={{ gap: 10 }}>
              <Eye size={16} color="#2B2724" strokeWidth={1.75} />
              <Text className="text-[16px] text-ink">Tap to reveal answer</Text>
            </View>
          </Pressable>
        )}

        {revealed && (
          <View className="mt-5 flex-row" style={{ gap: 10 }}>
            <Pressable
              onPress={() => mark(false)}
              className="flex-1 flex-row items-center justify-center rounded-xl border py-3.5"
              style={{
                gap: 8,
                borderColor:
                  answers[question.question_id] === false
                    ? "#A34A34"
                    : "#E4DED4",
                backgroundColor:
                  answers[question.question_id] === false
                    ? "rgba(163,74,52,0.08)"
                    : "transparent",
              }}
            >
              <XIcon size={16} color="#A34A34" strokeWidth={2} />
              <Text
                className="text-[14px]"
                style={{ color: "#A34A34", fontWeight: "500" }}
              >
                Got it wrong
              </Text>
            </Pressable>
            <Pressable
              onPress={() => mark(true)}
              className="flex-1 flex-row items-center justify-center rounded-xl border py-3.5"
              style={{
                gap: 8,
                borderColor:
                  answers[question.question_id] === true
                    ? "#3F7D5C"
                    : "#E4DED4",
                backgroundColor:
                  answers[question.question_id] === true
                    ? "rgba(63,125,92,0.08)"
                    : "transparent",
              }}
            >
              <Check size={16} color="#3F7D5C" strokeWidth={2} />
              <Text
                className="text-[14px]"
                style={{ color: "#3F7D5C", fontWeight: "500" }}
              >
                Got it right
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <View className="absolute self-center" style={{ bottom: 20, width: 280 }}>
        <Pressable
          onPress={handleNext}
          disabled={!hasAnswered || phase === "submitting"}
          className="flex-row items-center justify-center rounded-full bg-onyx py-3.5"
          style={{
            gap: 8,
            opacity: !hasAnswered || phase === "submitting" ? 0.4 : 1,
          }}
        >
          {phase === "submitting" ? (
            <ActivityIndicator color="#F7F5F1" />
          ) : (
            <Text
              className="text-[15px] text-paper"
              style={{ fontWeight: "500" }}
            >
              {isLast ? "Finish" : "Next question"}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
