import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Message } from '@/types';
import { colors, radius, spacing } from '@/theme/colors';

interface Props {
  message: Message;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';
  const hasError = !!message.error;
  const isEmpty = !message.content && !message.error && message.pending;

  return (
    <View
      style={[
        styles.row,
        isUser ? styles.rowUser : styles.rowAssistant,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubbleAssistant,
          hasError && styles.bubbleError,
        ]}
      >
        {message.attachments?.map((a) => (
          <View key={a.id} style={styles.attachment}>
            {a.mimeType?.startsWith('image/') ? (
              <Image source={{ uri: a.uri }} style={styles.attachmentImage} />
            ) : (
              <Text style={styles.attachmentName} numberOfLines={1}>
                📎 {a.name}
              </Text>
            )}
          </View>
        ))}

        {hasError ? (
          <Text style={styles.errorText}>Erro: {message.error}</Text>
        ) : isEmpty ? (
          <Text style={styles.typing}>digitando…</Text>
        ) : (
          <Text style={isUser ? styles.textUser : styles.textAssistant}>
            {message.content}
            {message.pending ? '▍' : ''}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  rowUser: { justifyContent: 'flex-end' },
  rowAssistant: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '85%',
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  bubbleUser: {
    backgroundColor: colors.bubbleUser,
    borderBottomRightRadius: radius.sm,
  },
  bubbleAssistant: {
    backgroundColor: colors.bubbleAssistant,
    borderBottomLeftRadius: radius.sm,
  },
  bubbleError: {
    borderWidth: 1,
    borderColor: colors.danger,
  },
  textUser: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  textAssistant: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  typing: {
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
  },
  attachment: {
    marginBottom: spacing.sm,
  },
  attachmentImage: {
    width: 180,
    height: 180,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
  },
  attachmentName: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
