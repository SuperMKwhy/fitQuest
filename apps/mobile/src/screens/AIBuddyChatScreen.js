import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { api } from '../api/client';

// Matches design/AIBuddyChat.html. Talks to POST /ai-buddy/chat on the
// server, which forwards to the Gemini API (Google AI Studio) — see
// apps/server/src/routes/aiBuddy.ts and apps/server/src/lib/gemini.ts.

const FALLBACK_REPLY = "Hmm, I couldn't reach my brain just now — mind trying that again?";

const INITIAL_MESSAGES = [
  {
    id: 'seed-1',
    sender: 'ai',
    text: "Hey! Ready to crush today's leg quest? I've set up a routine that'll boost your STR stat!",
  },
];

export default function AIBuddyChatScreen({ navigation }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef(null);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || isSending) return;

    const userMessage = { id: `${Date.now()}-user`, sender: 'user', text };
    const history = messages.map(({ sender, text }) => ({ sender, text }));
    setMessages((prev) => [...prev, userMessage]);
    setDraft('');
    setIsSending(true);
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));

    try {
      const { reply } = await api.sendBuddyMessage(text, history);
      setMessages((prev) => [...prev, { id: `${Date.now()}-ai`, sender: 'ai', text: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-ai-error`, sender: 'ai', text: err.message || FALLBACK_REPLY },
      ]);
    } finally {
      setIsSending(false);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-5 py-3 border-b-[3px] border-ink">
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={22} color="#1c1b1b" />
        </Pressable>
        <Text className="font-headline text-on-surface uppercase tracking-tight text-xl">AI Buddy</Text>
        <MaterialIcons name="settings" size={22} color="#1c1b1b" />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ padding: 20, gap: 16 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message) => {
            const isUser = message.sender === 'user';
            return (
              <View
                key={message.id}
                className={`flex-row items-start gap-2 max-w-[85%] ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}
              >
                {!isUser && (
                  <View className="w-10 h-10 rounded-full border-[3px] border-ink bg-primary-container items-center justify-center shrink-0">
                    <MaterialIcons name="smart-toy" size={20} color="#005442" />
                  </View>
                )}
                <View
                  className={`p-3 rounded-xl border-[3px] border-ink ${
                    isUser ? 'bg-primary rounded-tr-none' : 'bg-surface-container-lowest rounded-tl-none'
                  }`}
                >
                  <Text className={isUser ? 'text-on-primary' : 'text-on-surface'}>{message.text}</Text>
                </View>
              </View>
            );
          })}
          {isSending && (
            <View className="flex-row items-start gap-2 max-w-[85%] self-start">
              <View className="w-10 h-10 rounded-full border-[3px] border-ink bg-primary-container items-center justify-center shrink-0">
                <MaterialIcons name="smart-toy" size={20} color="#005442" />
              </View>
              <View className="p-3 rounded-xl rounded-tl-none border-[3px] border-ink bg-surface-container-lowest">
                <Text className="text-on-surface">Typing…</Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View className="flex-row items-center gap-3 p-3 border-t-[3px] border-ink bg-surface">
          <View className="flex-1 border-[3px] border-ink rounded-xl bg-surface-container-lowest px-3">
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Type a message..."
              className="text-on-surface h-10"
              onSubmitEditing={handleSend}
              returnKeyType="send"
              editable={!isSending}
            />
          </View>
          <Pressable
            onPress={handleSend}
            disabled={isSending}
            className={`w-12 h-12 rounded-xl border-[3px] border-ink bg-secondary-container items-center justify-center ${
              isSending ? 'opacity-50' : ''
            }`}
          >
            <MaterialIcons name="send" size={22} color="#6d0010" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
