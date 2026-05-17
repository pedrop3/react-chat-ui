import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import uuid from 'react-native-uuid';
import { Attachment } from '@/types';
import { colors, radius, spacing } from '@/theme/colors';

interface Props {
  onPicked: (a: Attachment) => void;
}

export function AttachmentPicker({ onPicked }: Props) {
  const [open, setOpen] = useState(false);

  async function pickImage() {
    setOpen(false);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permissão necessária', 'Permita acesso à galeria.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: false,
    });
    if (res.canceled || !res.assets?.[0]) return;
    const a = res.assets[0];
    onPicked({
      id: uuid.v4() as string,
      name: a.fileName ?? `image-${Date.now()}.jpg`,
      uri: a.uri,
      mimeType: a.mimeType ?? 'image/jpeg',
      size: a.fileSize,
    });
  }

  async function pickCamera() {
    setOpen(false);
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permissão necessária', 'Permita acesso à câmera.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (res.canceled || !res.assets?.[0]) return;
    const a = res.assets[0];
    onPicked({
      id: uuid.v4() as string,
      name: a.fileName ?? `photo-${Date.now()}.jpg`,
      uri: a.uri,
      mimeType: a.mimeType ?? 'image/jpeg',
      size: a.fileSize,
    });
  }

  async function pickFile() {
    setOpen(false);
    const res = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      multiple: false,
      copyToCacheDirectory: true,
    });
    if (res.canceled || !res.assets?.[0]) return;
    const a = res.assets[0];
    onPicked({
      id: uuid.v4() as string,
      name: a.name,
      uri: a.uri,
      mimeType: a.mimeType,
      size: a.size,
    });
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={styles.attachBtn}
        accessibilityLabel="Anexar arquivo"
      >
        <Text style={styles.attachIcon}>+</Text>
      </Pressable>

      <Modal
        transparent
        animationType="fade"
        visible={open}
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>Anexar</Text>
            <Pressable style={styles.option} onPress={pickImage}>
              <Text style={styles.optionText}>Imagem da galeria</Text>
            </Pressable>
            <Pressable style={styles.option} onPress={pickCamera}>
              <Text style={styles.optionText}>Tirar foto</Text>
            </Pressable>
            <Pressable style={styles.option} onPress={pickFile}>
              <Text style={styles.optionText}>Arquivo</Text>
            </Pressable>
            <Pressable
              style={[styles.option, styles.cancel]}
              onPress={() => setOpen(false)}
            >
              <Text style={styles.optionText}>Cancelar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  attachBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  attachIcon: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 26,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bgElevated,
    padding: spacing.lg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  sheetTitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  option: {
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  optionText: {
    color: colors.text,
    fontSize: 16,
  },
  cancel: {
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
