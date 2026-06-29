<template>
  <a-modal
    :title
    :visible.sync="visible"
    :width="600"
    :confirm-loading="isSubmitting"
    @before-ok="handleSubmit"
    @cancel="close">
    <GiForm v-model="form" :columns="columns" size="medium">
      <template #stationId>
        <StationSelect v-model="form.stationId" @select-station="handleSelectSite" :inputSites="inputSites" />
      </template>
      <template #inspectorId>
        <UserSelect v-model="form.inspectorId" @select-user="handleSelectUser" :inputUsers="inputUsers" />
      </template>
      <template #problemPhoto>
        <a-upload
          action="/dev-api/api/file/upload"
          @change="handleUpload"
          :auto-upload="true"
          list-type="picture-card"
          :file-list="fileList"
          :headers="uploadHeaders"
          :max-count="1"
        >
          <a-button type="primary">选择图片</a-button>
        </a-upload>
      </template>
    </GiForm>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { addOrder, getOrderDetail, editOrder } from '@/apis/order/order-info'
import { stationList } from '@/apis/station/station-info'
import { getUserList } from '@/apis/user/user-list'
import { useDict } from '@/hooks/app/useDict'

defineOptions({ name: 'OrderModal' })

const uploadHeaders = computed(() => {
  return {
    'Authorization': 'Bearer ' + localStorage.getItem('token') || ''
  }
})

const editId = ref<string | null>(null)
const title = ref('新增工单')
const stationOptions = ref<any[]>([])
const inspectorOptions = ref<any[]>([])
const inputSites = ref()
const inputUsers = ref()
const fileList = ref<any[]>([])

const { status_options, level_option } = useDict('status_options', 'level_option')

const onOpen = async (data?: any) => {
  await getStationList()
  await getInspectorList()
  if (data?.id) {
    editId.value = data.id
    title.value = '编辑工单'
    const detail = await getOrderDetail(data.id)
    if (detail?.success) {
      form.value = detail.data
    }
  }
  visible.value = true
}

const isSubmitting = ref<boolean>(false)
const emit = defineEmits(['submitted'])
const visible = ref(false)
const form = ref<any>({})

const columns: any[] = reactive([
  { type: 'input', label: '工单标题', field: 'title', span: { xs: 24, sm: 24, xxl: 24 }, props: { placeholder: '请输入工单标题' } },
  { type: 'textarea', label: '问题描述', field: 'description', span: { xs: 24, sm: 24, xxl: 24 }, props: { placeholder: '请输入问题描述' } },
  { type: 'input', label: '所属站点', field: 'stationId', span: { xs: 24, sm: 12, xxl: 24 } },
  { type: 'select', label: '巡检人员', field: 'inspectorId', span: { xs: 24, sm: 12, xxl: 24 }, props: { placeholder: '请选择巡检人员', options: inspectorOptions } },
  { type: 'date-picker', label: '巡检时间', field: 'inspectionTime', span: { xs: 24, sm: 12, xxl: 12 }, props: { placeholder: '请选择巡检时间', showTime: true } },
  { type: 'select', label: '工单状态', field: 'status', span: { xs: 24, sm: 12, xxl: 12 }, props: { placeholder: '请选择工单状态', options: status_options } },
  { type: 'select', label: '隐患类别', field: 'level', span: { xs: 24, sm: 12, xxl: 12 }, props: { placeholder: '请选择隐患类别', options: level_option } },
  { type: 'input', label: '问题照片', field: 'problemPhoto', span: { xs: 24, sm: 12, xxl: 12 }, props: { placeholder: '请输入问题照片URL' } },
])

async function handleSubmit() {
  isSubmitting.value = true
  try {
    form.value.problemPhoto = uploadList.value.map((item: any) => item.data.id).join(',')
    if (editId.value) {
      await editOrder(form.value, editId.value)
    } else {
      await addOrder(form.value)
    }
    emit('submitted')
    close()
  } catch (_) {
    return false
  } finally {
    isSubmitting.value = false
  }
}

async function getStationList() {
  const res = await stationList({ page: 1, pageSize: 1000 })
  if (res?.success) {
    stationOptions.value = (res.data.list || []).map((item: any) => ({ label: item.name, value: item.id }))
  }
}

async function getInspectorList() {
  const res = await getUserList({ page: 1, pageSize: 1000 })
  if (res?.success) {
    inspectorOptions.value = (res.data.list || []).map((item: any) => ({ label: item.nickname || item.username, value: item.id }))
  }
}

const uploadList = ref<any[]>([])
function handleUpload(file: any) {
  uploadList.value = file.map((item: any) => item.response)
}

function handleSelectSite(site: any) {
  form.value.stationId = site[0].id
}

function handleSelectUser(user: any) {
  form.value.inspectorId = user[0].id
}

function close() {
  form.value = {}
  visible.value = false
  editId.value = null
  title.value = '新增工单'
}

defineExpose({ onOpen })
</script>
