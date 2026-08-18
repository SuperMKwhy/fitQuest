import { Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import tokens from '../theme/tokens';

/**
 * Dot/line step-progress indicator shared by the onboarding flow
 * (design/OnboardingQuestionnaire.html's `.step-node`/`.step-line`,
 * design/Personal.html's checkmark-dot header). `step` is 1-indexed;
 * dots before `step` render filled + checked, the current dot is
 * filled (active), and dots after it are hollow.
 */
export function OnboardingStepper({ step, totalSteps = 3 }) {
  const dots = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <View className="items-center w-full mb-4">
      <View className="flex-row items-center justify-center w-full max-w-[200px] mb-2">
        {dots.map((idx) => (
          <View key={idx} className="flex-row items-center" style={{ flex: idx === totalSteps ? 0 : 1 }}>
            <View
              className={`w-4 h-4 rounded-full border-[3px] border-ink items-center justify-center ${
                idx <= step ? 'bg-primary-container' : 'bg-surface-container-lowest'
              }`}
            >
              {idx < step ? (
                <MaterialIcons name="check" size={10} color={tokens.colors['on-primary-container']} />
              ) : null}
            </View>
            {idx !== totalSteps ? (
              <View className={`flex-1 h-[3px] mx-0.5 ${idx < step ? 'bg-primary-container' : 'bg-outline-variant'}`} />
            ) : null}
          </View>
        ))}
      </View>
      <View className="flex-row items-center gap-1">
        <Text className="text-primary-container text-[10px]">✦</Text>
        <Text className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">
          Step {step} of {totalSteps}
        </Text>
        <Text className="text-primary-container text-[10px]">✦</Text>
      </View>
    </View>
  );
}
