<template>
  <GiPageLayout>
    <template #left>
      <RegionTree @select="selectRegion" />
    </template>
    <GiTable row-key="id" :data="dataList" :columns="columns" :loading="loading" :scroll="{ x: '100%', y: '100%', minWidth: 1800 }" :pagination="pagination" :disabled-tools="['size']" @refresh="search">
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
        <GiCellStatus :status="record.status" />
      </template>
      <template #batteryStatus="{ record }">
        <a-tag v-if="record.batteryStatus === 1" color="green" size="small">正常</a-tag>
        <a-tag v-else-if="record.batteryStatus === 2" color="red" size="small">异常</a-tag>
        <a-tag v-else color="gray" size="small">未知</a-tag>
      </template>
      <template #onlineRiderCount="{ record }">
        <span>{{ record.onlineRiderCount }} / {{ record.riderCount }}</span>
      </template>
      <template #operation="{ record }">
        <a-link @click="onView(record)">查看</a-link>
        <a-link @click="onEdit(record)">编辑</a-link>
        <a-link @click="onDelete(record)" status="danger">删除</a-link>
      </template>
    </GiTable>
    <StationInfoModal ref="stationInfoModalRef" @submitted="search" />
  </GiPageLayout>
</template>

<script setup lang="ts">
import type { TableInstance } from '@arco-design/web-vue'
import { h } from 'vue'
import { stationList, type StationInfo, deleteStation } from '@/apis'
import { DisEnableStatusList } from '@/constant/common'
import { useResetReactive, useTable } from '@/hooks'
import type { ColumnItem } from '@/components/GiForm'
import RegionTree from './components/RegionTree.vue'
import StationInfoModal from './components/StationInfoModal.vue'
const stationInfoModalRef = ref<typeof StationInfoModal>()
const [queryForm, resetForm] = useResetReactive({})
const queryFormColumns: ColumnItem[] = reactive([
  {
    type: 'input',
    label: '站点名称',
    field: 'name',
    span: { xs: 24, sm: 6, xxl: 8 },
    props: {
      placeholder: '请输入站点名称',
    },
  },
  {
    type: 'select',
    label: '站点状态',
    field: 'status',
    span: { xs: 24, sm: 6, xxl: 8 },
    props: {
      options: DisEnableStatusList,
      placeholder: '请选择状态',
    },
  },
])

const { tableData: dataList, loading, pagination, search, handleDelete } = useTable((page) => stationList({ ...queryForm, ...page }), { immediate: true })

const columns: TableInstance['columns'] = [
  {
    title: '序号',
    width: 50,
    align: 'center',
    render: ({ rowIndex }) => h('span', {}, rowIndex + 1 + (pagination.current - 1) * pagination.pageSize),
    fixed: 'left',
  },
  { title: '站点名称', dataIndex: 'name', width: 150, ellipsis: true, tooltip: true, fixed: 'left' },
  { title: '所属区域', dataIndex: 'district', width: 100 },
  { title: '站长姓名', dataIndex: 'managerName', width: 100 },
  { title: '站长电话', dataIndex: 'managerPhone', width: 130 },
  { title: '详细地址', dataIndex: 'address', width: 150, ellipsis: true, tooltip: true },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 100, align: 'center' },
  { title: '操作', dataIndex: 'operation', slotName: 'operation', width: 100, align: 'center' },
]

const selectRegion = (keys: Array<any>) => {
  queryForm.districtId = keys[0]
  search()
}

const onAdd = () => {
  stationInfoModalRef.value?.onOpen()
}

const onEdit = (record: any) => {
  stationInfoModalRef.value?.onOpen(record)
}

const router = useRouter()
const onView = (record: any) => {
  router.push({ name: 'StationDetail', params: { id: record.id } })
}

const onDelete = async (record: StationInfo) => {
  return handleDelete(() => deleteStation(record.id), {
    content: `是否确定删除「${record.name}」？`,
    showModal: true,
  })
}

const reset = () => {
  resetForm()
  search()
}
</script>
