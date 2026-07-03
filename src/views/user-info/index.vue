<template>
  <GiPageLayout>
    <GiTable 
      row-key="id" 
      :data="tableData" 
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
      <template #operation="{ record }">
        <StationSelect v-if="record.stations.length === 0" @select-station="(val) => selectStation(val, record)"  buttonName="绑定站点" modelType="link" />
        <a-link style="color: #F25C28;" v-else @click="unBindStation(record)">解绑站点</a-link>
        <a-link @click="editUser(record)">编辑</a-link>
      </template>
      <template #stationName="{ record }">
        <a-link @click="toStation(record.stations[0])">{{ record.stations.map((val: any) => val.name)[0] }}</a-link>
      </template>
      <template #role="{ record }">
        <a-tag style="margin-left: 10px;" v-for="role in record.role" :key="role.id">{{ role.name }}</a-tag>
      </template>
    </GiTable>
  </GiPageLayout>
</template>

<script lang="ts" setup>
import { useTable, useResetReactive } from '@/hooks'
import { getUserList, addUserStation, unBindUserStation } from '@/apis'
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

const router = useRouter()

const toStation = (station: any) => {
  router.push({
    path: `/station/${station.id}`
  })
}

const columns = [
  {
    title: '序号',
    width: 50,
    align: 'center',
    render: ({ rowIndex }) => h('span', {}, rowIndex + 1 + (pagination.current - 1) * pagination.pageSize),
    fixed: 'left',
  },
  { title: '姓名', dataIndex: 'nickname', width: 100, align: 'center' },
  { title: '关联站点', dataIndex: 'stationName', slotName: 'stationName',width: 100, align:'center' },
  { title: '手机号', dataIndex: 'phone', width: 100, align: 'center' },
  { title: '邮箱', dataIndex: 'email', width: 100, align: 'center' },
  { title: '性别', dataIndex: 'gender', slotName: 'gender',width: 100, align:'center' },
  { title: '角色', dataIndex: 'role', slotName: 'role',width: 100, align:'center' },
  { title: '在线状态', dataIndex: 'status', slotName: 'status',width: 100, align:'center' },
  { title: '操作', dataIndex: 'operation', slotName: 'operation',width: 100, align:'center' },
]

const selectStation = async (val: any, record: any) => {
  if (val.length) {
    await addUserStation(record.id, { stationId: val[0].id })
    search()
  }
}

const editUser = (record: any) => {

}

const unBindStation = async (record: any) => {
  return handleDelete(() => unBindUserStation(record.id), {
    content: `是否确认解绑该站点`,
    showModal: true,
  })
}

const { tableData, loading, pagination, search, handleDelete } = useTable((page) => getUserList({ ...queryForm, ...page }), { immediate: true })

</script>

<style lang="scss" scoped>
.table-wrap{
  height: 100%;
  width: 100%;
}
</style>