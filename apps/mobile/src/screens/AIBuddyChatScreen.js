import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

// Matches design/AIBuddyChat.html. Needs a real LLM integration decision
// before this can talk to anything real — everything here is local state
// and canned replies. See getMockBuddyReply below for the swap point.

const REPLY_DELAY_MS = 600;

const CANNED_REPLIES = [
  "You've got this! Every rep counts toward your next level.",
  "Nice work checking in — consistency is your best stat boost.",
  "Remember to hydrate between sets, hero!",
  "Small steps today, big XP gains tomorrow. Keep going!",
  "I'm proud of you for showing up. Let's crush the next quest together.",
];

let replyIndex = 0;

// ---------------------------------------------------------------------------
// SEAM: this is the one place that stands in for a real LLM call. Swap the
// body of this function for a real request (send `userMessage` + history to
// a model, await its reply) — everything else in this screen only depends on
// this function resolving/returning a string.
function getMockBuddyReply(userMessage) {
  const reply = CANNED_REPLIES[replyIndex % CANNED_REPLIES.length];
  replyIndex += 1;
  return reply;
}
// ---------------------------------------------------------------------------

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
  const scrollRef = useRef(null);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;

    const userMessage = { id: `${Date.now()}-user`, sender: 'user', text };
    setMessages((prev) => [...prev, userMessage]);
    setDraft('');

    setTimeout(() => {
      const reply = getMockBuddyReply(text);
      setMessages((prev) => [...prev, { id: `${Date.now()}-ai`, sender: 'ai', text: reply }]);
      scrollRef.current?.scrollToEnd({ animated: true });
    }, REPLY_DELAY_MS);

    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
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
            />
          </View>
          <Pressable
            onPress={handleSend}
            className="w-12 h-12 rounded-xl border-[3px] border-ink bg-secondary-container items-center justify-center"
          >
            <MaterialIcons name="send" size={22} color="#6d0010" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
