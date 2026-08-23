import { SafeAreaView } from "react-native-safe-area-context";
import { Onboarding } from "@/components/onboarding/Onboarding";

export default function OnboardingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-paper">
      <Onboarding />
    </SafeAreaView>
  );
}