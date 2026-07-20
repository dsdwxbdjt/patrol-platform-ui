<template>
  <a-modal
    title="巡检任务项详情"
    :visible.sync="visible"
    :width="800"
    @cancel="handleCancel"
    @before-ok="handleOk"
  >
    <GiForm v-model="formData" ref="formRef" :columns="columns" size="medium">
      <template #checkerId>
        <UserSelect modelType="input" @select-user="handleChangeCheckerId" :inputUsers="[userInfo]" />
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
    </GiForm>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useUserStore } from '@/stores'
import { useDict } from '@/hooks/app/useDict'
import dayjs from 'dayjs'
import { updateInspectionTaskItemResult } from '@/apis'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
const fileList = ref<any[]>([])
const visible = ref(false)
const formData = ref({})
const uploadHeaders = computed(() => {
  return {
    'Authorization': 'Bearer ' + localStorage.getItem('token') || ''
  }
})
const { level_option } = useDict('level_option')
const resultOptions = ref([
  {
    label: '待处理',
    value: 1
  },
  {
    label: '巡检通过',
    value: 2
  },
  {
    label: '巡检未通过',
    value: 3
  },
])

const columns = computed(() => {
  const baseColumns: any[] = [
    { type: 'group-title',label: '巡检项信息',span: { xs: 24, sm: 24, xxl: 24 } },
    { type: 'text', label: '巡检任务项名称:', field: 'name', span: { xs: 24, sm: 24, xxl: 24 } },
    { type: 'text', label: '巡检任务项描述:', field: 'description', span: { xs: 24, sm: 24, xxl: 24 } },
    { type: 'text', label: '巡检任务项类型:', field: 'type', span: { xs: 12, sm: 12, xxl: 12 } },
    { type: 'text', label: '巡检任务项备注:', field: 'remark', span: { xs: 12, sm: 12, xxl: 12 } },
    { type: 'group-title', label: '巡检任务信息', span: { xs: 24, sm: 24, xxl: 24 } },
    { type: 'select', label: '巡检结果:', field: 'result', span: { xs: 12, sm: 12, xxl: 12 }, props: { options: resultOptions } },
    { type: 'select', label: '巡检人:', field: 'checkerId', span: { xs: 12, sm: 12, xxl: 12 } },
    { type: 'input', label: '巡检照片:', field: 'fileId', span: { xs: 24, sm: 24, xxl: 24 } },
  ]

  if (formData.value.result === '3') {
    baseColumns.push(
      { type: 'select', label: '隐患类别:', field: 'level', span: { xs: 24, sm: 12, xxl: 12 }, props: { placeholder: '请选择隐患类别', options: level_option } },
      { type: 'textarea', label: '隐患描述:', field: 'inspectionDescription', span: { xs: 24, sm: 24, xxl: 24 }, props: { placeholder: '请输入隐患描述' } }
    )
  }

  return baseColumns
})

watch(
  () => formData.value.result,
  (newResult) => {
    if (newResult !== '3') {
      formData.value.level = ''
      formData.value.inspectionDescription = ''
    }
  }
)

function handleChangeCheckerId(value: any) {
  console.log(value[0]);
  formData.value.checkerId = value[0].id
}

function handleCancel() {
  formData.value = {}
  fileList.value = []
  visible.value = false
}

function openModal(detail: any) {
  const id = detail.id || ''
  formData.value = { ...detail, ...detail.inspectionItem || {}, id }
  if (!detail.checkAt) {
    formData.value.checkerId = userInfo.value.id || null
    formData.value.result = String(formData.value.result)
  } else {
    detail.files.length && (fileList.value = detail.files)
  }
  visible.value = true
}

function handleOk() {
  const fileListIds = [] as any[]
  console.log(fileList.value);
  // return
  
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
    fileIds: fileListIds.join(',')
  }
  updateInspectionTaskItemResult(params, formData.value.id).then(res => {
    if (res.code === 200) {
      console.log(res);
    }
  })
  
  return false
}

defineExpose({
  openModal
})
</script>
