<template>
  <a-modal 
    :title 
    :visible.sync="visible" 
    :width="600" 
    :confirm-loading="isSubmitting"
    @before-ok="handleSubmit"
    @cancel="close">
      <GiForm v-model="form" :columns="columns" size="medium">
        <template #location>
          <MapSelect v-model="address" />
        </template>
      </GiForm>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { addStation, getStationDetail, editStation } from '@/apis/station/station-info'
import { getRegionTree } from '@/apis'


defineOptions({ name: 'StationInfoModal' })

const address = ref('')
const editId = ref(null)
const title = ref('新增站点')
const regionTree = ref<any[]>([])
const onOpen = async (data? :any) => {
  await getRegionTreeData()
  if (data?.id) {
    editId.value = data.id
    title.value = '编辑站点'
    const detail = await getStationDetail(data.id)
    if (detail?.success) {
      form.value = detail.data
      if (detail.data.lat && detail.data.lng) {
        address.value = detail.data.lat + ',' + detail.data.lng
      } else {
        address.value = ''
      }
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
  { type: 'input', label: '详细地址', field: 'address', span: { xs: 24, sm: 24, xxl: 24 }, props: { placeholder: '请输入详细地址' } },
  { type: 'input', label: '负责人姓名', field: 'managerName', span: { xs: 24, sm: 12, xxl: 12 }, props: { placeholder: '请输入负责人姓名' } },
  { type: 'input', label: '负责人电话', field: 'managerPhone', span: { xs: 24, sm: 12, xxl: 12 }, props: { placeholder: '请输入负责人电话' } },
  { type: 'input', label: '地址', field: 'location', span: { xs: 24, sm: 12, xxl: 24 } },
  { type: 'tree-select', label: '所属区域', field: 'districtId', span: { xs: 24, sm: 12, xxl: 12 }, 
    props: { 
      placeholder: '请选择所属区域',
      data: regionTree,
      defaultExpandedKeys: ["3301"],
      fieldNames: { key: 'id',title: 'name',children: 'children' },
      allowSearch: true,
      filterTreeNode: (searchValue, nodeData) => {
        return nodeData.name?.includes(searchValue)
      }
    }
  },
])

async function handleSubmit() {
  isSubmitting.value = true
  if (address.value) {
    form.value.lat = address.value.split(',')[0]
    form.value.lng = address.value.split(',')[1]
  }
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

async function getRegionTreeData() {
  const res = await getRegionTree()
  if (res?.success) {
    regionTree.value = res.data || []
  }
  return []
}

function close() {
  form.value = {}
  visible.value = false
}

defineExpose({ onOpen })

</script>
