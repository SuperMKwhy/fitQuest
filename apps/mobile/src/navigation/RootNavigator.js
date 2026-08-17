import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppStore } from '../state/useAppStore';

import LoadingScreen from '../screens/LoadingScreen';
import AuthScreen from '../screens/AuthScreen';
import OnboardingGoalScreen from '../screens/OnboardingGoalScreen';
import OnboardingStatsScreen from '../screens/OnboardingStatsScreen';
import AvatarCreatorScreen from '../screens/AvatarCreatorScreen';
import MainTabs from './MainTabs';
import PreGameReadyScreen from '../screens/PreGameReadyScreen';
import RunTrackerScreen from '../screens/RunTrackerScreen';
import WorkoutSummaryScreen from '../screens/WorkoutSummaryScreen';
import QuestGameScreen from '../screens/QuestGameScreen';
import GameOverScreen from '../screens/GameOverScreen';
import AIBuddyChatScreen from '../screens/AIBuddyChatScreen';
import MoodTrackerScreen from '../screens/MoodTrackerScreen';
import HealthLogScreen from '../screens/HealthLogScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const status = useAppStore((s) => s.status);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {status === 'loading' && <Stack.Screen name="Loading" component={LoadingScreen} />}

      {status === 'signed-out' && <Stack.Screen name="Auth" component={AuthScreen} />}

      {status === 'onboarding' && (
        <Stack.Group>
          <Stack.Screen name="OnboardingGoal" component={OnboardingGoalScreen} />
          <Stack.Screen name="OnboardingStats" component={OnboardingStatsScreen} />
          <Stack.Screen name="AvatarCreator" component={AvatarCreatorScreen} />
        </Stack.Group>
      )}

      {status === 'ready' && (
        <Stack.Group>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="PreGameReady" component={PreGameReadyScreen} />
          <Stack.Screen name="RunTracker" component={RunTrackerScreen} />
          <Stack.Screen name="WorkoutSummary" component={WorkoutSummaryScreen} />
          <Stack.Screen name="QuestGame" component={QuestGameScreen} />
          <Stack.Screen name="GameOver" component={GameOverScreen} />
          <Stack.Screen name="AIBuddyChat" component={AIBuddyChatScreen} />
          <Stack.Screen name="MoodTracker" component={MoodTrackerScreen} />
          <Stack.Screen name="HealthLog" component={HealthLogScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
