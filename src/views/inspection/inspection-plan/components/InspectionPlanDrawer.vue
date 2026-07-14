<template>
  <a-drawer
    :title="`巡检计划详情 - ${currentPlan?.name || ''}`"
    :visible.sync="visible"
    width="800px"
    @cancel="close"
  >
    <a-descriptions :column="1" border>
      <a-descriptions-item label="计划名称">{{ currentPlan?.name }}</a-descriptions-item>
      <a-descriptions-item label="状态">
        <a-tag :color="getStatusColor(currentPlan?.status)">{{ getStatusText(currentPlan?.status) }}</a-tag>
      </a-descriptions-item>
      <a-descriptions-item label="计划日期">{{ currentPlan?.planDate }}</a-descriptions-item>
      <a-descriptions-item label="结束日期">{{ currentPlan?.endDate }}</a-descriptions-item>
      <a-descriptions-item label="备注">{{ currentPlan?.remark || '-' }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ currentPlan?.createdAt }}</a-descriptions-item>
      <a-descriptions-item label="更新时间">{{ currentPlan?.updatedAt }}</a-descriptions-item>
    </a-descriptions>

    <a-divider orientation="left">巡检任务</a-divider>
    <a-collapse v-if="currentPlan?.tasks?.length">
      <a-collapse-item v-for="task in currentPlan.tasks" :key="task.id" :header="`站点: ${task.stations?.name || '-'}`">
        <a-descriptions :column="1" size="small" border>
          <a-descriptions-item label="任务状态">
            <a-tag :color="getStatusColor(task.status)">{{ getStatusText(task.status) }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="开始时间">{{ task.startTime || '-' }}</a-descriptions-item>
          <a-descriptions-item label="结束时间">{{ task.endTime || '-' }}</a-descriptions-item>
        </a-descriptions>
        <a-divider orientation="left" style="margin: 16px 0;">巡检项</a-divider>
        <a-table :data="task.inspectionTaskItems" :pagination="false" size="small">
          <template #columns>
            <a-table-column title="巡检项" data-index="inspectionItem.name" />
            <a-table-column title="结果" data-index="result">
              <template #cell="{ record }">
                <a-tag :color="getResultColor(record.result)">{{ getResultText(record.result) }}</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="备注" data-index="remark" />
            <a-table-column title="检查时间" data-index="checkAt" />
          </template>
        </a-table>
      </a-collapse-item>
    </a-collapse>
    <a-empty v-else description="暂无巡检任务" />
  </a-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getInspectionPlanDetail, type InspectionPlanInfo } from '@/apis/inspection-plan/inspection-plan'

defineOptions({ name: 'InspectionPlanDrawer' })

const visible = ref(false)
const currentPlan = ref<InspectionPlanInfo | null>(null)

const statusMap: Record<number, { text: string; color: string }> = {
  0: { text: '待处理', color: 'orange' },
  1: { text: '处理中', color: 'blue' },
  2: { text: '已完成', color: 'green' },
  3: { text: '已取消', color: 'gray' },
}

const resultMap: Record<number, { text: string; color: string }> = {
  1: { text: '待处理', color: 'orange' },
  2: { text: '正常', color: 'green' },
  3: { text: '异常', color: 'red' },
}

const onOpen = async (id: string) => {
  const res = await getInspectionPlanDetail(id)
  if (res?.success) {
    currentPlan.value = res.data
  }
  visible.value = true
}

function getStatusText(status?: number) {
  return statusMap[status as keyof typeof statusMap]?.text || '未知'
}

function getStatusColor(status?: number) {
  return statusMap[status as keyof typeof statusMap]?.color || 'gray'
}

function getResultText(result?: number) {
  return resultMap[result as keyof typeof resultMap]?.text || '未知'
}

function getResultColor(result?: number) {
  return resultMap[result as keyof typeof resultMap]?.color || 'gray'
}

function close() {
  visible.value = false
  currentPlan.value = null
}

defineExpose({ onOpen })
</script>
