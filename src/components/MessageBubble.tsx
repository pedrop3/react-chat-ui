import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
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
        ) : isUser ? (
          <Text style={styles.textUser}>
            {message.content}
            {message.pending ? '▍' : ''}
          </Text>
        ) : (
          <Markdown style={mdStyles}>
            {(message.content ?? '') + (message.pending ? '▍' : '')}
          </Markdown>
        )}
      </View>
    </View>
  );
}

// ─── Markdown theme ───────────────────────────────────────────────────────────
const mdStyles = {
  body: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: spacing.xs,
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  heading1: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700' as const,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    lineHeight: 28,
  },
  heading2: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700' as const,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    lineHeight: 26,
  },
  heading3: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700' as const,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    lineHeight: 24,
  },
  strong: {
    fontWeight: '700' as const,
    color: colors.text,
  },
  em: {
    fontStyle: 'italic' as const,
    color: colors.text,
  },
  code_inline: {
    backgroundColor: colors.bg,
    color: colors.primary,
    borderRadius: radius.sm,
    paddingLeft: 4,
    paddingRight: 4,
    fontSize: 13,
  },
  fence: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  code_block: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    fontSize: 13,
    color: colors.text,
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    paddingLeft: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    backgroundColor: colors.bg,
  },
  bullet_list: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  ordered_list: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  list_item: {
    marginTop: 2,
    marginBottom: 2,
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
  },
  bullet_list_icon: {
    color: colors.primary,
    marginRight: spacing.xs,
    lineHeight: 22,
  },
  ordered_list_icon: {
    color: colors.primary,
    marginRight: spacing.xs,
    lineHeight: 22,
  },
  link: {
    color: colors.primary,
    textDecorationLine: 'underline' as const,
  },
  hr: {
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  th: {
    backgroundColor: colors.bg,
    padding: spacing.xs,
    fontWeight: '700' as const,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  td: {
    padding: spacing.xs,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tr: {
    borderWidth: 1,
    borderColor: colors.border,
  },
};

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
