import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ChibiButton, ChibiSurface } from '../components/Chibi';

// Matches design/MoodTracker.html — local-only mood log, no backend/calendar
// data model exists yet. History is a plain in-memory array (see todo.md).
// The mockup mixes inconsistent icons for its 4 mood buttons (mood_bad,
// sick, ...); this uses MaterialIcons' full 5-point sentiment scale instead,
// since it matches the mockup's icon *style* while covering a real range.
const MOODS = [
  { key: 'very-dissatisfied', icon: 'sentiment-very-dissatisfied', label: 'Awful' },
  { key: 'dissatisfied', icon: 'sentiment-dissatisfied', label: 'Bad' },
  { key: 'neutral', icon: 'sentiment-neutral', label: 'Okay' },
  { key: 'satisfied', icon: 'sentiment-satisfied', label: 'Good' },
  { key: 'very-satisfied', icon: 'sentiment-very-satisfied', label: 'Great' },
];

export default function MoodTrackerScreen({ navigation }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [history, setHistory] = useState([]);

  const todayLabel = new Date().toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleSave = () => {
    if (!selectedMood) return;
    setHistory((prev) => [{ id: `${Date.now()}`, mood: selectedMood, note: note.trim(), date: new Date().toISOString() }, ...prev]);
    setSelectedMood(null);
    setNote('');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-5 py-3 border-b-[3px] border-ink">
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={22} color="#1c1b1b" />
        </Pressable>
        <Text className="font-headline uppercase tracking-tight text-xl text-on-background">Mood Tracker</Text>
        <MaterialIcons name="settings" size={22} color="#1c1b1b" />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 20, gap: 24, paddingBottom: 48 }}>
          <ChibiSurface className="p-4 flex-row items-center justify-between">
            <Text className="font-headline text-lg uppercase text-on-background">{todayLabel}</Text>
            <MaterialIcons name="calendar-today" size={26} color="#1c1b1b" />
          </ChibiSurface>

          <View className="gap-3">
            <Text className="font-label uppercase text-on-background">I feel...</Text>
            <ChibiSurface className="p-3 flex-row justify-between">
              {MOODS.map((mood) => {
                const active = selectedMood === mood.key;
                return (
                  <Pressable
                    key={mood.key}
                    onPress={() => setSelectedMood(mood.key)}
                    className={`p-2 rounded-lg border-[3px] border-ink items-center gap-1 ${
                      active ? 'bg-primary-container' : 'bg-surface-container'
                    }`}
                  >
                    <MaterialIcons name={mood.icon} size={34} color={active ? '#005442' : '#1c1b1b'} />
                  </Pressable>
                );
              })}
            </ChibiSurface>
          </View>

          <View className="gap-3">
            <Text className="font-label uppercase text-on-background">Daily Diary</Text>
            <ChibiSurface>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Write about your adventure today..."
                multiline
                numberOfLines={5}
                className="p-3 h-32 text-on-background"
                textAlignVertical="top"
              />
            </ChibiSurface>
            <ChibiButton className="py-3" onPress={handleSave} disabled={!selectedMood}>
              <Text className="font-headline uppercase text-on-primary-container">Save Log</Text>
            </ChibiButton>
          </View>

          <View className="gap-3">
            <Text className="font-headline uppercase text-on-background text-lg">Past entries</Text>
            {history.length === 0 && (
              <ChibiSurface className="p-4">
                <Text className="text-on-surface-variant text-center">No mood logged yet — save one above.</Text>
              </ChibiSurface>
            )}
            {history.map((entry) => {
              const mood = MOODS.find((m) => m.key === entry.mood);
              return (
                <ChibiSurface key={entry.id} className="p-3 flex-row gap-3 items-start">
                  <MaterialIcons name={mood?.icon ?? 'sentiment-neutral'} size={28} color="#006b55" />
                  <View className="flex-1">
                    <Text className="font-label text-on-background">{mood?.label}</Text>
                    <Text className="font-body text-outline text-xs mb-1">
                      {new Date(entry.date).toLocaleString()}
                    </Text>
                    {!!entry.note && <Text className="font-body text-on-background">{entry.note}</Text>}
                  </View>
                </ChibiSurface>
              );
            })}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
