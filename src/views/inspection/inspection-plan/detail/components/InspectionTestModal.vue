<template>
  <a-modal
    title="巡检任务项详情"
    :visible.sync="visible"
    :width="800"
    @cancel="handleCancel"
    @before-ok="handleOk"
    :maskClosable="false"
  >
    <GiForm v-model="formData" ref="formRef" :columns="columns" size="medium">
      <template #checkerId>
        <UserSelect modelType="input" @select-user="handleChangeCheckerId" :inputUsers="[userInfo]" />
      </template>
      <template #type>
        <GiCellTag :value="formData.type" :dict="check_type" />
      </template>
      <template #fileId>
        <a-upload
          action="/dev-api/api/file/upload"
          :auto-upload="true"
          list-type="picture-card"
          v-model:file-list="fileList"
          image-preview
          :headers="uploadHeaders"
        >
          <a-button type="primary">选择图片</a-button>
        </a-upload>
      </template>
      <template #aiReport>
        <a-button :loading="isConnecting" @click="handleAiReport" type="primary">生成报告</a-button>
      </template>
    </GiForm>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useUserStore } from '@/stores'
import { useDict } from '@/hooks/app/useDict'
import dayjs from 'dayjs'
import { updateInspectionTaskItemResult } from '@/apis'
import { Message } from '@arco-design/web-vue'
import { getToken } from '@/utils/auth'


const dataForm = ref<any>()
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
const fileList = ref<any[]>([])
const visible = ref(false)
const formData = ref<any>({})
const uploadHeaders = computed(() => {
  return {
    'Authorization': 'Bearer ' + localStorage.getItem('token') || ''
  }
})
const { level_option, check_type, Inspection_result } = useDict('level_option', 'check_type', 'Inspection_result')

const columns = computed(() => {
  const baseColumns: any[] = [
    { type: 'group-title',label: '巡检项信息',span: { xs: 24, sm: 24, xxl: 24 } },
    { type: 'text', label: '巡检任务项名称:', field: 'name', span: { xs: 24, sm: 24, xxl: 24 } },
    { type: 'text', label: '巡检任务项描述:', field: 'description', span: { xs: 24, sm: 24, xxl: 24 } },
    { type: 'text', label: '巡检任务项类型:', field: 'type', span: { xs: 12, sm: 12, xxl: 12 } },
    { type: 'text', label: '巡检任务项备注:', field: 'remark', span: { xs: 12, sm: 12, xxl: 12 } },
    { type: 'group-title', label: '巡检任务信息', span: { xs: 24, sm: 24, xxl: 24 } },
    { type: 'select', label: '巡检结果:', field: 'result', span: { xs: 12, sm: 12, xxl: 12 }, props: { options: Inspection_result } },
    { type: 'select', label: '巡检人:', field: 'checkerId', span: { xs: 12, sm: 12, xxl: 12 } },
    { type: 'input', label: '巡检照片:', field: 'fileId', span: { xs: 24, sm: 24, xxl: 24 } },
  ]

  if (formData.value.result === 3) {
    baseColumns.push(
      { type: 'select', label: 'AI生成报告:', field: 'aiReport', span: { xs: 24, sm: 24, xxl: 24 } },
      { type: 'select', label: '隐患类别:', field: 'level', span: { xs: 24, sm: 12, xxl: 12 }, props: { placeholder: '请选择隐患类别', options: level_option } },
      { type: 'textarea', label: '隐患描述:', field: 'inspectionDescription', span: { xs: 24, sm: 24, xxl: 24 }, props: { placeholder: '请输入隐患描述',autoSize: true,showLimit: false } }
    )
  }
  return baseColumns
})
const emit = defineEmits(['submitted'])

