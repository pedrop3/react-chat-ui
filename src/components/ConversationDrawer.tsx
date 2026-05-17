import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useChat } from '@/context/ChatContext';
import { colors, radius, spacing } from '@/theme/colors';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function ConversationDrawer({ visible, onClose }: Props) {
  const {
    conversations,
    activeId,
    selectConversation,
    newConversation,
    deleteConversation,
  } = useChat();

  function handleSelect(id: string) {
    selectConversation(id);
    onClose();
  }

  function handleNew() {
    newConversation();
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.drawer}>
          <View style={styles.header}>
            <Text style={styles.title}>Conversas</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={styles.close}>×</Text>
            </Pressable>
          </View>

          <Pressable style={styles.newBtn} onPress={handleNew}>
            <Text style={styles.newBtnText}>+ Nova conversa</Text>
          </Pressable>

          <ScrollView style={styles.list}>
            {conversations.map((c) => (
              <View
                key={c.id}
                style={[
                  styles.item,
                  c.id === activeId && styles.itemActive,
                ]}
              >
                <Pressable
                  style={styles.itemMain}
                  onPress={() => handleSelect(c.id)}
                >
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {c.title}
                  </Text>
                  <Text style={styles.itemMeta}>
                    {c.messages.length} mensagens
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => deleteConversation(c.id)}
                  hitSlop={10}
                  style={styles.deleteBtn}
                >
                  <Text style={styles.deleteText}>🗑</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>
        <Pressable style={styles.flex} onPress={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    width: '82%',
    maxWidth: 360,
    backgroundColor: colors.bgElevated,
    paddingTop: 56,
    paddingHorizontal: spacing.md,
  },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  close: {
    color: colors.textMuted,
    fontSize: 28,
    lineHeight: 28,
  },
  newBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  newBtnText: {
    color: colors.primaryText,
    fontSize: 15,
    fontWeight: '600',
  },
  list: { flex: 1 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  itemActive: {
    backgroundColor: colors.bgInput,
  },
  itemMain: { flex: 1 },
  itemTitle: {
    color: colors.text,
    fontSize: 15,
  },
  itemMeta: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  deleteBtn: {
    padding: spacing.xs,
  },
  deleteText: {
    fontSize: 16,
    color: colors.textMuted,
  },
});
