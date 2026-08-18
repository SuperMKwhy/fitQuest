import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ChibiButton, ChibiSurface } from '../components/Chibi';
import { api } from '../api/client';

// Matches design/AIFoodScan.html. Takes a real photo with the device camera
// (expo-image-picker — Expo Go compatible, unlike react-native-vision-camera)
// and sends it to POST /food-scan, which forwards to Gemini vision
// (apps/server/src/lib/gemini.ts::analyzeFoodImage). "Log it" then posts the
// result to POST /food-log so it shows up in HealthLogScreen's tracker.

const DEFAULT_MEAL_TYPE = 'Snack';

function macroPercents({ proteinG = 0, carbsG = 0, fatG = 0 }) {
  const totalG = proteinG + carbsG + fatG;
  if (totalG <= 0) return { proteinPct: 0, carbsPct: 0, fatPct: 0 };
  return {
    proteinPct: Math.round((proteinG / totalG) * 100),
    carbsPct: Math.round((carbsG / totalG) * 100),
    fatPct: Math.round((fatG / totalG) * 100),
  };
}

export default function AIFoodScanScreen({ navigation }) {
  const [status, setStatus] = useState('idle'); // idle | scanning | result | logging
  const [photoUri, setPhotoUri] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleShutterPress = async () => {
    const { status: permStatus } = await ImagePicker.requestCameraPermissionsAsync();
    if (permStatus !== 'granted') {
      Alert.alert('Camera access needed', 'Enable camera access in Settings to scan food.');
      return;
    }

    const picked = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.5,
      base64: true,
    });
    if (picked.canceled || !picked.assets?.[0]) return;

    const asset = picked.assets[0];
    setPhotoUri(asset.uri);
    setError(null);
    setStatus('scanning');

    try {
      const analysis = await api.scanFood(asset.base64, asset.mimeType || 'image/jpeg');
      setResult(analysis);
      setStatus('result');
    } catch (err) {
      setError(err.message || "Couldn't analyze that photo.");
      setStatus('idle');
    }
  };

  const handleRetake = () => {
    setPhotoUri(null);
    setResult(null);
    setError(null);
    setStatus('idle');
  };

  const handleLogIt = async () => {
    setStatus('logging');
    try {
      await api.logFood({
        name: result.name,
        mealType: DEFAULT_MEAL_TYPE,
        calories: result.calories,
        proteinG: result.proteinG,
        carbsG: result.carbsG,
        fatG: result.fatG,
        source: 'scan',
        confidence: result.confidencePercent,
      });
      navigation.navigate('HealthLog');
    } catch (err) {
      setError(err.message || "Couldn't save that food.");
      setStatus('result');
    }
  };

  const { proteinPct, carbsPct, fatPct } = result ? macroPercents(result) : { proteinPct: 0, carbsPct: 0, fatPct: 0 };

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

        <View className="w-full max-w-sm aspect-[4/5] bg-surface-container-highest border-[3px] border-ink rounded-xl overflow-hidden items-center justify-center relative">
          {photoUri ? (
            <Image source={{ uri: photoUri }} className="absolute inset-0 w-full h-full" resizeMode="cover" />
          ) : (
            <MaterialIcons name="restaurant" size={64} color="#6c7a74" />
          )}

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

          {status === 'scanning' && (
            <View className="absolute inset-0 bg-ink/30 items-center justify-center gap-3">
              <ActivityIndicator size="large" color="#3ecfaa" />
              <Text className="font-label text-surface-container-lowest uppercase">Scanning…</Text>
            </View>
          )}

          {(status === 'idle' || status === 'scanning') && (
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

        {error && (
          <Text className="font-body text-error text-center">{error}</Text>
        )}

        {(status === 'result' || status === 'logging') && result && (
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
                    {Math.round(result.confidencePercent)}% confidence
                  </Text>
                </View>
              </View>

              <View className="gap-1 mt-1">
                <View className="flex-row justify-between">
                  <Text className="font-label text-xs text-on-surface-variant">Protein {proteinPct}%</Text>
                  <Text className="font-label text-xs text-on-surface-variant">Carbs {carbsPct}%</Text>
                  <Text className="font-label text-xs text-on-surface-variant">Fat {fatPct}%</Text>
                </View>
                <View className="h-4 w-full bg-surface-container border-[3px] border-ink rounded-full flex-row overflow-hidden">
                  <View className="h-full bg-primary" style={{ width: `${proteinPct}%` }} />
                  <View className="h-full bg-tertiary-container" style={{ width: `${carbsPct}%` }} />
                  <View className="h-full bg-secondary-container" style={{ width: `${fatPct}%` }} />
                </View>
                <View className="flex-row justify-between mt-1">
                  <Text className="font-body text-xs text-outline">{Math.round(result.proteinG)}g</Text>
                  <Text className="font-body text-xs text-outline">{Math.round(result.carbsG)}g</Text>
                  <Text className="font-body text-xs text-outline">{Math.round(result.fatG)}g</Text>
                </View>
              </View>
            </ChibiSurface>

            <View className="w-full max-w-sm gap-3">
              <ChibiButton
                className="py-3 flex-row items-center justify-center gap-2"
                onPress={handleLogIt}
                disabled={status === 'logging'}
              >
                {status === 'logging' ? (
                  <ActivityIndicator color="#005442" />
                ) : (
                  <>
                    <MaterialIcons name="check-circle" size={20} color="#005442" />
                    <Text className="font-label uppercase text-on-primary-container">Log it</Text>
                  </>
                )}
              </ChibiButton>
              <Pressable
                onPress={handleRetake}
                disabled={status === 'logging'}
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
