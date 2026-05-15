<template>
  <GiPageLayout>
    <div class="ai-page">
      <a-card class="ai-card" :bordered="false">
        <template #title>AI 助手</template>
        <template #extra>
          <a-space>
            <a-button @click="onClear" :disabled="isConnecting && !messages.length">清空</a-button>
            <a-button status="warning" @click="onStop" :disabled="!isConnecting">停止</a-button>
          </a-space>
        </template>

        <div ref="chatBodyRef" class="chat-body">
          <div v-if="!messages.length" class="empty">
            <div class="empty-title">开始对话</div>
            <div class="empty-subtitle">输入问题后按 Enter 发送，Shift + Enter 换行</div>
          </div>
          <div
            v-for="(item, index) in messages"
            :key="`${item.ts}-${index}`"
            class="message-row"
            :class="item.role === 'user' ? 'is-user' : 'is-assistant'"
          >
            <div class="bubble">
              <div class="bubble-role">{{ item.role === 'user' ? '你' : 'AI' }}</div>
              <div class="bubble-content">{{ item.content }}</div>
            </div>
          </div>
        </div>

        <a-divider :margin="12" />

        <a-textarea
          v-model="question"
          placeholder="请输入问题…"
          :auto-size="{ minRows: 2, maxRows: 6 }"
          @keydown="onKeydown"
        />
      </a-card>
    </div>
  </GiPageLayout>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

type ChatRole = 'user' | 'assistant'
type ChatMessage = { role: ChatRole; content: string; ts: number }

const question = ref('')
const messages = ref<ChatMessage[]>([])
const errorText = ref('')
const isConnecting = ref(false)
const chatBodyRef = ref<HTMLElement | null>(null)

let eventSource: EventSource | null = null

const scrollToBottom = async () => {
  await nextTick()
  const el = chatBodyRef.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

watch(
  () => messages.value.length,
  () => scrollToBottom()
)

const onStop = () => {
  eventSource?.close()
  eventSource = null
  isConnecting.value = false
}

const onClear = () => {
  onStop()
  messages.value = []
  errorText.value = ''
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key !== 'Enter') return
  if (e.shiftKey) return
  e.preventDefault()
  send()
}

const send = () => {
  const content = question.value.trim()
  if (!content) return

  errorText.value = ''
  onStop()

  const userMsg: ChatMessage = { role: 'user', content, ts: Date.now() }
  const assistantMsg: ChatMessage = { role: 'assistant', content: '', ts: Date.now() + 1 }
  messages.value = [...messages.value, userMsg, assistantMsg]
  question.value = ''

  isConnecting.value = true
  eventSource = new EventSource(`/dev-api/api/ai/chat?message=${encodeURIComponent(content)}`)

  eventSource.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data)
      const delta = String(payload?.data?.content ?? '')
      if (!delta) return
      assistantMsg.content += delta
      messages.value = [...messages.value.slice(0, -1), assistantMsg]
    } catch {
      errorText.value = '响应解析失败'
    }
  }

  eventSource.onerror = () => {
    errorText.value = '连接异常或已断开'
    onStop()
  }
}

onBeforeUnmount(() => onStop())
</script>

<style scoped lang="scss">
.ai-page {
  padding: 16px;
  height: 100%;
}

.ai-card {
  margin: 0 auto;
}

.chat-body {
  height: calc(100vh - 360px);
  min-height: 320px;
  overflow: auto;
  padding: 12px;
  border: 1px solid var(--color-border-2);
  border-radius: 8px;
  background: var(--color-fill-1);
}

.empty {
  height: 100%;
  display: grid;
  place-content: center;
  gap: 8px;
  text-align: center;
  color: var(--color-text-3);
}

.empty-title {
  font-weight: 600;
  color: var(--color-text-1);
}

.message-row {
  display: flex;
  margin: 10px 0;
}

.message-row.is-user {
  justify-content: flex-end;
}

.message-row.is-assistant {
  justify-content: flex-start;
}

.bubble {
  max-width: min(760px, 92%);
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--color-border-2);
  background: var(--color-bg-2);
}

.message-row.is-user .bubble {
  border-color: rgba(var(--primary-6), 0.35);
  background: rgba(var(--primary-6), 0.08);
}

.bubble-role {
  font-size: 12px;
  color: var(--color-text-3);
  margin-bottom: 4px;
}

.bubble-content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
  color: var(--color-text-1);
}

.composer {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
