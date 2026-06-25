<template>
  <GiPageLayout>
    <div class="battery-detail-container">
      <div class="detail-section">
        <a-descriptions :data="detailData" :column="3">
          <a-descriptions-item label="电池柜名称">{{ detailData.name }}</a-descriptions-item>
          <a-descriptions-item label="设备编号">{{ detailData.deviceSn }}</a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag v-if="detailData.status === 'NORMAL'" color="green" size="small">正常</a-tag>
            <a-tag v-else-if="detailData.status === 'ABNORMAL'" color="red" size="small">异常</a-tag>
            <a-tag v-else-if="detailData.status === 'OFFLINE'" color="orange" size="small">离线</a-tag>
            <a-tag v-else color="gray" size="small">未知</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="经度">{{ detailData.lng ?? '-' }}</a-descriptions-item>
          <a-descriptions-item label="纬度">{{ detailData.lat ?? '-' }}</a-descriptions-item>
          <a-descriptions-item label="创建时间">{{ formatDateTime(detailData.createdAt) }}</a-descriptions-item>
          <a-descriptions-item label="备注" :span="3">{{ detailData.remark ?? '-' }}</a-descriptions-item>
        </a-descriptions>
      </div>
      <div class="tab-section">
        <a-tabs v-model:activeKey="activeTab">
          <a-tab-pane key="1" title="电池仓列表">
            <div class="box-list-container">
              <GiTable
                row-key="id"
                :data="boxList"
                :columns="boxColumns"
                :loading="boxLoading"
                :scroll="{ x: '100%', y: 'calc(100vh - 420px)' }"
                :pagination="boxPagination"
                :disabled-tools="['size']"
                @refresh="searchBoxList"
              >
                <template #toolbar-left>
                  <a-button type="primary" @click="onAddBox">
                    <template #icon><icon-plus /></template>
                    <template #default>新增电池仓</template>
                  </a-button>
                </template>
                <template #boxStatus="{ record }">
                  <a-tag v-if="record.status === 'EMPTY'" color="gray" size="small">空仓无电池</a-tag>
                  <a-tag v-else-if="record.status === 'FULL_BATTERY'" color="green" size="small">满电池</a-tag>
                  <a-tag v-else-if="record.status === 'FAULT'" color="red" size="small">仓位故障</a-tag>
                  <a-tag v-else-if="record.status === 'CHARGEING'" color="blue" size="small">充电中</a-tag>
                  <a-tag v-else-if="record.status === 'LOCKED'" color="orange" size="small">锁定禁用</a-tag>
                  <a-tag v-else color="gray" size="small">未知</a-tag>
                </template>
                <template #boxOperation="{ record }">
                  <a-link @click="onEditBox(record)">编辑</a-link>
                  <a-link @click="onDeleteBox(record)" status="danger">删除</a-link>
                </template>
              </GiTable>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
    <BatteryBoxModal ref="batteryBoxModalRef" @submitted="submittedBox" />
  </GiPageLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  getBatteryStationDetail,
  type BatteryStationDetail,
  batteryBoxList,
  type BatteryBoxInfo,
  deleteBatteryBox,
} from '@/apis/battery/battery-info'
import dayjs from 'dayjs'
import { useTable, useResetReactive } from '@/hooks'
import type { TableInstance } from '@arco-design/web-vue'
import { h } from 'vue'
import BatteryBoxModal from './components/BatteryBoxModal.vue'

defineOptions({ name: 'BatteryDetail' })

const route = useRoute()
const detailData = ref<BatteryStationDetail>({} as BatteryStationDetail)
const activeTab = ref('1')
const loading = ref(false)
const batteryBoxModalRef = ref<typeof BatteryBoxModal>()

const [boxQueryForm] = useResetReactive({})
const { tableData: boxList, loading: boxLoading, pagination: boxPagination, search: searchBoxList, handleDelete: handleBoxDelete } = useTable(
  (page) => {
    const cabinetId = route.params.id as string
    return batteryBoxList(cabinetId, { ...boxQueryForm, ...page }).then((res) => res)
  },
  { immediate: false }
)

const boxColumns: TableInstance['columns'] = [
  {
    title: '序号',
    width: 60,
    align: 'center',
    render: ({ rowIndex }) => h('span', {}, rowIndex + 1 + (boxPagination.current - 1) * boxPagination.pageSize),
    fixed: 'left',
  },
  { title: '仓号', dataIndex: 'boxNo', width: 120, ellipsis: true, tooltip: true, fixed: 'left' },
  { title: '设备编号', dataIndex: 'deviceSn', width: 150, ellipsis: true, tooltip: true },
  { title: '状态', dataIndex: 'status', slotName: 'boxStatus', width: 100, align: 'center' },
  { title: '备注', dataIndex: 'remark', width: 200, ellipsis: true, tooltip: true },
  { title: '创建时间', dataIndex: 'createdAt', width: 180 },
  { title: '操作', dataIndex: 'boxOperation', slotName: 'boxOperation', width: 140, align: 'center' },
]

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return '-'
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm:ss')
}

const fetchDetail = async () => {
  const id = route.params.id as string
  if (!id) return
  loading.value = true
  try {
    const res = await getBatteryStationDetail(id)
    detailData.value = res.data
    searchBoxList()
  } finally {
    loading.value = false
  }
}

const onAddBox = () => {
  batteryBoxModalRef.value?.onOpen(route.params.id as string)
}

const onEditBox = (record: any) => {
  batteryBoxModalRef.value?.onOpen(route.params.id as string, record)
}

const onDeleteBox = async (record: BatteryBoxInfo) => {
  return handleBoxDelete(() => deleteBatteryBox(record.id), {
    content: `是否确定删除仓号「${record.boxNo}」？`,
    showModal: true,
  })
}

const submittedBox = () => {
  searchBoxList()
  fetchDetail()
}

onMounted(() => {
  fetchDetail()
})
</script>

<style scoped lang="scss">
.battery-detail-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.detail-section {
  padding: 20px;
  overflow-y: auto;
  background-color: #fff;
}

.tab-section {
  flex: 1;
  margin-top: 16px;
  overflow: hidden;
  background-color: #fff;
}

.box-list-container {
  height: 100%;
}

:deep(.arco-tabs) {
  height: 100%;
}

:deep(.arco-tabs-content) {
  height: calc(100% - 40px);
}

:deep(.arco-tabs-content-list) {
  height: 100%;
}

:deep(.arco-tabs-pane) {
  height: 100%;
  background-color: #F3F5FD;
}
</style>
