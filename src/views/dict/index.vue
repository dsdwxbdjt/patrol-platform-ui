<template>
  <GiPageLayout>
    <template #left>
      <DictTree @select="onSelect" />
    </template>
    <GiTable row-key="id" :data="dataList" :columns="columns" :loading="loading" :scroll="{ x: '100%', y: '100%', minWidth: 1800 }" :pagination="false" @refresh="search">
      <template #toolbar-left>
        <a-button type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
      </template>
      <template #tag="{ record }">
        <a-tag :color="record.tag">{{ record.label }}</a-tag>
      </template>
      <template #operation="{ record }">
        <a-link type="primary" size="small" @click="handleEdit(record)">编辑</a-link>
        <a-link @click="onDelete(record)" status="danger">删除</a-link>
      </template>
    </GiTable>
    <DictItemModal ref="dictItemModalRef" :dictTypeId @refresh="search" />
  </GiPageLayout>
</template>

<script setup lang="ts">
import DictTree from './components/dictTree.vue'
import DictItemModal from './components/dict-item-modal.vue'
import { useTable } from '@/hooks'
import { getDictItemList, deleteDictItem } from '@/apis'

const dictItemModalRef = ref()
const columns = [
  {
    title: '序号',
    width: 50,
    align: 'center',
    render: ({ rowIndex }) => h('span', {}, rowIndex + 1 + (pagination.current - 1) * pagination.pageSize),
    fixed: 'left',
  },
  { title: '字典名称', dataIndex: 'label', width: 150 },
  { title: '字典内容', dataIndex: 'value', width: 100, align:'center' },
  { title: '备注', dataIndex: 'remark', width: 100, ellipsis: true, tooltip: true },
  { title: '标签', dataIndex: 'tag', width: 130, align: 'center',slotName: 'tag' },
  { title: '创建时间', dataIndex: 'createdAt', width: 150, ellipsis: true, tooltip: true },
  { title: '操作', dataIndex: 'operation', slotName: 'operation', width: 100, align: 'center', fixed: 'right' },
]
const dictTypeId = ref('5decd55a-52ff-4f51-8cee-0aa0f0184c6c')
const { tableData: dataList, loading, pagination, search, handleDelete } = useTable(() => getDictItemList( dictTypeId.value ), { immediate: false })

function onSelect(item: any) {
  dictTypeId.value = item.id
  search()
}

function onDelete(record: any) {
  return handleDelete(() => deleteDictItem(record.id), {
    content: `是否确定删除「${record.label}」？`,
    showModal: true,
  })
}

function onAdd() {
  dictItemModalRef.value.openModal()
}

function handleEdit(record: any) {
  dictItemModalRef.value.openModal(record)
}

</script>
