# Python AI Chat UI

Chat UI em **React Native (Expo)** que se conecta à sua aplicação **Python**.

## Recursos

- Interface de chat (mensagens do usuário e do assistente)
- Comunicação com backend Python via **REST** e **streaming SSE** (chaveável)
- **Histórico de conversas** persistido localmente (AsyncStorage)
- **Upload de arquivos e imagens** (galeria, câmera, documento)
- Sidebar/drawer para alternar entre conversas
- Tema escuro nativo
- Cancelamento de requisições em andamento (botão Parar)
- TypeScript + Expo Router

## Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo Go no celular (iOS/Android) **ou** simulador

## Instalação

```bash
cd react-chat-ui
npm install
```

## Configuração

Copie `.env.example` para `.env` e configure a URL do seu backend Python:

```bash
cp .env.example .env
```

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.0.10:8000
EXPO_PUBLIC_STREAMING_ENABLED=true
```

> ⚠️ Para testar em dispositivo físico, use o IP da sua máquina na rede local (não `localhost`).

Você também pode ajustar valores padrão em `app.json` no campo `extra`.

## Rodando

```bash
npm start              # menu interativo
npm run ios            # simulador iOS
npm run android        # emulador Android
npm run web            # navegador
```

## Contrato esperado do backend Python

A UI espera estes endpoints (ajustáveis em `src/api/config.ts`):

### `POST /chat` — resposta única (REST)

Payload:

```json
{
  "conversationId": "uuid",
  "messages": [
    { "role": "user", "content": "Olá" }
  ],
  "attachments": [
    { "id": "uuid", "name": "foto.jpg", "uri": "...", "mimeType": "image/jpeg" }
  ]
}
```

Resposta:

```json
{ "reply": "Olá! Como posso ajudar?" }
```

(Também aceita `content` ou `message` como campo de resposta.)

### `POST /chat/stream` — Server-Sent Events

Mesmo payload de `/chat`. Resposta com `Content-Type: text/event-stream`,
streaming de eventos:

```
data: {"delta": "Olá"}

data: {"delta": "!"}

data: [DONE]

```

### `POST /upload` — multipart (opcional)

Para anexos enviados separadamente do payload de chat. Retorna `{ "id": "...", "url": "..." }`.

## Exemplo mínimo de servidor Python (FastAPI)

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import asyncio, json

app = FastAPI()

class Msg(BaseModel):
    role: str
    content: str

class ChatBody(BaseModel):
    conversationId: str
    messages: list[Msg]
    attachments: list[dict] | None = None

@app.post("/chat")
def chat(body: ChatBody):
    user_text = body.messages[-1].content
    return {"reply": f"Eco: {user_text}"}

@app.post("/chat/stream")
async def chat_stream(body: ChatBody):
    async def gen():
        text = f"Eco: {body.messages[-1].content}"
        for ch in text:
            yield f"data: {json.dumps({'delta': ch})}\n\n"
            await asyncio.sleep(0.02)
        yield "data: [DONE]\n\n"
    return StreamingResponse(gen(), media_type="text/event-stream")
```

Rode com:

```bash
uvicorn server:app --host 0.0.0.0 --port 8000
```

## Estrutura

```
react-chat-ui/
├── app/                       # rotas (expo-router)
│   ├── _layout.tsx
│   └── index.tsx
├── src/
│   ├── api/
│   │   ├── client.ts          # sendChatRest, sendChatStream, uploadFile
│   │   └── config.ts          # URL, endpoints, flags
│   ├── components/
│   │   ├── AttachmentPicker.tsx
│   │   ├── ChatInput.tsx
│   │   ├── ConversationDrawer.tsx
│   │   └── MessageBubble.tsx
│   ├── context/
│   │   └── ChatContext.tsx    # estado global do chat
│   ├── screens/
│   │   └── ChatScreen.tsx
│   ├── storage/
│   │   └── conversations.ts   # AsyncStorage
│   ├── theme/
│   │   └── colors.ts
│   └── types/
│       └── index.ts
├── app.json
├── babel.config.js
├── package.json
└── tsconfig.json
```

## Próximos passos sugeridos

- Renderização de Markdown (`react-native-markdown-display`)
- Syntax highlighting (`react-native-syntax-highlighter`)
- Upload prévio via `/upload` para arquivos grandes (em vez de inline base64)
- Tema claro
- Autenticação (Bearer token via header)
