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

export interface ToolCallInfo {
  /** id único gerado pelo backend (tool_call_id do LangChain) */
  id: string;
  /** nome da tool, ex: "rag_search", "web_fetch" */
  name: string;
  status: 'running' | 'done';
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
  /** tool calls AG-UI emitidos durante a geração desta mensagem */
  toolCalls?: ToolCallInfo[];
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
  /** chamado quando uma tool call começa (status='running') ou termina (status='done') */
  onToolCall?: (info: ToolCallInfo) => void;
}

export interface SendResult {
  text: string;
  raw?: unknown;
}
