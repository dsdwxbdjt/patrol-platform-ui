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
      <template #operation="{ record }">
        <a-link @click="onView(record)">查看</a-link>
        <a-link @click="onEdit(record)">编辑</a-link>
        <a-link @click="onDelete(record)" status="danger">删除</a-link>
      </template>
      <template #level="{ record }">
        <GiCellTag :value="record.level" :dict="level_option" />
      </template>
      <template #status="{ record }">
        <GiCellTag :value="record.status" :dict="status_options" />
      </template>
    </GiTable>
    <OrderModal ref="orderModalRef" @submitted="submitted" />
    <OrderDrawer ref="orderDrawerRef" />
  </GiPageLayout>
</template>

<script setup lang="ts">
import type { TableInstance } from '@arco-design/web-vue'
import { h } from 'vue'
import { orderList, deleteOrder, type OrderInfo } from '@/apis'
import { useResetReactive, useTable } from '@/hooks'
import type { ColumnItem } from '@/components/GiForm'
import OrderModal from './components/OrderModal.vue'
import OrderDrawer from './components/OrderDrawer.vue'
import { useDict } from '@/hooks/app/useDict'

const orderModalRef = ref<typeof OrderModal>()
const orderDrawerRef = ref<typeof OrderDrawer>()
const [queryForm, resetForm] = useResetReactive({})

const { status_options, level_option } = useDict('status_options', 'level_option')


const queryFormColumns: ColumnItem[] = reactive([
  {
    type: 'input',
    label: '工单标题',
    field: 'title',
    span: { xs: 24, sm: 6, xxl: 6 },
    props: {
      placeholder: '请输入工单标题',
    },
  },
  {
    type: 'select',
    label: '工单状态',
    field: 'status',
    span: { xs: 24, sm: 6, xxl: 6 },
    props: {
      options: status_options,
      placeholder: '请选择状态',
    },
  },
])

const { tableData: dataList, loading, pagination, search, handleDelete } = useTable((page) => {
  return orderList({ ...queryForm, page: page.current, size: page.pageSize })
}, { immediate: true })

const columns: TableInstance['columns'] = [
  {
    title: '序号',
    width: 70,
    align: 'center',
    render: ({ rowIndex }) => h('span', {}, rowIndex + 1 + (pagination.current - 1) * pagination.pageSize),
    fixed: 'left',
  },
  { title: '工单标题', dataIndex: 'title', width: 200, ellipsis: true, tooltip: true, fixed: 'left' },
  { title: '问题描述', dataIndex: 'description', width: 200, ellipsis: true, tooltip: true },
  { title: '巡检时间', dataIndex: 'inspectionTime', width: 180 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 100, align: 'center' },
  { title: '隐患类别', dataIndex: 'level', slotName: 'level', width: 100, align: 'center' },
  { title: '创建时间', dataIndex: 'createdAt', width: 180 },
  { title: '操作', dataIndex: 'operation', slotName: 'operation', width: 180, align: 'center' },
]

const submitted = () => {
  search()
}

const onAdd = () => {
  orderModalRef.value?.onOpen()
}

const onEdit = (record: any) => {
  orderModalRef.value?.onOpen(record)
}

const onView = (record: any) => {
  orderDrawerRef.value?.onOpen(record.id)
}

const onDelete = async (record: OrderInfo) => {
  return handleDelete(() => deleteOrder(record.id), {
    content: `是否确定删除「${record.title}」？`,
    showModal: true,
  })
}

const reset = () => {
  resetForm()
  search()
}
</script>
