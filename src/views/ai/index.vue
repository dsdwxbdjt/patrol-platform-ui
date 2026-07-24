<template>
  <GiPageLayout>
    <div ref="aiPageRef" class="ai-page">
      <a-card class="ai-card" :bordered="false">
        <template #extra>
          <a-space>
            <a-button @click="onClear" :disabled="isConnecting && !messages.length">清空</a-button>
            <a-button status="warning" @click="onStop" :disabled="!isConnecting">停止</a-button>
          </a-space>
        </template>

        <div class="chat-body">
          <div v-if="!messages.length" class="empty">
            <div class="empty-title">开始对话</div>
            <div class="empty-subtitle">输入问题后按 Enter 发送，Shift + Enter 换行</div>
          </div>
          <div v-for="(item, index) in messages" :key="`${item.ts}-${index}`" class="message-row"
            :class="item.role === 'user' ? 'is-user' : 'is-assistant'">
            <div class="bubble">
              <div class="bubble-role">
                {{ item.role === 'user' ? '你' : 'AI' }}
                <a-spin v-if="item.role === 'assistant' && isConnecting && index === messages.length - 1" size="small"
                  class="loading-spin" />
              </div>
              <img v-if="item.imageUrl" :src="item.imageUrl" class="bubble-image" />
              <div v-if="item.role === 'user'" class="bubble-content">{{ item.content }}</div>
              <div v-else class="bubble-content markdown-body" v-html="renderMarkdown(item.content)"></div>
            </div>
          </div>
        </div>

          <a-divider :margin="12" />
          <a-textarea v-model="question" placeholder="请输入问题…" :auto-size="{ minRows: 2, maxRows: 6 }"
            @keydown="onKeydown" />
          <a-upload action="/dev-api/api/file/upload" @change="handleUpload" @success="handleSuccess"
            :auto-upload="true" :headers="uploadHeaders" :max-count="1">
            <a-button type="primary">选择图片</a-button>
          </a-upload>
      </a-card>
    </div>
  </GiPageLayout>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch, computed, h } from 'vue'
import { getToken } from '@/utils/auth'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

marked.setOptions({
  highlight: (code: string, lang: string) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      }
      catch (e) { }
    }
    return code
  },
  breaks: true,
  gfm: true
})

type ChatRole = 'user' | 'assistant'
type ChatMessage = { role: ChatRole; content: string; ts: number; imageUrl?: string }

const question = ref('')
const messages = ref<ChatMessage[]>([
  // {
  //   role: 'user',
  //   content: '你好，请介绍一下Vue3的主要特性',
  //   ts: Date.now() - 30000
  // },
  // {
  //   role: 'assistant',
  //   content: '# Vue 3 主要特性\n\n## 1. Composition API\n- 更灵活的代码组织方式\n- 更好的逻辑复用\n- TypeScript 支持更好\n\n## 2. 性能提升\n- 更快的渲染速度\n- 更小的打包体积\n\n## 3. 其他特性\n- Teleport\n- Fragments\n- Suspense',
  //   ts: Date.now() - 29000
  // },
  // {
  //   role: 'user',
  //   content: '那如何使用Composition API呢？',
  //   ts: Date.now() - 10000
  // },
  // {
  //   role: 'assistant',
  //   content: '使用 Composition API 非常简单！\n\n```javascript\nimport { ref, computed, onMounted } from \'vue\'\n\nexport default {\n  setup() {\n    const count = ref(0)\n    const double = computed(() => count.value * 2)\n    \n    onMounted(() => {\n      console.log(\'组件已挂载\')\n    })\n    \n    return { count, double }\n  }\n}\n```\n\n或者使用 `<script setup>` 语法糖，更简洁！',
  //   ts: Date.now() - 9000
  // }
])
const errorText = ref('')
const isConnecting = ref(false)
const aiPageRef = ref<HTMLElement | null>(null)
const uploadHeaders = computed(() => {
  return {
    'Authorization': 'Bearer ' + localStorage.getItem('token') || ''
  }
})

let eventSource: EventSource | null = null

const renderMarkdown = (content: string) => {
  return marked.parse(content, { async: false }) as string
}

