<template>
  <a-modal
    :title
    :visible.sync="visible"
    :width="600"
    :confirm-loading="isSubmitting"
    @before-ok="handleSubmit"
    @cancel="close"
  >
    <GiForm v-model="form" :columns="columns" size="medium">
      <template #stationsId>
        <StationSelect v-model="form.stationsId" @select-station="handleSelectSite" :inputStation="inputStation" :multiple="false" />
      </template>
      <template #location>
        <MapSelect v-model="address" />
      </template>
    </GiForm>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { addBatteryStation, getBatteryStationDetail, editBatteryStation } from '@/apis/battery/battery-info'

defineOptions({ name: 'BatteryStationModal' })

const editId = ref<string | null>(null)
const title = ref('新增电池柜')
const address = ref('')
const inputStation = ref()
const emit = defineEmits(['submitted'])
const visible = ref(false)
const form = ref({})
const isSubmitting = ref<boolean>(false)

const cabinetStatusOptions = [
  { label: '正常', value: 'NORMAL' },
  { label: '异常', value: 'ABNORMAL' },
  { label: '离线', value: 'OFFLINE' },
]

const columns: any[] = reactive([
  { type: 'input', label: '所属站点', field: 'stationsId', span: { xs: 24, sm: 24, xxl: 24 } },
  { type: 'input', label: '电池柜名称', field: 'name', span: { xs: 24, sm: 12, xxl: 12 }, props: { placeholder: '请输入电池柜名称' } },
  { type: 'input', label: '设备编号', field: 'deviceSn', span: { xs: 24, sm: 12, xxl: 12 }, props: { placeholder: '请输入设备编号' } },
  { type: 'select', label: '状态', field: 'status', span: { xs: 24, sm: 12, xxl: 12 }, props: { placeholder: '请选择状态', options: cabinetStatusOptions } },
  { type: 'input', label: '经纬度', field: 'location', span: { xs: 24, sm: 24, xxl: 24 } },
  { type: 'textarea', label: '备注', field: 'remark', span: { xs: 24, sm: 24, xxl: 24 }, props: { placeholder: '请输入备注', maxLength: 200, showWordLimit: true } },
])

const onOpen = async (data?: any) => {
  if (data?.id) {
    editId.value = data.id
    title.value = '编辑电池柜'
    const detail = await getBatteryStationDetail(data.id)
    if (detail?.success) {
      inputStation.value = [detail.data.stations]
      form.value = {
        name: detail.data.name,
        deviceSn: detail.data.deviceSn,
        status: detail.data.status,
        remark: detail.data.remark,
        stationsId: detail.data.stationsId,
      }
      if (detail.data.lat && detail.data.lng) {
        address.value = detail.data.lat + ',' + detail.data.lng
      } else {
        address.value = ''
      }
    }
  } else {
    editId.value = null
    title.value = '新增电池柜'
    form.value = {}
    address.value = ''
  }
  visible.value = true
}

async function handleSubmit() {
  isSubmitting.value = true
  if (address.value) {
    form.value.lat = Number(address.value.split(',')[0])
    form.value.lng = Number(address.value.split(',')[1])
  }
  try {
    if (editId.value) {
      await editBatteryStation(form.value, editId.value)
    } else {
      await addBatteryStation(form.value)
    }
    emit('submitted')
    close()
  } catch (_) {
    return false
  } finally {
    isSubmitting.value = false
  }
}

function handleSelectSite(site: any) {
  form.value.stationsId = site[0].id
}

function close() {
  form.value = {}
  address.value = ''
  visible.value = false
  editId.value = null
  title.value = '新增电池柜'
}

defineExpose({ onOpen })
</script>
