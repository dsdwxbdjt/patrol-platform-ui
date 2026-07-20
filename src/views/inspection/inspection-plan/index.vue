<template>
  <GiPageLayout>
    <GiTable
      row-key="id"
      :data="dataList"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1200 }"
      :pagination="pagination"
      :disabled-tools="['size']"
      @refresh="search"
    >
      <template #toolbar-left>
        <a-button type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
      </template>
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)">{{ getStatusText(record.status) }}</a-tag>
      </template>
      <template #operation="{ record }">
        <a-link @click="onView(record)">查看</a-link>
        <a-link @click="onDelete(record)">删除</a-link>
      </template>
    </GiTable>
    <InspectionPlanModal ref="inspectionPlanModalRef" @submitted="submitted" />
  </GiPageLayout>
</template>

<script setup lang="ts">
import type { TableInstance } from '@arco-design/web-vue'
import { h } from 'vue'
import { useRouter } from 'vue-router'
import { getInspectionPlanList, deleteInspectionPlan } from '@/apis'
import { useTable } from '@/hooks'
import InspectionPlanModal from './components/InspectionPlanModal.vue'

const router = useRouter()
const inspectionPlanModalRef = ref<typeof InspectionPlanModal>()

const { tableData: dataList, loading, pagination, search, handleDelete } = useTable(
  (page) => getInspectionPlanList({ page: page.current, size: page.pageSize }),
  { immediate: true }
)

const statusMap: Record<number, { text: string; color: string }> = {
  0: { text: '待处理', color: 'orange' },
  1: { text: '处理中', color: 'blue' },
  2: { text: '已完成', color: 'green' },
  3: { text: '已取消', color: 'gray' },
}

const columns: TableInstance['columns'] = [
  {
    title: '序号',
    width: 60,
    align: 'center',
    render: ({ rowIndex }) =>
      h('span', {}, rowIndex + 1 + (pagination.current - 1) * pagination.pageSize),
    fixed: 'left',
  },
  { title: '计划名称', dataIndex: 'name', width: 200, ellipsis: true, tooltip: true, fixed: 'left' },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 100, align: 'center' },
  { title: '计划日期', dataIndex: 'planDate', width: 180 },
  { title: '结束日期', dataIndex: 'endDate', width: 180 },
  { title: '备注', dataIndex: 'remark', width: 200, ellipsis: true, tooltip: true },
  { title: '创建时间', dataIndex: 'createdAt', width: 180 },
  { title: '操作', dataIndex: 'operation', slotName: 'operation', width: 120, align: 'center', fixed: 'right' },
]

const submitted = () => {
  search()
}

const onAdd = () => {
  inspectionPlanModalRef.value?.onOpen()
}

const onView = (record: any) => {
  router.push(`/inspection-plan/detail/${record.id}`)
}

function onDelete(record: any) {
  handleDelete(() => deleteInspectionPlan(record.id), {
    content: `是否确定删除「${record.name}」？`,
    showModal: true,
  })
}

function getStatusText(status?: number) {
  return statusMap[status as keyof typeof statusMap]?.text || '未知'
}

function getStatusColor(status?: number) {
  return statusMap[status as keyof typeof statusMap]?.color || 'gray'
}
</script>
