import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import uuid from 'react-native-uuid';
import { Attachment, Conversation, Message } from '@/types';
import { loadConversations, saveConversations } from '@/storage/conversations';
import { sendChatRest, sendChatStream } from '@/api/client';
import { STREAMING_ENABLED } from '@/api/config';

interface ChatContextValue {
  conversations: Conversation[];
  activeId: string | null;
  active: Conversation | null;
  isSending: boolean;
  selectConversation: (id: string) => void;
  newConversation: () => void;
  deleteConversation: (id: string) => void;
  sendMessage: (text: string, attachments?: Attachment[]) => Promise<void>;
  stopSending: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

function makeId(): string {
  return uuid.v4() as string;
}

function titleFromText(text: string): string {
  const t = text.trim().replace(/\s+/g, ' ');
  return t.length > 40 ? `${t.slice(0, 40)}…` : t || 'Nova conversa';
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const hydratedRef = useRef(false);

  // Carregar persistido
  useEffect(() => {
    (async () => {
      const stored = await loadConversations();
      if (stored.length === 0) {
        const fresh: Conversation = {
          id: makeId(),
          title: 'Nova conversa',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: [],
        };
        setConversations([fresh]);
        setActiveId(fresh.id);
      } else {
        setConversations(stored);
        setActiveId(stored[0].id);
      }
      hydratedRef.current = true;
    })();
  }, []);

  // Persistir mudanças (depois de hidratar)
  useEffect(() => {
    if (!hydratedRef.current) return;
    saveConversations(conversations);
  }, [conversations]);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

  const selectConversation = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const newConversation = useCallback(() => {
    const fresh: Conversation = {
      id: makeId(),
      title: 'Nova conversa',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setConversations((prev) => [fresh, ...prev]);
    setActiveId(fresh.id);
  }, []);

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (next.length === 0) {
          const fresh: Conversation = {
            id: makeId(),
            title: 'Nova conversa',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            messages: [],
          };
          setActiveId(fresh.id);
          return [fresh];
        }
        if (id === activeId) {
          setActiveId(next[0].id);
        }
        return next;
      });
    },
    [activeId],
  );

  const updateActive = useCallback(
    (updater: (c: Conversation) => Conversation) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === activeId ? updater(c) : c)),
      );
    },
    [activeId],
  );

  const stopSending = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsSending(false);
  }, []);

  const sendMessage = useCallback(
    async (text: string, attachments?: Attachment[]) => {
      if (!activeId) return;
      const trimmed = text.trim();
      if (!trimmed && (!attachments || attachments.length === 0)) return;

      const userMsg: Message = {
        id: makeId(),
        role: 'user',
        content: trimmed,
        createdAt: Date.now(),
        attachments,
      };
      const assistantMsg: Message = {
        id: makeId(),
        role: 'assistant',
        content: '',
        createdAt: Date.now(),
        pending: true,
      };

      updateActive((c) => ({
        ...c,
        title: c.messages.length === 0 ? titleFromText(trimmed) : c.title,
        updatedAt: Date.now(),
        messages: [...c.messages, userMsg, assistantMsg],
      }));

      setIsSending(true);
      const controller = new AbortController();
      abortRef.current = controller;

      const convId = activeId;
      const history = (active?.messages ?? []).concat(userMsg);

      const onChunk = (_delta: string, fullText: string) => {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  updatedAt: Date.now(),
                  messages: c.messages.map((m) =>
                    m.id === assistantMsg.id ? { ...m, content: fullText } : m,
                  ),
                }
              : c,
          ),
        );
      };

      try {
        const result = STREAMING_ENABLED
          ? await sendChatStream(convId, history, attachments, {
              signal: controller.signal,
              onChunk,
            })
          : await sendChatRest(convId, history, attachments, {
              signal: controller.signal,
            });

        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  updatedAt: Date.now(),
                  messages: c.messages.map((m) =>
                    m.id === assistantMsg.id
                      ? { ...m, content: result.text, pending: false }
                      : m,
                  ),
                }
              : c,
          ),
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erro desconhecido';
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  updatedAt: Date.now(),
                  messages: c.messages.map((m) =>
                    m.id === assistantMsg.id
                      ? { ...m, content: '', pending: false, error: msg }
                      : m,
                  ),
                }
              : c,
          ),
        );
      } finally {
        abortRef.current = null;
        setIsSending(false);
      }
    },
    [activeId, active, updateActive],
  );

  const value: ChatContextValue = {
    conversations,
    activeId,
    active,
    isSending,
    selectConversation,
    newConversation,
    deleteConversation,
    sendMessage,
    stopSending,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