watch(
  () => formData.value.result,
  (newResult) => {
    if (newResult !== 3) {
      formData.value.level = ''
      formData.value.inspectionDescription = ''
    }
  }
)
const isConnecting = ref(false)
function handleAiReport() {
  const content = dataForm.value.inspectionItem.description
  if (!content || !fileList.value.length) {
    Message.error('请上传巡检照片！')
    return
  }
  const userMsg = { role: 'user', content, ts: Date.now(), imageUrl: fileList.value[0].url }
  const assistantMsg = { role: 'assistant', content: '', ts: Date.now() + 1 }
  const messages = [userMsg, assistantMsg]
  const sentImageUrl = fileList.value[0].response.data.url
  console.log(sentImageUrl);
  isConnecting.value = true
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
  }
  const languageFramework = `
  请根据图片生成巡检描述，并严格遵循以下规则：
  
  1. 仅根据图片内容以及巡检项「${content}」描述隐患，不得编造不存在的问题。
  2. 巡检描述使用专业、简洁的语言；不要出现空行,但是不同模块要换行；不要出现类似**、##等格式的区分线或标题。
  3. 根据图片中的隐患数量判断隐患等级：
     - 1 个隐患：GENERAL
     - 2 个隐患：SERIOUS
     - 3 个及以上隐患：CRITICAL
     - 无论有几个消防隐患：CRITICAL
  4. 回答最后必须单独输出一行，格式固定为：
  
  #HAZARD_LEVEL:GENERAL
  
  其中 GENERAL 根据实际情况替换为 GENERAL、SERIOUS 或 CRITICAL。
  除这一行外，不允许输出任何其它等级说明，也不要修改该格式。
  重要规则：
    1. 只检查当前巡检项涉及的设备和问题。
    2. 图片中未出现的设备，不得判断为缺失或故障。
    3. 不得因为未看到某个设施而认定该设施不存在。
    4. 不允许扩大检查范围。
  `
  fetch('/dev-api/api/ai/chat',{
    headers: headers,
    method: 'POST',
    body: JSON.stringify({
      message: languageFramework,
      imageUrl: sentImageUrl,
      history: messages
        .filter(item => item.content)
        .map(item => ({
          role: item.role,
          content: item.content,
        })),
    }),
  }).then(async(res) => {
    const reader = res.body?.getReader()
    if (!reader) {
      Message.error('生成失败')
      isConnecting.value = false
      return
    }
    const decoder = new TextDecoder()
    const read = async () => {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          const HAZARD_LEVEL_DICT = {
            GENERAL: 1,
            SERIOUS: 2,
            CRITICAL: 3,
          }
          formData.value.level = HAZARD_LEVEL_DICT[assistantMsg.content.split('\n')[assistantMsg.content.split('\n').length - 1].split(':')[1]] || null
          break
        }
        const text = decoder.decode(value, { stream: true })
        assistantMsg.content += text
        formData.value.inspectionDescription = assistantMsg.content.trim().split('\n').slice(0, -1).join('\n')
      }
      isConnecting.value = false
    }
    await read()
  })
}

function handleChangeCheckerId(value: any) {
  formData.value.checkerId = value[0].id
}

function handleCancel() {
  formData.value = {}
  fileList.value = []
  visible.value = false
}

function openModal(detail: any) {
  dataForm.value = detail
  const id = detail.id || ''
  formData.value = { ...detail, ...detail.inspectionItem || {}, id }
  if (!detail.checkAt) {
    formData.value.checkerId = userInfo.value.id || null
    formData.value.result = formData.value.result
  } else {
    detail.files.length && (fileList.value = detail.files)
  }
  visible.value = true
}

function handleOk() {
  const fileListIds = [] as any[]
  fileList.value.forEach((item: any) => {
    if (item.response) {
      fileListIds.push(item.response.data.id)
    } else {
      fileListIds.push(item.id)
    }
  })
  const params = {
    taskId: formData.value.taskId,
    inspectionItemId: formData.value.inspectionItem.id,
    result: formData.value.result,
    checkerId: formData.value.checkerId,
    checkAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    fileIds: fileListIds.join(','),
    level: formData.value.level,
    inspectionDescription: formData.value.inspectionDescription,
    stationId: dataForm.value.stationId || ''
  }
  updateInspectionTaskItemResult(params, formData.value.id).then(res => {
    if (res.code === 200) {
      Message.success('更新成功')
      emit('submitted')
      handleCancel()
    }
  })
  
  return false
}

defineExpose({
  openModal
})
</script>
