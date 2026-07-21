<template>
  <GiPageLayout>
    <div class="inspection-plan-detail-container">
      <div class="detail-section">
        <a-descriptions :data="currentPlan" :column="3">
          <a-descriptions-item label="计划名称">{{ currentPlan?.name }}</a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="getStatusColor(currentPlan?.status)">{{ getStatusText(currentPlan?.status) }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="计划日期">{{ currentPlan?.planDate }}</a-descriptions-item>
          <a-descriptions-item label="结束日期">{{ currentPlan?.endDate }}</a-descriptions-item>
          <a-descriptions-item label="创建时间">{{ currentPlan?.createdAt }}</a-descriptions-item>
          <a-descriptions-item label="更新时间">{{ currentPlan?.updatedAt }}</a-descriptions-item>
          <a-descriptions-item label="备注" :span="3">{{ currentPlan?.remark || '-' }}</a-descriptions-item>
        </a-descriptions>
      </div>
      <div class="tab-section">
        <a-tabs v-model:activeKey="activeTab">
          <a-tab-pane key="1" title="巡检任务">
            <div class="tab-content">
              <GiTable
                v-if="currentPlan?.tasks?.length"
                row-key="id"
                :data="currentPlan.tasks"
                :columns="taskColumns"
                :loading="loading"
                :pagination="false"
                :disabled-tools="['size', 'refresh', 'setting', 'fullscreen']"
              >
                <template #taskStatus="{ record }">
                  <a-tag :color="getStatusColor(record.status)">{{ getStatusText(record.status) }}</a-tag>
                </template>
                <template #operation="{ record }">
                  <a-link @click="expandTask(record)">详情</a-link>
                </template>
              </GiTable>
              <a-empty v-else description="暂无巡检任务" />
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>

    <InspectionTestDrawer
      v-model:visible="drawerVisible"
      :title="`${currentTask?.stations?.name || '任务'} - 详情`"
      :detail="currentTask"
    />
  </GiPageLayout>
</template>

<script setup lang="ts">
import type { TableInstance } from '@arco-design/web-vue'
import { h, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getInspectionPlanDetail, getInspectionTaskDetail, type InspectionPlanInfo, type InspectionTaskInfo } from '@/apis'
import InspectionTestDrawer from './components/InspectionTestDrawer.vue'

defineOptions({ name: 'InspectionPlanDetail' })

const route = useRoute()
const router = useRouter()
const currentPlan = ref<InspectionPlanInfo | null>(null)
const activeTab = ref('1')
const loading = ref(false)
const drawerVisible = ref(false)
const currentTask = ref<any>(null)

const statusMap: Record<number, { text: string; color: string }> = {
  0: { text: '待处理', color: 'orange' },
  1: { text: '处理中', color: 'blue' },
  2: { text: '已完成', color: 'green' },
  3: { text: '已取消', color: 'gray' },
}

const taskColumns: TableInstance['columns'] = [
  {
    title: '序号',
    width: 50,
    align: 'center',
    render: ({ rowIndex }) => h('span', {}, rowIndex + 1),
    fixed: 'left',
  },
  { title: '站点', dataIndex: 'station.name', width: 200, ellipsis: true, tooltip: true },
  { title: '任务状态', dataIndex: 'status', slotName: 'taskStatus', width: 100, align: 'center' },
  { title: '开始时间', dataIndex: 'startTime', width: 180 },
  { title: '结束时间', dataIndex: 'endTime', width: 180 },
  { title: '操作', dataIndex: 'operation', slotName: 'operation', width: 120, align: 'center' },
]

const fetchDetail = async () => {
  const id = route.params.id as string
  if (!id) {
    router.back()
    return
  }
  loading.value = true
  try {
    const res = await getInspectionPlanDetail(id)
    if (res?.success) {
      currentPlan.value = res.data
    }
  } finally {
    loading.value = false
  }
}

function getStatusText(status?: number) {
  return statusMap[status as keyof typeof statusMap]?.text || '未知'
}

function getStatusColor(status?: number) {
  return statusMap[status as keyof typeof statusMap]?.color || 'gray'
}

async function expandTask(task: InspectionTaskInfo) {
  
  const res = await getInspectionTaskDetail(task.id)
  if (res?.success) {
    currentTask.value = {
      ...res.data,
      stationId: res.data.stationId || ''
    }
    drawerVisible.value = true
  }
}

onMounted(() => {
  fetchDetail()
})
</script>

<style scoped lang="scss">
.inspection-plan-detail-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.detail-section {
  padding: 12px;
  overflow-y: auto;
  background-color: #fff;
}

.tab-section {
  flex: 1;
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
