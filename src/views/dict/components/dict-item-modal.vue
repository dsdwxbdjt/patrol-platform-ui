<template>
  <a-modal
    title="新增字典项"
    :visible.sync="visible"
    @before-ok="handleOk"
    @cancel="handleCancel"
    width="500px"
  >
    <GiForm :columns="columns" v-model="form" ref="formRef" />
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const visible = ref(false)
import { createDictItem, updateDictItem, getDictItemDetail } from '@/apis'

const props = defineProps({
  dictTypeId: {
    type: String,
    default: ''
  }
})

const formRef = ref<any>()


const form = ref<any>({
  label: '',
  value: '',
  remark: '',
  tags: ''
})
const dictTagOptions = [
  { label: '普通', value: 'primary' },
  { label: '成功', value: 'success' },
  { label: '失败', value: 'error' },
  { label: '警告', value: 'warning' },
  { label: '信息', value: 'default' },
]
const columns = reactive<any[]>([
  {
    type: 'input',
    label: '字典名称',
    field: 'label',
    required: true,
    span: { xs: 24, sm: 24, xxl: 24 },
  },
  {
    type: 'input',
    label: '字典值',
    field: 'value',
    required: true,
    span: { xs: 24, sm: 24, xxl: 24 },
  },
  {
    type: 'input',
    label: '字典描述',
    field: 'remark',
    span: { xs: 24, sm: 24, xxl: 24 },
  },
  {
    type: 'select',
    label: '标签',
    field: 'extra',
    span: { xs: 24, sm: 24, xxl: 24 },
    props: {
      placeholder: '请选择标签',
      options: dictTagOptions,
    },
  },
])

const isEditFlag = ref(false)
async function openModal(data? :any) {
  visible.value = true
  isEditFlag.value = data ? true : false
  if (data) {
    const res = await getDictItemDetail(data.id)
    console.log(res);
    if (res.success) {
      form.value = res.data
    }
  } else {
    form.value = {
      label: '',
      value: '',
      remark: '',
      tags: ''
    }
  }
}

function handleCancel() {
  visible.value = false
}

async function handleOk() {
  const isInvalid = await formRef.value.formRef?.validate()
  if (isInvalid) {
    return false
  }
  let res: any
  if (isEditFlag.value) {
    res = await updateDictItem(form.value, form.value.id)
  } else {
    res = await createDictItem({ ...form.value, dictTypeId: props.dictTypeId })
  }
  if (res.success) {
    emit('refresh')
    handleCancel()
    return true
  }
}
defineExpose({ openModal })
const emit = defineEmits(['refresh'])
</script>
