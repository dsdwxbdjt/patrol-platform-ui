<template>
  <a-modal
    :title
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
import { addBatteryBox, getBatteryBoxDetail, editBatteryBox } from '@/apis/battery/battery-info'

defineOptions({ name: 'BatteryBoxModal' })

const editId = ref<string | null>(null)
const title = ref('新增电池仓')
const emit = defineEmits(['submitted'])
const visible = ref(false)
const form = ref({})
const isSubmitting = ref<boolean>(false)
const cabinetId = ref<string>('')

const boxStatusOptions = [
  { label: '空仓无电池', value: 'EMPTY' },
  { label: '满电池', value: 'FULL_BATTERY' },
  { label: '仓位故障', value: 'FAULT' },
  { label: '充电中', value: 'CHARGEING' },
  { label: '锁定禁用', value: 'LOCKED' },
]

const columns: any[] = reactive([
  { type: 'input', label: '仓号', field: 'boxNo', span: { xs: 24, sm: 24, xxl: 24 }, props: { placeholder: '请输入仓号' } },
  { type: 'input-number', label: '电量(%)', field: 'powerLevel', span: { xs: 24, sm: 24, xxl: 24 }, props: { placeholder: '请输入电量%)' } },
  { type: 'select', label: '状态', field: 'status', span: { xs: 24, sm: 24, xxl: 24 }, props: { placeholder: '请选择状态', options: boxStatusOptions } },
  { type: 'textarea', label: '备注', field: 'remark', span: { xs: 24, sm: 24, xxl: 24 }, props: { placeholder: '请输入备注', maxLength: 200, showWordLimit: true } },
])

const onOpen = async (cabinetIdVal: string, data?: any) => {
  cabinetId.value = cabinetIdVal
  if (data?.id) {
    editId.value = data.id
    title.value = '编辑电池仓'
    const detail = await getBatteryBoxDetail(data.id)
    if (detail?.success) {
      form.value = {
        boxNo: detail.data.boxNo,
        powerLevel: detail.data.powerLevel,
        status: detail.data.status,
        remark: detail.data.remark,
        batteryCabinetId: cabinetIdVal,
      }
    }
  } else {
    editId.value = null
    title.value = '新增电池仓'
    form.value = {
      batteryCabinetId: cabinetIdVal,
    }
  }
  visible.value = true
}

async function handleSubmit() {
  isSubmitting.value = true
  try {
    if (editId.value) {
      await editBatteryBox(form.value, editId.value)
    } else {
      await addBatteryBox(form.value)
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
