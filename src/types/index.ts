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

/** Uma opção dentro de um passo de clarificação (Human-in-the-Loop). */
export interface InterruptOption {
  id: string;
  label: string;
}

/** Informação de um interrupt AG-UI — pausou o grafo à espera de escolha. */
export interface InterruptInfo {
  question: string;
  options: InterruptOption[];
  /** Preenchido quando o utilizador já escolheu; mostra a seleção em destaque. */
  selected?: string;
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
  /** preenchido quando o backend emite um evento INTERRUPT (clarificação) */
  interrupt?: InterruptInfo;
  /** pergunta que originou esta resposta (usado para enviar feedback) */
  question?: string;
  /** voto de feedback do utilizador nesta mensagem */
  feedback?: 'up' | 'down';
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
  /** chamado quando o backend emite um evento INTERRUPT (Human-in-the-Loop) */
  onInterrupt?: (info: InterruptInfo) => void;
}

export interface SendResult {
  text: string;
  raw?: unknown;
}
