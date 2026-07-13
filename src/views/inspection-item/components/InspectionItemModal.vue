<template>
  <a-modal
    :title="title"
    :visible.sync="visible"
    :width="600"
    :confirm-loading="isSubmitting"
    @before-ok="handleSubmit"
    @cancel="close"
  >
    <GiForm v-model="form" :columns="columns" size="medium" />
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { createInspectionItem, getInspectionItemDetail, updateInspectionItem } from '@/apis/inspection-item/inspection-item'

defineOptions({ name: 'InspectionItemModal' })

const editId = ref<string | null>(null)
const title = ref('新增巡检项')
const isSubmitting = ref<boolean>(false)
const emit = defineEmits(['submitted'])
const visible = ref(false)
const form = ref({})

const typeOptions = [
  { label: '普通检查', value: 1 },
  { label: '故障检查', value: 2 },
  { label: '安全检查', value: 3 },
  { label: '其他检查', value: 4 },
]

const columns: any[] = reactive([
  {
    type: 'input',
    label: '巡检项名称',
    field: 'name',
    span: { xs: 24, sm: 24, xxl: 24 },
    props: {
      placeholder: '请输入巡检项名称',
    },
  },
  {
    type: 'select',
    label: '类型',
    field: 'type',
    span: { xs: 24, sm: 24, xxl: 24 },
    props: {
      placeholder: '请选择类型',
      options: typeOptions,
    },
  },
  {
    type: 'input',
    label: '描述',
    field: 'description',
    span: { xs: 24, sm: 24, xxl: 24 },
    props: {
      placeholder: '请输入描述',
      type: 'textarea',
    },
  },
  {
    type: 'input',
    label: '备注',
    field: 'remark',
    span: { xs: 24, sm: 24, xxl: 24 },
    props: {
      placeholder: '请输入备注',
      type: 'textarea',
    },
  },
])

const onOpen = async (data?: any) => {
  if (data?.id) {
    editId.value = data.id
    title.value = '编辑巡检项'
    const detail = await getInspectionItemDetail(data.id)
    if (detail?.success) {
      form.value = detail.data
    }
  } else {
    editId.value = null
    title.value = '新增巡检项'
    form.value = {}
  }
  visible.value = true
}

async function handleSubmit() {
  isSubmitting.value = true
  try {
    if (editId.value) {
      await updateInspectionItem(form.value, editId.value)
    } else {
      await createInspectionItem(form.value)
    }
    emit('submitted')
    close()
  } catch (_) {
    return false
  } finally {
    isSubmitting.value = false
  }
}

function close() {
  form.value = {}
  visible.value = false
}

defineExpose({ onOpen })
</script>
