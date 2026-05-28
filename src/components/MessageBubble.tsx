import React from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Message } from '@/types';
import { colors, radius, spacing } from '@/theme/colors';
import { useChat } from '@/context/ChatContext';

const TOOL_ICONS: Record<string, string> = {
  rag_search:       '🔍',
  web_search:       '🌐',
  web_fetch:        '📄',
  compare_products: '⚖️',
  kg_search_entity: '🔗',
  kg_neighbors:     '🔗',
  kg_extract:       '📊',
};

interface Props {
  message: Message;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';
  const hasError = !!message.error;
  const isEmpty = !message.content && !message.error && message.pending && !message.interrupt;
  const { resumeInterrupt, isSending, submitFeedback } = useChat();

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

        {/* Tool call badges — visíveis apenas em mensagens do assistente */}
        {!isUser && message.toolCalls && message.toolCalls.length > 0 && (
          <View style={styles.toolCallList}>
            {message.toolCalls.map((tc) => (
              <View key={tc.id} style={styles.toolCallBadge}>
                {tc.status === 'running' ? (
                  <ActivityIndicator size="small" color={colors.primary} style={styles.tcSpinner} />
                ) : (
                  <Text style={styles.tcCheck}>✓</Text>
                )}
                <Text style={[styles.tcName, tc.status === 'done' && styles.tcNameDone]}>
                  {TOOL_ICONS[tc.name] ?? '⚙'} {tc.name}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Human-in-the-Loop interrupt cards */}
        {!isUser && message.interrupt && (
          <View style={styles.interruptContainer}>
            <Text style={styles.interruptQuestion}>{message.interrupt.question}</Text>
            <View style={styles.interruptOptions}>
              {message.interrupt.options.map((opt) => {
                const isSelected = message.interrupt?.selected === opt.label;
                const anySelected = !!message.interrupt?.selected;
                return (
                  <Pressable
                    key={opt.id}
                    style={({ pressed }) => [
                      styles.interruptOption,
                      isSelected && styles.interruptOptionSelected,
                      anySelected && !isSelected && styles.interruptOptionDimmed,
                      pressed && !anySelected && !isSending && styles.interruptOptionPressed,
                    ]}
                    onPress={() => {
                      if (!anySelected && !isSending) {
                        resumeInterrupt(opt.label);
                      }
                    }}
                    disabled={anySelected || isSending}
                  >
                    <Text
                      style={[
                        styles.interruptOptionText,
                        isSelected && styles.interruptOptionTextSelected,
                        anySelected && !isSelected && styles.interruptOptionTextDimmed,
                      ]}
                    >
                      {isSelected ? '✓ ' : ''}{opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

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

        {/* Feedback buttons — visible only for completed assistant messages */}
        {!isUser && !message.pending && !hasError && !!message.content && (
          <View style={styles.feedbackRow}>
            <Pressable
              style={[
                styles.feedbackBtn,
                message.feedback === 'up' && styles.feedbackBtnActive,
                !!message.feedback && message.feedback !== 'up' && styles.feedbackBtnDimmed,
              ]}
              onPress={() => submitFeedback(message.id, 'up')}
              disabled={!!message.feedback}
              accessibilityLabel="Resposta útil"
            >
              <Text style={[
                styles.feedbackIcon,
                message.feedback === 'up' && styles.feedbackIconActive,
              ]}>👍</Text>
            </Pressable>
            <Pressable
              style={[
                styles.feedbackBtn,
                message.feedback === 'down' && styles.feedbackBtnActive,
                !!message.feedback && message.feedback !== 'down' && styles.feedbackBtnDimmed,
              ]}
              onPress={() => submitFeedback(message.id, 'down')}
              disabled={!!message.feedback}
              accessibilityLabel="Resposta não útil"
            >
              <Text style={[
                styles.feedbackIcon,
                message.feedback === 'down' && styles.feedbackIconActive,
              ]}>👎</Text>
            </Pressable>
          </View>
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
  interruptContainer: {
    marginBottom: spacing.sm,
  },
  interruptQuestion: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  interruptOptions: {
    flexDirection: 'column',
  },
  interruptOption: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  interruptOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  interruptOptionDimmed: {
    borderColor: colors.border,
    opacity: 0.45,
  },
  interruptOptionPressed: {
    backgroundColor: colors.bgInput,
  },
  interruptOptionText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  interruptOptionTextSelected: {
    color: colors.primaryText,
    fontWeight: '600',
  },
  interruptOptionTextDimmed: {
    color: colors.textMuted,
  },
  toolCallList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.xs,
  },
  toolCallBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    marginRight: spacing.xs,
    marginBottom: 4,
  },
  tcSpinner: {
    width: 14,
    height: 14,
    marginRight: 5,
  },
  tcCheck: {
    color: colors.success,
    fontSize: 12,
    lineHeight: 16,
    width: 14,
    textAlign: 'center',
    marginRight: 5,
  },
  tcName: {
    color: colors.primary,
    fontSize: 12,
    lineHeight: 16,
  },
  tcNameDone: {
    color: colors.textMuted,
  },
  feedbackRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  feedbackBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  feedbackBtnActive: {
    backgroundColor: colors.bg,
    borderColor: colors.primary,
  },
  feedbackBtnDimmed: {
    opacity: 0.35,
  },
  feedbackIcon: {
    fontSize: 14,
    lineHeight: 20,
  },
  feedbackIconActive: {
    // emoji styling is limited; the border/bg on the button is the real indicator
  },
});
