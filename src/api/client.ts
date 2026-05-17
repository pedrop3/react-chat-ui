import { API_BASE_URL, ENDPOINTS, STREAMING_ENABLED } from './config';
import { Attachment, Message, SendOptions, SendResult } from '@/types';

interface ChatPayload {
  conversationId: string;
  messages: { role: string; content: string }[];
  attachments?: Attachment[];
}

function buildPayload(
  conversationId: string,
  messages: Message[],
  attachments?: Attachment[],
): ChatPayload {
  return {
    conversationId,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    attachments: attachments?.map((a) => ({
      id: a.id,
      name: a.name,
      uri: a.uri,
      mimeType: a.mimeType,
      size: a.size,
      base64: a.base64,
    })),
  };
}

/**
 * Envia mensagens para o backend Python via REST (sem streaming).
 * Espera resposta JSON no formato { reply: string } ou { content: string }.
 */
export async function sendChatRest(
  conversationId: string,
  messages: Message[],
  attachments?: Attachment[],
  opts: SendOptions = {},
): Promise<SendResult> {
  const url = `${API_BASE_URL}${ENDPOINTS.chat}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildPayload(conversationId, messages, attachments)),
    signal: opts.signal,
  });

  if (!res.ok) {
    const txt = await safeText(res);
    throw new Error(`API ${res.status}: ${txt || res.statusText}`);
  }

  const data = (await res.json()) as Record<string, unknown>;
  const text =
    (data.reply as string | undefined) ??
    (data.content as string | undefined) ??
    (data.message as string | undefined) ??
    '';
  return { text, raw: data };
}

/**
 * Envia mensagens via streaming (Server-Sent Events).
 * Implementação manual porque o RN não suporta EventSource nativamente.
 *
 * Espera eventos no formato:
 *   data: {"delta": "texto"}
 *   data: [DONE]
 */
export async function sendChatStream(
  conversationId: string,
  messages: Message[],
  attachments?: Attachment[],
  opts: SendOptions = {},
): Promise<SendResult> {
  const url = `${API_BASE_URL}${ENDPOINTS.chatStream}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(buildPayload(conversationId, messages, attachments)),
    signal: opts.signal,
  });

  if (!res.ok || !res.body) {
    const txt = await safeText(res);
    throw new Error(`Stream ${res.status}: ${txt || res.statusText}`);
  }

  const reader = (res.body as ReadableStream<Uint8Array>).getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let full = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    // SSE separa eventos por blank line "\n\n"
    while ((idx = buffer.indexOf('\n\n')) !== -1) {
      const rawEvent = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      const lines = rawEvent.split('\n');
      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (!payload) continue;
        if (payload === '[DONE]') {
          return { text: full };
        }
        try {
          const json = JSON.parse(payload) as { delta?: string; content?: string };
          const delta = json.delta ?? json.content ?? '';
          if (delta) {
            full += delta;
            opts.onChunk?.(delta, full);
          }
        } catch {
          // texto puro como fallback
          full += payload;
          opts.onChunk?.(payload, full);
        }
      }
    }
  }

  return { text: full };
}

/**
 * Função única que decide entre REST e streaming, baseado na config.
 */
export async function sendChat(
  conversationId: string,
  messages: Message[],
  attachments?: Attachment[],
  opts: SendOptions = {},
): Promise<SendResult> {
  if (STREAMING_ENABLED && opts.onChunk) {
    return sendChatStream(conversationId, messages, attachments, opts);
  }
  return sendChatRest(conversationId, messages, attachments, opts);
}

/**
 * Upload de arquivo via multipart/form-data. Use quando preferir não enviar o
 * arquivo inline (base64) dentro do payload de mensagens.
 */
export async function uploadFile(file: Attachment): Promise<{ id: string; url?: string }> {
  const url = `${API_BASE_URL}${ENDPOINTS.upload}`;
  const form = new FormData();
  form.append('file', {
    // @ts-expect-error RN aceita objeto { uri, name, type }
    uri: file.uri,
    name: file.name,
    type: file.mimeType ?? 'application/octet-stream',
  });

  const res = await fetch(url, { method: 'POST', body: form });
  if (!res.ok) {
    const txt = await safeText(res);
    throw new Error(`Upload ${res.status}: ${txt || res.statusText}`);
  }
  return (await res.json()) as { id: string; url?: string };
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return '';
  }
}
