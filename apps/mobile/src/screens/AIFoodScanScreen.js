import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ChibiButton, ChibiSurface } from '../components/Chibi';

// Matches design/AIFoodScan.html. `expo-camera` is not a dependency of this
// app (only react-native-vision-camera is, and adding a new native module is
// out of scope for this mock-data pass) so the "camera" below is a static
// viewfinder mock — corner brackets + a shutter button — not a real feed.

// ---------------------------------------------------------------------------
// SEAM: this is the one place that stands in for a real vision-model API
// call. Swap the body of this function for a real request (upload the photo,
// await a food-recognition result) — everything else in this screen only
// depends on the shape of the object it resolves with.
function getMockVisionScanResult() {
  return {
    name: 'Grilled Chicken Salad',
    calories: 420,
    confidence: '92%',
  };
}
// ---------------------------------------------------------------------------

const SCAN_DELAY_MS = 1000;

export default function AIFoodScanScreen({ navigation }) {
  const [status, setStatus] = useState('idle'); // idle | scanning | result
  const [result, setResult] = useState(null);

  const handleShutterPress = () => {
    setStatus('scanning');
    setTimeout(() => {
      setResult(getMockVisionScanResult());
      setStatus('result');
    }, SCAN_DELAY_MS);
  };

  const handleRetake = () => {
    setResult(null);
    setStatus('idle');
  };

  const handleLogIt = () => {
    navigation.navigate('HealthLog', { scannedFood: result });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-5 py-3 border-b-[3px] border-ink">
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={24} color="#1c1b1b" />
        </Pressable>
        <Text className="font-headline text-primary uppercase tracking-tight text-xl">Calories Tracker</Text>
        <MaterialIcons name="settings" size={24} color="#1c1b1b" />
      </View>

      <View className="flex-1 items-center px-5 py-6 gap-6">
        <Text className="font-headline text-on-surface uppercase tracking-wider text-2xl text-center">
          Take a Photo!
        </Text>

        {/* Mock camera viewfinder */}
        <View className="w-full max-w-sm aspect-[4/5] bg-surface-container-highest border-[3px] border-ink rounded-xl overflow-hidden items-center justify-center relative">
          {/* Corner brackets */}
          <View className="absolute inset-0 p-4 justify-between" pointerEvents="none">
            <View className="flex-row justify-between">
              <View className="w-8 h-8 border-t-4 border-l-4 border-primary-container" />
              <View className="w-8 h-8 border-t-4 border-r-4 border-primary-container" />
            </View>
            <View className="flex-row justify-between">
              <View className="w-8 h-8 border-b-4 border-l-4 border-primary-container" />
              <View className="w-8 h-8 border-b-4 border-r-4 border-primary-container" />
            </View>
          </View>

          <MaterialIcons name="restaurant" size={64} color="#6c7a74" />

          {status === 'scanning' && (
            <View className="absolute inset-0 bg-ink/30 items-center justify-center gap-3">
              <ActivityIndicator size="large" color="#3ecfaa" />
              <Text className="font-label text-surface-container-lowest uppercase">Scanning…</Text>
            </View>
          )}

          {status !== 'result' && (
            <View className="absolute bottom-6 left-0 right-0 items-center">
              <Pressable
                onPress={handleShutterPress}
                disabled={status === 'scanning'}
                className="w-16 h-16 rounded-full border-4 border-tertiary-container bg-surface-container-lowest items-center justify-center"
                style={{ opacity: status === 'scanning' ? 0.5 : 1 }}
              >
                <View className="w-10 h-10 rounded-full border-2 border-ink bg-error" />
              </Pressable>
            </View>
          )}
        </View>

        {/* Result card */}
        {status === 'result' && result && (
          <>
            <ChibiSurface className="w-full max-w-sm p-5 gap-3">
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="restaurant" size={20} color="#006b55" />
                <Text className="font-label uppercase text-on-surface tracking-wide">{result.name}</Text>
              </View>
              <View className="flex-row gap-2">
                <View className="bg-secondary-container px-2 py-1 rounded-full border-2 border-ink self-start">
                  <Text className="font-label text-xs text-on-secondary-container">
                    Total {result.calories} kcal
                  </Text>
                </View>
                <View className="bg-tertiary-container px-2 py-1 rounded-full border-2 border-ink self-start">
                  <Text className="font-label text-xs text-on-tertiary-container">
                    {result.confidence} confidence
                  </Text>
                </View>
              </View>
            </ChibiSurface>

            <View className="w-full max-w-sm gap-3">
              <ChibiButton className="py-3 flex-row items-center justify-center gap-2" onPress={handleLogIt}>
                <MaterialIcons name="check-circle" size={20} color="#005442" />
                <Text className="font-label uppercase text-on-primary-container">Log it</Text>
              </ChibiButton>
              <Pressable
                onPress={handleRetake}
                className="py-3 flex-row items-center justify-center gap-2 border-2 border-dashed border-outline rounded-xl"
              >
                <MaterialIcons name="camera-alt" size={18} color="#6c7a74" />
                <Text className="font-label text-outline uppercase">Retake</Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
