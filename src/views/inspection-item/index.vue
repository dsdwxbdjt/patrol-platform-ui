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
      <template #top>
        <GiForm
          v-model="queryForm"
          search
          :columns="queryFormColumns"
          size="medium"
          @search="search"
          @reset="reset"
        ></GiForm>
      </template>
      <template #type="{ record }">
        <a-tag :color="getTypeColor(record.type)">{{ getTypeText(record.type) }}</a-tag>
      </template>
      <template #operation="{ record }">
        <a-link @click="onView(record)">查看</a-link>
        <a-link @click="onEdit(record)">编辑</a-link>
        <a-link @click="onDelete(record)" status="danger">删除</a-link>
      </template>
    </GiTable>
    <InspectionItemModal ref="inspectionItemModalRef" @submitted="submitted" />
    <InspectionItemDrawer ref="inspectionItemDrawerRef" />
  </GiPageLayout>
</template>

<script setup lang="ts">
import type { TableInstance } from '@arco-design/web-vue'
import { h } from 'vue'
import { getInspectionItemList, type InspectionItemInfo, deleteInspectionItem } from '@/apis/inspection-item/inspection-item'
import { useResetReactive, useTable } from '@/hooks'
import type { ColumnItem } from '@/components/GiForm'
import InspectionItemModal from './components/InspectionItemModal.vue'
import InspectionItemDrawer from './components/InspectionItemDrawer.vue'

const inspectionItemModalRef = ref<typeof InspectionItemModal>()
const inspectionItemDrawerRef = ref<typeof InspectionItemDrawer>()
const [queryForm, resetForm] = useResetReactive({})

const typeOptions = [
  { label: '普通检查', value: 1 },
  { label: '故障检查', value: 2 },
  { label: '安全检查', value: 3 },
  { label: '其他检查', value: 4 },
]

const queryFormColumns: ColumnItem[] = reactive([
  {
    type: 'input',
    label: '巡检项名称',
    field: 'name',
    span: { xs: 24, sm: 6, xxl: 6 },
    props: {
      placeholder: '请输入巡检项名称',
    },
  },
  {
    type: 'select',
    label: '类型',
    field: 'type',
    span: { xs: 24, sm: 6, xxl: 6 },
    props: {
      options: typeOptions,
      placeholder: '请选择类型',
    },
  },
])

const { tableData: dataList, loading, pagination, search, handleDelete } = useTable(
  (page) => getInspectionItemList({ ...queryForm, ...page }),
  { immediate: true }
)

const columns: TableInstance['columns'] = [
  {
    title: '序号',
    width: 50,
    align: 'center',
    render: ({ rowIndex }) =>
      h('span', {}, rowIndex + 1 + (pagination.current - 1) * pagination.pageSize),
    fixed: 'left',
  },
  { title: '巡检项名称', dataIndex: 'name', width: 200, ellipsis: true, tooltip: true, fixed: 'left' },
  { title: '类型', dataIndex: 'type', slotName: 'type', width: 120, align: 'center' },
  { title: '描述', dataIndex: 'description', width: 250, ellipsis: true, tooltip: true },
  { title: '备注', dataIndex: 'remark', width: 200, ellipsis: true, tooltip: true },
  { title: '创建时间', dataIndex: 'createdAt', width: 180 },
  { title: '操作', dataIndex: 'operation', slotName: 'operation', width: 180, align: 'center', fixed: 'right' },
]

const typeMap: Record<number, { text: string; color: string }> = {
  1: { text: '普通检查', color: 'blue' },
  2: { text: '故障检查', color: 'red' },
  3: { text: '安全检查', color: 'orange' },
  4: { text: '其他检查', color: 'gray' },
}

function getTypeText(type?: number) {
  return typeMap[type as keyof typeof typeMap]?.text || '未知'
}

function getTypeColor(type?: number) {
  return typeMap[type as keyof typeof typeMap]?.color || 'gray'
}

const submitted = () => {
  search()
}

const onAdd = () => {
  inspectionItemModalRef.value?.onOpen()
}

const onEdit = (record: any) => {
  inspectionItemModalRef.value?.onOpen(record)
}

const onView = (record: any) => {
  inspectionItemDrawerRef.value?.onOpen(record.id)
}

const onDelete = async (record: InspectionItemInfo) => {
  return handleDelete(() => deleteInspectionItem(record.id), {
    content: `是否确定删除「${record.name}」？`,
    showModal: true,
  })
}

const reset = () => {
  resetForm()
  search()
}
</script>
