<template>
  <GiPageLayout>
    <GiTable row-key="id" :data="dataList" :columns="columns" :loading="loading" :scroll="{ x: '100%', y: '100%', minWidth: 1600 }" :pagination="pagination" :disabled-tools="['size']" @refresh="search">
      <template #toolbar-left>
        <a-button type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
      </template>
      <template #top>
        <GiForm v-model="queryForm" search :columns="queryFormColumns" size="medium" @search="search" @reset="reset"></GiForm>
      </template>
      <template #status="{ record }">
        <a-tag v-if="record.status === 'NORMAL'" color="green" size="small">正常</a-tag>
        <a-tag v-else-if="record.status === 'ABNORMAL'" color="red" size="small">异常</a-tag>
        <a-tag v-else-if="record.status === 'OFFLINE'" color="orange" size="small">离线</a-tag>
        <a-tag v-else color="gray" size="small">未知</a-tag>
      </template>
      <template #operation="{ record }">
        <a-link @click="onView(record)">查看</a-link>
        <a-link @click="onEdit(record)">编辑</a-link>
        <a-link @click="onDelete(record)" status="danger">删除</a-link>
      </template>
    </GiTable>
    <BatteryStationModal ref="batteryStationModalRef" @submitted="submitted" />
  </GiPageLayout>
</template>

<script setup lang="ts">
import type { TableInstance } from '@arco-design/web-vue'
import { h } from 'vue'
import { batteryStationList, type BatteryStationInfo, deleteBatteryStation } from '@/apis/battery/battery-info'
import { useResetReactive, useTable } from '@/hooks'
import type { ColumnItem } from '@/components/GiForm'
import BatteryStationModal from './components/BatteryStationModal.vue'

const batteryStationModalRef = ref<typeof BatteryStationModal>()
const [queryForm, resetForm] = useResetReactive({})

const queryFormColumns: ColumnItem[] = reactive([
  {
    type: 'input',
    label: '电池柜名称',
    field: 'name',
    span: { xs: 24, sm: 6, xxl: 6 },
    props: {
      placeholder: '请输入电池柜名称',
    },
  },
  {
    type: 'input',
    label: '设备编号',
    field: 'deviceSn',
    span: { xs: 24, sm: 6, xxl: 6 },
    props: {
      placeholder: '请输入设备编号',
    },
  },
])

const { tableData: dataList, loading, pagination, search, handleDelete } = useTable((page) => batteryStationList({ ...queryForm, ...page }),{ immediate: true })

const columns: TableInstance['columns'] = [
  {
    title: '序号',
    width: 60,
    align: 'center',
    render: ({ rowIndex }) => h('span', {}, rowIndex + 1 + (pagination.current - 1) * pagination.pageSize),
    fixed: 'left',
  },
  { title: '电池柜名称', dataIndex: 'name', width: 150, ellipsis: true, tooltip: true, fixed: 'left' },
  { title: '设备编号', dataIndex: 'deviceSn', width: 150, ellipsis: true, tooltip: true },
  { title: '经度', dataIndex: 'lng', width: 120 },
  { title: '纬度', dataIndex: 'lat', width: 120 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 100, align: 'center' },
  { title: '备注', dataIndex: 'remark', width: 200, ellipsis: true, tooltip: true },
  { title: '操作', dataIndex: 'operation', slotName: 'operation', width: 160, align: 'center' },
]

const submitted = () => {
  search()
}

const onAdd = () => {
  batteryStationModalRef.value?.onOpen()
}

const onEdit = (record: any) => {
  batteryStationModalRef.value?.onOpen(record)
}

const router = useRouter()
const onView = (record: any) => {
  console.log(record);
  
  router.push({ name: 'BatteryDetail', params: { id: record.id } })
}

const onDelete = async (record: BatteryStationInfo) => {
  return handleDelete(() => deleteBatteryStation(record.id), {
    content: `是否确定删除「${record.name}」？`,
    showModal: true,
  })
}

const reset = () => {
  resetForm()
  search()
}
</script>
