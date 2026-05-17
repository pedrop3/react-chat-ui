import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChat } from '@/context/ChatContext';
import { MessageBubble } from '@/components/MessageBubble';
import { ChatInput } from '@/components/ChatInput';
import { ConversationDrawer } from '@/components/ConversationDrawer';
import { colors, spacing } from '@/theme/colors';

export default function ChatScreen() {
  const { active, isSending, sendMessage, stopSending } = useChat();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!active?.messages.length) return;
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, [active?.messages.length, active?.messages[active.messages.length - 1]?.content]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => setDrawerOpen(true)} hitSlop={10}>
          <Text style={styles.menuIcon}>≡</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {active?.title ?? 'Chat'}
        </Text>
        <View style={styles.menuSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {active && active.messages.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Como posso ajudar?</Text>
            <Text style={styles.emptyHint}>
              Envie uma mensagem para começar a conversar com sua aplicação Python.
            </Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={active?.messages ?? []}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => <MessageBubble message={item} />}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          />
        )}

        <ChatInput
          isSending={isSending}
          onSend={(text, attachments) => sendMessage(text, attachments)}
          onStop={stopSending}
        />
      </KeyboardAvoidingView>

      <ConversationDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    color: colors.text,
    fontSize: 26,
    width: 28,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  menuSpacer: { width: 28 },
  listContent: {
    paddingVertical: spacing.md,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  emptyHint: {
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
});
