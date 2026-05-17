export type Role = 'user' | 'assistant' | 'system';

export interface Attachment {
  id: string;
  name: string;
  uri: string;
  mimeType?: string;
  size?: number;
  /** base64 do arquivo, opcional, usado quando o backend espera arquivos inline */
  base64?: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  attachments?: Attachment[];
  /** indica que esta mensagem ainda está sendo escrita (streaming) */
  pending?: boolean;
  /** opcional, caso o backend retorne erro */
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

export interface SendOptions {
  signal?: AbortSignal;
  /** chamado a cada chunk recebido no modo streaming */
  onChunk?: (delta: string, fullText: string) => void;
}

export interface SendResult {
  text: string;
  raw?: unknown;
}