const scrollToBottom = async () => {
  await nextTick()
  const el = aiPageRef.value
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

const imageUrl = ref('')

const handleUpload = async (_: any, currentFile: any) => {

}

const handleSuccess = (res: any) => {
  console.log(res.response.data.url);
  imageUrl.value = res.response.data.url
}

const onClear = () => {
  onStop()
  messages.value = []
  errorText.value = ''
  imageUrl.value = ''
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key !== 'Enter') return
  if (e.shiftKey) return
  e.preventDefault()
  send()
}

const send = () => {
  const content = question.value.trim()
  if (!content && !imageUrl.value) return

  errorText.value = ''
  onStop()

  const userMsg: ChatMessage = { role: 'user', content, ts: Date.now(), imageUrl: imageUrl.value }
  const assistantMsg: ChatMessage = { role: 'assistant', content: '', ts: Date.now() + 1 }
  messages.value = [...messages.value, userMsg, assistantMsg]
  question.value = ''
  const sentImageUrl = imageUrl.value
  imageUrl.value = ''

  isConnecting.value = true
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
  }

  // 用 fetch 实现 SSE，支持自定义请求头
  fetch('/dev-api/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({
      message: content,
      imageUrl: sentImageUrl,
      history: messages.value
        .filter(item => item.content)
        .slice(-5)
        .map(item => ({
          role: item.role,
          content: item.content,
        })),
    }),
    headers: headers,
  })
    .then((response) => {
      const reader = response.body?.getReader()
      if (!reader) throw new Error('流不存在')

      const decoder = new TextDecoder()
      const read = async () => {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const text = decoder.decode(value, { stream: true })
          assistantMsg.content += text
          messages.value = [
            ...messages.value.slice(0, -1),
            assistantMsg,
          ]
        }

        isConnecting.value = false
      }

      read().catch(() => {
        errorText.value = '连接异常'
        isConnecting.value = false
      })
    })
    .catch(() => {
      errorText.value = '请求失败'
      isConnecting.value = false
    })
}

onBeforeUnmount(() => onStop())
</script>

<style scoped lang="scss">
:deep(.markdown-body) {
  line-height: 1.6;
  word-break: break-word;

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 16px;
    margin-bottom: 8px;
    font-weight: 600;
    line-height: 1.25;
  }

  h1 {
    font-size: 2em;
    border-bottom: 1px solid var(--color-border-2);
    padding-bottom: 0.3em;
  }

  h2 {
    font-size: 1.5em;
    border-bottom: 1px solid var(--color-border-2);
    padding-bottom: 0.3em;
  }

  h3 {
    font-size: 1.25em;
  }

  h4 {
    font-size: 1em;
  }

  p {
    margin-top: 0;
    margin-bottom: 10px;
  }

  ul,
  ol {
    margin-top: 0;
    margin-bottom: 10px;
    padding-left: 2em;
  }

  li {
    margin-bottom: 4px;
  }

  code {
    background: var(--color-fill-3);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.9em;
  }

  pre {
    margin-top: 0;
    margin-bottom: 10px;
    padding: 12px;
    background: var(--color-fill-2);
    border-radius: 6px;
    overflow-x: auto;

    code {
      background: transparent;
      padding: 0;
    }
  }

  blockquote {
    margin: 0;
    padding: 0 1em;
    color: var(--color-text-2);
    border-left: 0.25em solid var(--color-border-2);
  }

  table {
    border-spacing: 0;
    border-collapse: collapse;
    margin-top: 0;
    margin-bottom: 10px;
    width: 100%;
  }

  th,
  td {
    padding: 6px 12px;
    border: 1px solid var(--color-border-2);
  }

  th {
    background: var(--color-fill-2);
    font-weight: 600;
  }

  a {
    color: rgb(var(--primary-6));
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
}

.ai-page {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  height: 100%;
}

.ai-card {
  width: 100%;
  height: 100%;
}

.chat-body {
  padding: 12px;
  border-radius: 8px;
}

.empty {
  min-height: 320px;
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
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
}

.message-row.is-user .bubble {
  background: rgba(var(--primary-6), 0.08);
  width: 70%;
}

.bubble-role {
  font-size: 12px;
  color: var(--color-text-3);
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.loading-spin {
  margin-left: 4px;
}

.bubble-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 6px;
  margin-bottom: 8px;
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

:deep(.arco-card-header) {
  padding: 12px;
}

:deep(.arco-card-body) {
  padding: 12px;
}
:deep(.gi-page-layout__body) {
  position: relative;
}
</style>
