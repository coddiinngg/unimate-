import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { AppButton } from '../../src/components/ui/AppButton';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppScreen } from '../../src/components/ui/AppScreen';
import { runAiTask } from '../../src/services/ai/aiRouter';
import { useChatStore } from '../../src/stores/chatStore';
import { useTimetableStore } from '../../src/stores/timetableStore';
import { colors } from '../../src/theme/colors';

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export default function ChatScreen() {
  const { classId } = useLocalSearchParams<{ classId?: string }>();
  const linkedClassId = Array.isArray(classId) ? classId[0] : classId;

  const classes = useTimetableStore((state) => state.classes);
  const conversations = useChatStore((state) => state.conversations);
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const messagesByConversation = useChatStore((state) => state.messagesByConversation);
  const createConversation = useChatStore((state) => state.createConversation);
  const ensureConversationForClass = useChatStore((state) => state.ensureConversationForClass);
  const deleteConversation = useChatStore((state) => state.deleteConversation);
  const setActiveConversation = useChatStore((state) => state.setActiveConversation);
  const addUserMessage = useChatStore((state) => state.addUserMessage);
  const startAssistantMessage = useChatStore((state) => state.startAssistantMessage);
  const appendAssistantChunk = useChatStore((state) => state.appendAssistantChunk);
  const finishAssistantMessage = useChatStore((state) => state.finishAssistantMessage);

  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [draftClassId, setDraftClassId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!conversations.length) {
      createConversation();
      return;
    }
    if (!activeConversationId) {
      setActiveConversation(conversations[0].id);
    }
  }, [activeConversationId, conversations, createConversation, setActiveConversation]);

  useEffect(() => {
    if (!linkedClassId) return;
    const exists = classes.some((item) => item.id === linkedClassId);
    if (!exists) return;
    ensureConversationForClass(linkedClassId);
    setDraftClassId(linkedClassId);
  }, [classes, ensureConversationForClass, linkedClassId]);

  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === activeConversationId) ?? null,
    [activeConversationId, conversations],
  );
  const messages = activeConversationId ? messagesByConversation[activeConversationId] ?? [] : [];
  const activeClass = activeConversation?.classId ? classes.find((item) => item.id === activeConversation.classId) : undefined;

  const handleCreateConversation = () => {
    createConversation({ classId: draftClassId, title: draftClassId ? '수업 연결 대화' : '새 대화' });
  };

  const handleDeleteConversation = () => {
    if (!activeConversationId) return;
    deleteConversation(activeConversationId);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || !activeConversationId || isSending) return;

    const className = activeClass?.name;
    const prompt = className ? `[수업: ${className}] ${trimmed}` : trimmed;

    addUserMessage(activeConversationId, trimmed);
    setInput('');

    const assistantMessageId = startAssistantMessage(activeConversationId);
    setIsSending(true);

    try {
      const result = await runAiTask('chat', prompt);
      const response = result.output || '응답이 비어 있습니다.';

      for (let index = 0; index < response.length; index += 8) {
        const chunk = response.slice(index, index + 8);
        appendAssistantChunk(activeConversationId, assistantMessageId, chunk);
        await sleep(30);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AI 응답 생성 중 오류가 발생했습니다.';
      appendAssistantChunk(activeConversationId, assistantMessageId, message);
    } finally {
      finishAssistantMessage(activeConversationId, assistantMessageId);
      setIsSending(false);
    }
  };

  return (
    <AppScreen title="Chat" showBack contentStyle={styles.content}>
      <AppCard>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>대화 목록</Text>
          <View style={styles.headerActions}>
            <AppButton label="새 대화" size="sm" onPress={handleCreateConversation} />
            <AppButton label="삭제" size="sm" variant="danger" onPress={handleDeleteConversation} />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.conversationList}>
          {conversations.map((conversation) => {
            const conversationClass = conversation.classId ? classes.find((item) => item.id === conversation.classId) : undefined;
            const selected = conversation.id === activeConversationId;
            return (
              <Text
                key={conversation.id}
                style={[styles.conversationPill, selected ? styles.conversationPillActive : null]}
                onPress={() => setActiveConversation(conversation.id)}
              >
                {conversationClass ? `${conversationClass.name} · ` : ''}
                {conversation.title}
              </Text>
            );
          })}
        </ScrollView>

        <Text style={styles.classLabel}>연결 수업</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.classList}>
          <Text
            style={[styles.classChip, !draftClassId ? styles.classChipActive : null]}
            onPress={() => setDraftClassId(undefined)}
          >
            연결 안 함
          </Text>
          {classes.map((item) => (
            <Text
              key={item.id}
              style={[styles.classChip, draftClassId === item.id ? styles.classChipActive : null]}
              onPress={() => setDraftClassId(item.id)}
            >
              {item.name}
            </Text>
          ))}
        </ScrollView>
      </AppCard>

      <AppCard>
        <View style={styles.chatHead}>
          <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.textSubtle} />
          <Text style={styles.chatHeadText}>
            {activeClass ? activeClass.name : '연결 없음'}
          </Text>
        </View>

        <ScrollView style={styles.messagesWrap} contentContainerStyle={styles.messagesContent}>
          {messages.map((message) => (
            <View
              key={message.id}
              style={[styles.messageBubble, message.role === 'user' ? styles.userBubble : styles.assistantBubble]}
            >
              <Text style={[styles.messageText, message.role === 'user' ? styles.userText : styles.assistantText]}>
                {message.content || (message.isStreaming ? '...' : '')}
              </Text>
            </View>
          ))}
          {!messages.length ? <Text style={styles.emptyText}>메시지 없음</Text> : null}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="질문을 입력하세요"
            placeholderTextColor={colors.textSubtle}
            style={styles.input}
            editable={!isSending}
            multiline
          />
          <AppButton label={isSending ? '응답 중' : '전송'} onPress={handleSend} disabled={!input.trim() || isSending} />
        </View>
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 6,
  },
  conversationList: {
    marginTop: 10,
    gap: 8,
    paddingBottom: 2,
  },
  conversationPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  conversationPillActive: {
    borderColor: colors.primaryStrong,
    backgroundColor: colors.primarySoft,
    color: colors.primaryStrong,
  },
  classLabel: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSubtle,
  },
  classList: {
    marginTop: 8,
    gap: 8,
  },
  classChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  classChipActive: {
    borderColor: colors.primaryStrong,
    backgroundColor: colors.primarySoft,
    color: colors.primaryStrong,
  },
  chatHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chatHeadText: {
    color: colors.textSubtle,
    fontSize: 12,
    fontWeight: '700',
  },
  messagesWrap: {
    marginTop: 10,
    maxHeight: 320,
  },
  messagesContent: {
    gap: 8,
    paddingBottom: 8,
  },
  messageBubble: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    maxWidth: '92%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primaryStrong,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  assistantText: {
    color: colors.text,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  inputRow: {
    marginTop: 10,
    gap: 8,
  },
  input: {
    minHeight: 74,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surface,
    textAlignVertical: 'top',
  },
});
