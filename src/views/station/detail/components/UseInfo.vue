<template>
  <div class="table-wrap">
    <GiTable 
      row-key="id" 
      :data="dataList" 
      :columns="columns" 
      :loading="loading" 
      :scroll="{ x: '100%', y: '100%', minWidth: 1800 }" 
      :pagination="pagination" 
      :disabled-tools="['size']" 
      @refresh="search"
    >
      <template #gender="{ record }">
        <GiCellTag :value="record.gender" :dict="genderDict" />
      </template>
      <template #status="{ record }">
        <GiCellTag :value="record.status" :dict="isOnlineDict" />
      </template>
    </GiTable>
  </div>
</template>

<script lang="ts" setup>
import { useTable, useResetReactive } from '@/hooks'
import { getUserList } from '@/apis'
const [queryForm, resetForm] = useResetReactive({})

const genderDict = [
  {
    label: '男',
    value: 1,
    extra: 'primary'
  }, 
  {
    label: '女',
    value: 0,
    extra: 'warning'
  },
  {
    label: '未知',
    value: 2,
    extra: 'default'
  }
]

const isOnlineDict = [
  {
    label: '在线',
    value: 1,
    extra: 'primary'
  }, 
  {
    label: '离线',
    value: 0,
    extra: 'warning'
  },
]

const columns = [
  {
    title: '序号',
    width: 50,
    align: 'center',
    render: ({ rowIndex }) => h('span', {}, rowIndex + 1 + (pagination.current - 1) * pagination.pageSize),
    fixed: 'left',
  },
  { title: '昵称', dataIndex: 'nickname', width: 100 },
  { title: '手机号', dataIndex: 'phone', width: 100 },
  { title: '邮箱', dataIndex: 'email', width: 100 },
  { title: '性别', dataIndex: 'gender', slotName: 'gender',width: 100, align:'center' },
  { title: '在线状态', dataIndex: 'status', slotName: 'status',width: 100, align:'center' },
]


const { tableData: dataList, loading, pagination, search, handleDelete } = useTable((page) => getUserList({ ...queryForm, ...page }), { immediate: true })

</script>

<style lang="scss" scoped>
.table-wrap{
  height: 100%;
  width: 100%;
}
</style>