import React, { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Attachment } from '@/types';
import { colors, radius, spacing } from '@/theme/colors';
import { AttachmentPicker } from './AttachmentPicker';

interface Props {
  isSending: boolean;
  onSend: (text: string, attachments: Attachment[]) => void;
  onStop: () => void;
}

export function ChatInput({ isSending, onSend, onStop }: Props) {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  function handleSend() {
    if (isSending) {
      onStop();
      return;
    }
    if (!text.trim() && attachments.length === 0) return;
    onSend(text, attachments);
    setText('');
    setAttachments([]);
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <View style={styles.container}>
      {attachments.length > 0 && (
        <View style={styles.attachmentList}>
          {attachments.map((a) => (
            <Pressable
              key={a.id}
              onPress={() => removeAttachment(a.id)}
              style={styles.attachmentChip}
            >
              {a.mimeType?.startsWith('image/') ? (
                <Image source={{ uri: a.uri }} style={styles.chipImage} />
              ) : (
                <Text style={styles.chipText} numberOfLines={1}>
                  📎 {a.name}
                </Text>
              )}
              <Text style={styles.chipClose}>×</Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.row}>
        <AttachmentPicker
          onPicked={(a) => setAttachments((prev) => [...prev, a])}
        />
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Mensagem..."
          placeholderTextColor={colors.textMuted}
          multiline
          editable={!isSending}
        />
        <Pressable
          onPress={handleSend}
          style={[
            styles.sendBtn,
            isSending && styles.sendBtnStop,
          ]}
          accessibilityLabel={isSending ? 'Parar' : 'Enviar'}
        >
          <Text style={styles.sendIcon}>{isSending ? '■' : '↑'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: colors.bgInput,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    color: colors.text,
    fontSize: 15,
    maxHeight: 140,
    minHeight: 40,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  sendBtnStop: {
    backgroundColor: colors.danger,
  },
  sendIcon: {
    color: colors.primaryText,
    fontSize: 18,
    fontWeight: '600',
  },
  attachmentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  attachmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgInput,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    maxWidth: 200,
  },
  chipImage: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    marginRight: spacing.xs,
  },
  chipText: {
    color: colors.text,
    fontSize: 13,
    flexShrink: 1,
  },
  chipClose: {
    color: colors.textMuted,
    fontSize: 18,
    marginLeft: spacing.xs,
  },
});
