<template>
  <a-modal
    :title="title"
    :visible.sync="visible"
    :width="800"
    :confirm-loading="isSubmitting"
    @before-ok="handleSubmit"
    @cancel="close"
  >
    <GiForm v-model="form" :columns="columns" size="medium" />
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { createInspectionPlan } from '@/apis/inspection-plan/inspection-plan'
import { getInspectionItemList, type InspectionItemInfo } from '@/apis/inspection-item/inspection-item'
import { stationList, type StationInfo } from '@/apis/station/station-info'

defineOptions({ name: 'InspectionPlanModal' })

const title = ref('新增巡检计划')
const isSubmitting = ref<boolean>(false)
const emit = defineEmits(['submitted'])
const visible = ref(false)
const form = ref({
  name: '',
  planDate: '',
  endDate: '',
  remark: '',
  stationIds: [] as string[],
  inspectionItemIds: [] as string[],
})

const stationOptions = ref<{ label: string; value: string }[]>([])
const inspectionItemOptions = ref<{ label: string; value: string }[]>([])

const columns: any[] = reactive([
  {
    type: 'input',
    label: '计划名称',
    field: 'name',
    span: { xs: 24, sm: 24, xxl: 24 },
    props: {
      placeholder: '请输入计划名称',
    },
  },
  {
    type: 'date-picker',
    label: '计划日期',
    field: 'planDate',
    span: { xs: 24, sm: 12, xxl: 12 },
    props: {
      placeholder: '请选择计划日期',
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
    },
  },
  {
    type: 'date-picker',
    label: '结束日期',
    field: 'endDate',
    span: { xs: 24, sm: 12, xxl: 12 },
    props: {
      placeholder: '请选择结束日期',
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
    },
  },
  {
    type: 'select',
    label: '选择站点',
    field: 'stationIds',
    span: { xs: 24, sm: 24, xxl: 24 },
    props: {
      placeholder: '请选择站点',
      options: stationOptions,
      multiple: true,
    },
  },
  {
    type: 'select',
    label: '选择巡检项',
    field: 'inspectionItemIds',
    span: { xs: 24, sm: 24, xxl: 24 },
    props: {
      placeholder: '请选择巡检项',
      options: inspectionItemOptions,
      multiple: true,
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

const loadStations = async () => {
  const res = await stationList({ page: 1, size: 1000 })
  if (res?.success && res.data?.list) {
    stationOptions.value = res.data.list.map((item: StationInfo) => ({
      label: item.name,
      value: item.id,
    }))
  }
}

const loadInspectionItems = async () => {
  const res = await getInspectionItemList({ page: 1, pageSize: 1000 })
  if (res?.success && res.data?.list) {
    inspectionItemOptions.value = res.data.list.map((item: InspectionItemInfo) => ({
      label: item.name,
      value: item.id,
    }))
  }
}

const onOpen = async () => {
  title.value = '新增巡检计划'
  form.value = {
    name: '',
    planDate: '',
    endDate: '',
    remark: '',
    stationIds: [],
    inspectionItemIds: [],
  }
  visible.value = true
}

async function handleSubmit() {
  isSubmitting.value = true
  try {
    await createInspectionPlan(form.value)
    emit('submitted')
    close()
  } catch (_) {
    return false
  } finally {
    isSubmitting.value = false
  }
}

function close() {
  form.value = {
    name: '',
    planDate: '',
    endDate: '',
    remark: '',
    stationIds: [],
    inspectionItemIds: [],
  }
  visible.value = false
}

onMounted(() => {
  loadStations()
  loadInspectionItems()
})

defineExpose({ onOpen })
</script>
