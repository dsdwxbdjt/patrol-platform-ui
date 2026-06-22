<template>
  <a-drawer
    :title="`工单详情 - ${currentOrder?.title || ''}`"
    :visible.sync="visible"
    width="600px"
    @cancel="close">
    <a-descriptions :column="1" border>
      <a-descriptions-item label="工单标题">{{ currentOrder?.title }}</a-descriptions-item>
      <a-descriptions-item label="问题描述">{{ currentOrder?.description || '-' }}</a-descriptions-item>
      <a-descriptions-item label="所属站点">{{ currentOrder?.station?.name || '-' }}</a-descriptions-item>
      <a-descriptions-item label="巡检人员">{{ currentOrder?.inspector?.nickname || currentOrder?.inspector?.username || '-' }}</a-descriptions-item>
      <a-descriptions-item label="巡检时间">{{ currentOrder?.inspectionTime }}</a-descriptions-item>
      <a-descriptions-item label="工单状态">
        <a-tag :color="getStatusColor(currentOrder?.status)">
          {{ getStatusText(currentOrder?.status) }}
        </a-tag>
      </a-descriptions-item>
      <a-descriptions-item label="紧急程度">
        <a-tag :color="getLevelColor(currentOrder?.level)">
          {{ getLevelText(currentOrder?.level) }}
        </a-tag>
      </a-descriptions-item>
      <a-descriptions-item label="问题照片">
        <template v-if="currentOrder?.problemPhoto">
          <a-image :src="currentOrder.problemPhoto" width="100" />
        </template>
        <span v-else>-</span>
      </a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ currentOrder?.createdAt }}</a-descriptions-item>
      <a-descriptions-item label="更新时间">{{ currentOrder?.updatedAt }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getOrderDetail, type OrderInfo } from '@/apis/order/order-info'

defineOptions({ name: 'OrderDrawer' })

const visible = ref(false)
const currentOrder = ref<OrderInfo | null>(null)

const statusMap = {
  0: { text: '待处理', color: 'orange' },
  1: { text: '处理中', color: 'blue' },
  2: { text: '已完成', color: 'green' },
  3: { text: '已关闭', color: 'gray' },
}

const levelMap = {
  1: { text: '一般', color: 'blue' },
  2: { text: '重要', color: 'orange' },
  3: { text: '紧急', color: 'red' },
}

const onOpen = async (id: string) => {
  const res = await getOrderDetail(id)
  if (res?.success) {
    currentOrder.value = res.data
  }
  visible.value = true
}

function getStatusText(status?: number) {
  return statusMap[status as keyof typeof statusMap]?.text || '未知'
}

function getStatusColor(status?: number) {
  return statusMap[status as keyof typeof statusMap]?.color || 'gray'
}

function getLevelText(level?: number) {
  return levelMap[level as keyof typeof levelMap]?.text || '未知'
}

function getLevelColor(level?: number) {
  return levelMap[level as keyof typeof levelMap]?.color || 'gray'
}

function close() {
  visible.value = false
  currentOrder.value = null
}

defineExpose({ onOpen })
</script>
