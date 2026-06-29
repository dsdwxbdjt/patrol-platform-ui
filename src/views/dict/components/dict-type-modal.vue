<template>
  <a-modal v-model:visible="visible" @before-ok="handleOk" @cancel="handleCancel">
    <template #title>
      <span>{{ title }}</span>
    </template>
    <GiForm v-model="form" ref="formRef" :columns="columns" size="medium" />
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { createDictType, type DictTypeCreateInput, getDictTypeDetail, updateDictType } from '@/apis'

const visible = ref(false)
const editFlag = ref(false)
const form = ref<DictTypeCreateInput>({
  id: '',
  name: '',
  code: '',
  remark: '',
})
const title = ref('新增字典类型')
const formRef = ref<any>()

const columns = reactive<any[]>([
  {
    type: 'input',
    label: '字典类型名称',
    field: 'name',
    required: true,
    span: { xs: 24, sm: 24, xxl: 24 },
  },
  {
    type: 'input',
    label: '字典类型编码',
    field: 'code',
    required: true,
    span: { xs: 24, sm: 24, xxl: 24 },
  },
  {
    type: 'input',
    label: '字典类型描述',
    field: 'description',
    span: { xs: 24, sm: 24, xxl: 24 },
  }
])
async function handleOk() {
  const isInvalid = await formRef.value.formRef?.validate()
  if (isInvalid) {
    return false
  }
  if (editFlag.value) {
    const res = await updateDictType(form.value as DictTypeCreateInput, form.value.id || '')
    if (res.success) {
      emit('hasSubmitted')
      return true
    }
  } else {
    const res = await createDictType(form.value as DictTypeCreateInput)
    if (res.success) {
      emit('hasSubmitted')
      return true
    }
  }
}

async function open(data?: any) {
  editFlag.value = data ? true : false
  visible.value = true
  if (data) {
    const res = await getDictTypeDetail(data.id)
    console.log(res);
    if (res && res.success) {
      form.value = res.data || {}
    }
  }
}

function handleCancel() {
  visible.value = false
}

const emit = defineEmits(['hasSubmitted'])
defineExpose({ open })
</script>
