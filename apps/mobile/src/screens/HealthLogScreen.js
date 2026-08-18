import { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ChibiButton, ChibiSurface } from '../components/Chibi';

// Matches design/HealthLog.html (calorie/food/water log). Mock-data pass —
// there is no food database or backend for this yet, everything below is
// local component state. See AIFoodScanScreen.js for the "scan food" flow
// that feeds `route.params.scannedFood` back into this screen.

const CALORIE_TARGET = 2000;
const WATER_TARGET = 8;
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const SEED_FOOD_LOG = [
  { id: 'seed-1', name: 'Fried Egg', calories: 140, mealType: 'Breakfast', time: '7:30 AM' },
  { id: 'seed-2', name: 'Toast', calories: 160, mealType: 'Breakfast', time: '7:32 AM' },
  { id: 'seed-3', name: 'Holy Basil Pork', calories: 300, mealType: 'Lunch', time: '12:10 PM' },
  { id: 'seed-4', name: 'Soda', calories: 140, mealType: 'Lunch', time: '12:15 PM' },
];

export default function HealthLogScreen({ navigation, route }) {
  const [foodLog, setFoodLog] = useState(SEED_FOOD_LOG);
  const [waterCount, setWaterCount] = useState(5);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeMealType, setActiveMealType] = useState('Snack');
  const [foodName, setFoodName] = useState('');
  const [foodCalories, setFoodCalories] = useState('');

  const totalCalories = useMemo(() => foodLog.reduce((sum, item) => sum + item.calories, 0), [foodLog]);
  const progress = Math.min(1, totalCalories / CALORIE_TARGET);

  const mealSections = useMemo(
    () =>
      MEAL_TYPES.map((mealType) => ({
        mealType,
        items: foodLog.filter((item) => item.mealType === mealType),
      })).filter((section) => section.items.length > 0),
    [foodLog],
  );

  // Consume a food entry handed back by AIFoodScanScreen's canned vision
  // result, then clear the param so re-focusing this screen doesn't re-add it.
  useFocusEffect(
    useCallback(() => {
      const scanned = route.params?.scannedFood;
      if (scanned) {
        setFoodLog((prev) => [
          ...prev,
          {
            id: `scan-${Date.now()}`,
            name: scanned.name,
            calories: scanned.calories,
            mealType: 'Snack',
            time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          },
        ]);
        navigation.setParams({ scannedFood: undefined });
      }
    }, [route.params?.scannedFood, navigation]),
  );

  const openAddFoodModal = (mealType) => {
    setActiveMealType(mealType);
    setFoodName('');
    setFoodCalories('');
    setModalVisible(true);
  };

  const submitFood = () => {
    const calories = parseInt(foodCalories, 10);
    if (!foodName.trim() || Number.isNaN(calories) || calories <= 0) return;
    setFoodLog((prev) => [
      ...prev,
      {
        id: `manual-${Date.now()}`,
        name: foodName.trim(),
        calories,
        mealType: activeMealType,
        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      },
    ]);
    setModalVisible(false);
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

        {/* Calorie progress */}
        <ChibiSurface className="p-6 items-center gap-4">
          <Text className="font-headline text-lg text-on-background">Today</Text>
          <View className="items-center gap-1">
            <Text className="font-headline text-4xl text-on-background">{totalCalories}</Text>
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
              <Text className="font-label text-secondary-container">80g</Text>
            </View>
            <View className="items-center">
              <Text className="font-label text-xs text-outline">CARBS</Text>
              <Text className="font-label text-tertiary-container">120g</Text>
            </View>
            <View className="items-center">
              <Text className="font-label text-xs text-outline">FAT</Text>
              <Text className="font-label text-primary">45g</Text>
            </View>
          </View>
        </ChibiSurface>

        {/* Meal sections */}
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
                      <MaterialIcons name="restaurant" size={20} color="#1c1b1b" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-label text-on-background">{item.name}</Text>
                      <Text className="font-body text-outline text-xs">{item.time}</Text>
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
              <Text className="text-on-surface-variant text-center">No food logged yet today.</Text>
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
              <ChibiButton className="flex-1 py-3" onPress={() => setModalVisible(false)}>
                <Text className="font-label uppercase text-on-primary-container">Cancel</Text>
              </ChibiButton>
              <ChibiButton className="flex-1 py-3" onPress={submitFood}>
                <Text className="font-label uppercase text-on-primary-container">Add</Text>
              </ChibiButton>
            </View>
          </ChibiSurface>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
