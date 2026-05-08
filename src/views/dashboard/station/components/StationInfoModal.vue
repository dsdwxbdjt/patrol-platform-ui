<template>
  <a-modal 
    title="新增站点" 
    :visible.sync="visible" 
    :width="600" 
    :confirm-loading="isSubmitting"
    @before-ok="handleSubmit"
    @cancel="close">
      <GiForm v-model="form" :columns="columns" size="medium" />
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { addStation, getStationDetail, editStation } from '@/apis/station/station-info'

defineOptions({ name: 'StationInfoModal' })

const editId = ref(null)
const onOpen = async (data? :any) => {
  if (data?.id) {
    editId.value = data.id
    const detail = await getStationDetail(data.id)
    if (detail?.success) {
      form.value = detail.data
    }
  }
  visible.value = true
}
const isSubmitting = ref<boolean>(false)

const companyDict = [
  {
    label: "饿了么",
    value: "ELEME",
  },
  {
    label: "美团",
    value: "MEITUAN",
  },
  {
    label: "闪送",
    value: "SHANSONG",
  },
  {
    label: "UU跑腿",
    value: "UU_PAOTUI",
  },
  {
    label: "顺丰",
    value: "SHUNFENG",
  },
]

const emit = defineEmits(['submitted'])

const visible = ref(false)
const form = ref({})
const columns: any[] = reactive([
  { type: 'select',label: '所属公司', field: 'company', span: { xs: 24, sm: 12, xxl: 12 }, props: { placeholder: '请选择所属公司', options: companyDict } },
  { type: 'input', label: '站点名称', field: 'name', span: { xs: 24, sm: 12, xxl: 12 }, props: { placeholder: '请输入站点名称' } },
  { type: 'input', label: '所属区域', field: 'district', span: { xs: 24, sm: 12, xxl: 12 }, props: { placeholder: '请输入所属区域' } },
  { type: 'input', label: '街道', field: 'street', span: { xs: 24, sm: 12, xxl: 12 }, props: { placeholder: '请输入街道' } },
  { type: 'input', label: '详细地址', field: 'address', span: { xs: 24, sm: 24, xxl: 24 }, props: { placeholder: '请输入详细地址' } },
  { type: 'input', label: '负责人姓名', field: 'managerName', span: { xs: 24, sm: 12, xxl: 12 }, props: { placeholder: '请输入负责人姓名' } },
  { type: 'input', label: '负责人电话', field: 'managerPhone', span: { xs: 24, sm: 12, xxl: 12 }, props: { placeholder: '请输入负责人电话' } },
])

async function handleSubmit() {
  isSubmitting.value = true
  try {
    if (editId.value) {
      await editStation(form.value, editId.value)
    } else {
      await addStation(form.value)
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
