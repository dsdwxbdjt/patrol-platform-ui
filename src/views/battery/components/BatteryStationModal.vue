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
import { addBatteryStation, getBatteryStationDetail, editBatteryStation } from '@/apis/battery/battery-info'
import { stationList } from '@/apis/station/station-info'

defineOptions({ name: 'BatteryStationModal' })

const editId = ref<string | null>(null)
const title = ref('新增电池柜')
const stationOptions = ref<any[]>([])
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
  {
    type: 'select',
    label: '所属站点',
    field: 'stationsId',
    span: { xs: 24, sm: 12, xxl: 12 },
    props: {
      placeholder: '请选择所属站点',
      options: stationOptions,
      allowSearch: true,
      filterOption: (inputValue: string, option: any) => {
        return option.label.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
      },
    },
  },
  { type: 'input', label: '电池柜名称', field: 'name', span: { xs: 24, sm: 12, xxl: 12 }, props: { placeholder: '请输入电池柜名称' } },
  { type: 'input', label: '设备编号', field: 'deviceSn', span: { xs: 24, sm: 12, xxl: 12 }, props: { placeholder: '请输入设备编号' } },
  { type: 'select', label: '状态', field: 'status', span: { xs: 24, sm: 12, xxl: 12 }, props: { placeholder: '请选择状态', options: cabinetStatusOptions } },
  { type: 'input-number', label: '经度', field: 'lng', span: { xs: 24, sm: 12, xxl: 12 }, props: { placeholder: '请输入经度', precision: 6 } },
  { type: 'input-number', label: '纬度', field: 'lat', span: { xs: 24, sm: 12, xxl: 12 }, props: { placeholder: '请输入纬度', precision: 6 } },
  { type: 'textarea', label: '备注', field: 'remark', span: { xs: 24, sm: 24, xxl: 24 }, props: { placeholder: '请输入备注', maxLength: 200, showWordLimit: true } },
])

async function getStationOptions() {
  try {
    const res = await stationList({ page: 1, pageSize: 999 })
    if (res?.success && res.data) {
      stationOptions.value = res.data.map((item: any) => ({
        label: item.name,
        value: item.id,
      }))
    }
  } catch (e) {
    console.error('获取站点列表失败', e)
  }
}

const onOpen = async (data?: any) => {
  await getStationOptions()
  if (data?.id) {
    editId.value = data.id
    title.value = '编辑电池柜'
    const detail = await getBatteryStationDetail(data.id)
    if (detail?.success) {
      form.value = {
        name: detail.data.name,
        deviceSn: detail.data.deviceSn,
        status: detail.data.status,
        lat: detail.data.lat,
        lng: detail.data.lng,
        remark: detail.data.remark,
        stationsId: detail.data.stationsId,
      }
    }
  } else {
    editId.value = null
    title.value = '新增电池柜'
    form.value = {}
  }
  visible.value = true
}

async function handleSubmit() {
  isSubmitting.value = true
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

function close() {
  form.value = {}
  visible.value = false
}

defineExpose({ onOpen })
</script>
