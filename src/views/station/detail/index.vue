<template>
  <GiPageLayout>
    <div class="station-detail-container">
      <div class="detail-section">
        <a-descriptions :data="detailData" :column="3">
          <a-descriptions-item label="站点名称">{{ detailData.name }}</a-descriptions-item>
          <a-descriptions-item label="所属公司">{{ detailData.company }}</a-descriptions-item>
          <a-descriptions-item label="区县">{{ detailData.district }}</a-descriptions-item>
          <a-descriptions-item label="街道">{{ detailData.street }}</a-descriptions-item>
          <a-descriptions-item label="详细地址" :span="3">{{ detailData.address }}</a-descriptions-item>
          <a-descriptions-item label="站长姓名">{{ detailData.managerName }}</a-descriptions-item>
          <a-descriptions-item label="站长电话">{{ detailData.managerPhone }}</a-descriptions-item>
          <a-descriptions-item label="骑手数量">{{ detailData.riderCount ?? '-' }}</a-descriptions-item>
          <a-descriptions-item label="在线骑手数量">{{ detailData.onlineRiderCount ?? '-' }}</a-descriptions-item>
          <a-descriptions-item label="日单量">{{ detailData.dailyOrderCount ?? '-' }}</a-descriptions-item>
          <a-descriptions-item label="电池站数量">{{ detailData.batteryStationNum ?? '-' }}</a-descriptions-item>
          <a-descriptions-item label="状态">
            <GiCellStatus :status="detailData.status" />
          </a-descriptions-item>
        </a-descriptions>
      </div>
      <div class="tab-section">
        <a-tabs v-model:activeKey="activeTab">
          <a-tab-pane key="1" title="站点人员">
            <UseInfo :formData="detailData" />
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
  </GiPageLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getStationDetail, type StationInfo } from '@/apis/station/station-info'
import UseInfo from './components/UseInfo.vue'

defineOptions({ name: 'StationDetail' })

const route = useRoute()
const detailData = ref<StationInfo>({} as StationInfo)
const activeTab = ref('1')
const loading = ref(false)

const fetchDetail = async () => {
  const id = route.params.id as string
  if (!id) return
  loading.value = true
  try {
    const res = await getStationDetail(id)
    detailData.value = res.data
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDetail()
})
</script>

<style scoped lang="scss">
.station-detail-container {
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

.tab-content {
  height: 100%;
  background-color: #f2f3f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86909c;
  font-size: 16px;
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
