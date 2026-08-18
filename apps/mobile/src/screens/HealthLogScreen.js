import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ChibiButton, ChibiSurface } from '../components/Chibi';
import { api } from '../api/client';

// Matches design/HealthLog.html. Food log is real, backed by
// GET/POST /food-log (apps/server/src/routes/foodLog.ts) — the "calendar" is
// the chevron_left/Today/chevron_right day nav from the mockup, one day of
// entries at a time. "Scan food" hands off to AIFoodScanScreen, which posts
// its Gemini vision result straight to /food-log and navigates back here.
// Water tracking has no backend model yet, so it stays local-only for now.

const CALORIE_TARGET = 2000;
const WATER_TARGET = 8;
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function shiftDay(date, delta) {
  const next = new Date(date);
  next.setDate(next.getDate() + delta);
  return next;
}

function dateLabel(date) {
  const today = new Date();
  if (toDateKey(date) === toDateKey(today)) return 'Today';
  if (toDateKey(date) === toDateKey(shiftDay(today, -1))) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function HealthLogScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [foodLog, setFoodLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [waterCount, setWaterCount] = useState(5);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeMealType, setActiveMealType] = useState('Snack');
  const [foodName, setFoodName] = useState('');
  const [foodCalories, setFoodCalories] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadFoodLog = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    try {
      const entries = await api.getFoodLog(toDateKey(date));
      setFoodLog(entries);
    } catch (err) {
      setError(err.message || 'Could not load your food log.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFoodLog(selectedDate);
    }, [loadFoodLog, selectedDate]),
  );

  const totals = useMemo(
    () =>
      foodLog.reduce(
        (acc, item) => ({
          calories: acc.calories + item.calories,
          proteinG: acc.proteinG + (item.proteinG || 0),
          carbsG: acc.carbsG + (item.carbsG || 0),
          fatG: acc.fatG + (item.fatG || 0),
        }),
        { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
      ),
    [foodLog],
  );
  const progress = Math.min(1, totals.calories / CALORIE_TARGET);
  const isToday = toDateKey(selectedDate) === toDateKey(new Date());

  const mealSections = useMemo(
    () =>
      MEAL_TYPES.map((mealType) => ({
        mealType,
        items: foodLog.filter((item) => item.mealType === mealType),
      })).filter((section) => section.items.length > 0),
    [foodLog],
  );

  const openAddFoodModal = (mealType) => {
    setActiveMealType(mealType);
    setFoodName('');
    setFoodCalories('');
    setModalVisible(true);
  };

  const submitFood = async () => {
    const calories = parseInt(foodCalories, 10);
    if (!foodName.trim() || Number.isNaN(calories) || calories <= 0) return;

    const loggedAt = new Date(selectedDate);
    const now = new Date();
    loggedAt.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

    setSubmitting(true);
    try {
      await api.logFood({
        name: foodName.trim(),
        mealType: activeMealType,
        calories,
        source: 'manual',
        loggedAt: loggedAt.toISOString(),
      });
      setModalVisible(false);
      await loadFoodLog(selectedDate);
    } catch (err) {
      setError(err.message || 'Could not save that food.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleWaterAt = (index) => {
    setWaterCount((prev) => (index < prev ? index : index + 1));
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-5 py-3 border-b-[3px] border-ink">
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={24} color="#006b55" />
        </Pressable>
        <Text className="font-headline text-primary uppercase tracking-tight text-xl">Health Log</Text>
        <MaterialIcons name="settings" size={24} color="#006b55" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48, gap: 24 }}>
        {/* Action row */}
        <View className="flex-row items-center justify-between">
          <ChibiButton className="px-4 py-3 flex-row items-center gap-2" onPress={() => navigation.navigate('AIFoodScan')}>
            <MaterialIcons name="photo-camera" size={20} color="#005442" />
            <Text className="font-label uppercase text-on-primary-container">Scan food</Text>
          </ChibiButton>
        </View>

        {error && (
          <ChibiSurface className="p-3">
            <Text className="font-body text-error text-center">{error}</Text>
          </ChibiSurface>
        )}

        {/* Date nav + calorie progress */}
        <ChibiSurface className="p-6 items-center gap-4">
          <View className="w-full flex-row items-center justify-between">
            <Pressable onPress={() => setSelectedDate((d) => shiftDay(d, -1))} hitSlop={8}>
              <MaterialIcons name="chevron-left" size={28} color="#1c1b1b" />
            </Pressable>
            <Text className="font-headline text-lg text-on-background">{dateLabel(selectedDate)}</Text>
            <Pressable onPress={() => !isToday && setSelectedDate((d) => shiftDay(d, 1))} hitSlop={8} disabled={isToday}>
              <MaterialIcons name="chevron-right" size={28} color={isToday ? '#bbcac3' : '#1c1b1b'} />
            </Pressable>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#3ecfaa" />
          ) : (
            <>
              <View className="items-center gap-1">
                <Text className="font-headline text-4xl text-on-background">{totals.calories}</Text>
                <Text className="font-label text-outline">/ {CALORIE_TARGET} kcal</Text>
              </View>
              <View className="w-full h-4 rounded-full border-[3px] border-ink bg-surface-container-high overflow-hidden">
                <View
                  className="h-full bg-primary-container border-r-[3px] border-ink"
                  style={{ width: `${progress * 100}%` }}
                />
              </View>
              <View className="w-full flex-row justify-between px-2">
                <View className="items-center">
                  <Text className="font-label text-xs text-outline">PROTEIN</Text>
                  <Text className="font-label text-secondary-container">{Math.round(totals.proteinG)}g</Text>
                </View>
                <View className="items-center">
                  <Text className="font-label text-xs text-outline">CARBS</Text>
                  <Text className="font-label text-tertiary-container">{Math.round(totals.carbsG)}g</Text>
                </View>
                <View className="items-center">
                  <Text className="font-label text-xs text-outline">FAT</Text>
                  <Text className="font-label text-primary">{Math.round(totals.fatG)}g</Text>
                </View>
              </View>
            </>
          )}
        </ChibiSurface>

        {/* Meal sections */}
        {!loading && (
          <View className="gap-4">
            {mealSections.map((section) => (
              <View key={section.mealType}>
                <View className="flex-row justify-between items-center mb-2 px-1">
                  <Text className="font-headline text-lg text-on-background">{section.mealType}</Text>
                  <Text className="font-label text-outline">
                    {section.items.reduce((sum, i) => sum + i.calories, 0)} kcal
                  </Text>
                </View>
                <ChibiSurface>
                  {section.items.map((item, idx) => (
                    <View
                      key={item.id}
                      className={`flex-row items-center gap-3 p-3 ${idx > 0 ? 'border-t-[3px] border-ink' : ''}`}
                    >
                      <View className="w-12 h-12 bg-secondary-container items-center justify-center rounded border-2 border-ink">
                        <MaterialIcons name={item.source === 'scan' ? 'photo-camera' : 'restaurant'} size={20} color="#1c1b1b" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-label text-on-background">{item.name}</Text>
                        <Text className="font-body text-outline text-xs">
                          {new Date(item.loggedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        </Text>
                      </View>
                      <Text className="font-label text-on-background">{item.calories} kcal</Text>
                    </View>
                  ))}
                </ChibiSurface>
                <Pressable
                  onPress={() => openAddFoodModal(section.mealType)}
                  className="mt-2 flex-row justify-center items-center gap-2 py-2 border-2 border-dashed border-outline rounded-xl"
                >
                  <MaterialIcons name="add" size={18} color="#6c7a74" />
                  <Text className="font-label text-outline uppercase">Add food</Text>
                </Pressable>
              </View>
            ))}

            {mealSections.length === 0 && (
              <ChibiSurface className="p-4">
                <Text className="text-on-surface-variant text-center">No food logged {isToday ? 'yet today' : 'this day'}.</Text>
              </ChibiSurface>
            )}

            <Pressable
              onPress={() => openAddFoodModal('Snack')}
              className="flex-row justify-center items-center gap-2 py-2 border-2 border-dashed border-outline rounded-xl"
            >
              <MaterialIcons name="add" size={18} color="#6c7a74" />
              <Text className="font-label text-outline uppercase">Add snack</Text>
            </Pressable>
          </View>
        )}

        {/* Water tracker */}
        <View className="gap-3 items-center">
          <Text className="font-headline text-lg text-on-background">Today's Water Intake</Text>
          <Text className="font-label text-xs text-on-surface-variant uppercase tracking-wider">
            Goal: {WATER_TARGET} Cups
          </Text>
          <View className="w-full h-6 border-[3px] border-ink rounded-full bg-surface-container-high overflow-hidden">
            <View
              className="h-full bg-primary-container border-r-[3px] border-ink items-end justify-center pr-2"
              style={{ width: `${(waterCount / WATER_TARGET) * 100}%` }}
            >
              <Text className="font-label text-xs text-on-primary-container">
                {waterCount}/{WATER_TARGET}
              </Text>
            </View>
          </View>
          <View className="w-full flex-row flex-wrap gap-3 justify-center">
            {Array.from({ length: WATER_TARGET }).map((_, index) => {
              const filled = index < waterCount;
              return (
                <Pressable
                  key={index}
                  onPress={() => toggleWaterAt(index)}
                  className={`w-14 h-14 items-center justify-center rounded-xl border-[3px] border-ink ${
                    filled ? 'bg-primary-container' : 'bg-surface-container-lowest'
                  }`}
                >
                  <MaterialIcons name="water-drop" size={26} color={filled ? '#005442' : '#6c7a74'} />
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Add food modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 bg-ink/50 items-center justify-center px-6">
          <ChibiSurface className="w-full p-5 gap-4">
            <Text className="font-headline text-lg text-on-background uppercase">Add food · {activeMealType}</Text>
            <TextInput
              placeholder="Food name"
              value={foodName}
              onChangeText={setFoodName}
              className="border-b-2 border-outline-variant py-2 text-on-background"
            />
            <TextInput
              placeholder="Calories"
              value={foodCalories}
              onChangeText={setFoodCalories}
              keyboardType="number-pad"
              className="border-b-2 border-outline-variant py-2 text-on-background"
            />
            <View className="flex-row gap-3">
              <ChibiButton className="flex-1 py-3" onPress={() => setModalVisible(false)} disabled={submitting}>
                <Text className="font-label uppercase text-on-primary-container">Cancel</Text>
              </ChibiButton>
              <ChibiButton className="flex-1 py-3" onPress={submitFood} disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator color="#005442" />
                ) : (
                  <Text className="font-label uppercase text-on-primary-container">Add</Text>
                )}
              </ChibiButton>
            </View>
          </ChibiSurface>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
