<template>
  <a-drawer
    :title="`${title || '巡检任务详情'}`"
    :visible="visible"
    width="60%"
    @cancel="handleCancel"
  >
    <div class="inspection-test-drawer">
      <!-- 基础信息 -->
      <a-descriptions :column="2" border>
        <a-descriptions-item label="任务状态">
          <a-tag :color="getStatusColor(detail?.status)">{{ getStatusText(detail?.status) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="开始时间">{{ detail?.startTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="结束时间">{{ detail?.endTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ detail?.createdAt || '-' }}</a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ detail?.remark || '-' }}</a-descriptions-item>
      </a-descriptions>

      <!-- 用户信息 -->
      <a-divider orientation="left">巡检人员</a-divider>
      <a-descriptions :column="2" border>
        <a-descriptions-item label="姓名">{{ detail?.personnel?.nickname || '-' }}</a-descriptions-item>
        <a-descriptions-item label="用户名">{{ detail?.personnel?.username || '-' }}</a-descriptions-item>
        <a-descriptions-item label="手机号">{{ detail?.personnel?.phone || '-' }}</a-descriptions-item>
        <a-descriptions-item label="邮箱">{{ detail?.personnel?.email || '-' }}</a-descriptions-item>
      </a-descriptions>

      <!-- 巡检项表格 -->
      <a-divider orientation="left">巡检项</a-divider>
      <GiTable
        v-if="detail?.inspectionItems?.length"
        row-key="id"
        :data="detail.inspectionItems"
        :columns="itemColumns"
        :pagination="false"
        :disabled-tools="['size', 'refresh', 'setting', 'fullscreen']"
      >
        <template #operation="{ record }">
          <a-link @click="handleView(record)">查看</a-link>
        </template>
      </GiTable>
      <a-empty v-else description="暂无巡检项" />
    </div>
  </a-drawer>
  <InspectionTestModal :detail="detail" ref="modalRef"/>
</template>

<script setup lang="ts">
import type { TableInstance } from '@arco-design/web-vue'
import { getInspectionTaskItemDetail } from '@/apis'
import InspectionTestModal from './InspectionTestModal.vue'
defineOptions({ name: 'InspectionTestDrawer' })

const props = withDefaults(defineProps<{
  visible: boolean
  title?: string
  detail?: any
}>(), {
  visible: false,
  title: ''
})

const modalRef = ref()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'cancel'): void
}>()

const statusMap: Record<number, { text: string; color: string }> = {
  0: { text: '待处理', color: 'orange' },
  1: { text: '处理中', color: 'blue' },
  2: { text: '已完成', color: 'green' },
  3: { text: '已取消', color: 'gray' },
}

const itemColumns: TableInstance['columns'] = [
  { title: '巡检项名称', dataIndex: 'name', width: 200 },
  { title: '描述', dataIndex: 'description',width: 350 },
  { title: '类型', dataIndex: 'type', width: 100, align: 'center' },
  { title: '创建时间', dataIndex: 'createdAt', width: 180 },
  { title: '操作', dataIndex: 'operation',slotName:'operation', width: 120, align: 'center' },
]

function getStatusText(status?: number) {
  return statusMap[status as keyof typeof statusMap]?.text || '未知'
}

function getStatusColor(status?: number) {
  return statusMap[status as keyof typeof statusMap]?.color || 'gray'
}

function handleView(row: any) {
  getInspectionTaskItemDetail({ taskId: props.detail.id, itemId: row.id }).then((res) => {
    modalRef.value.openModal({
      ...res.data,
      stationId: props.detail.stationId || ''
    })
  })
}

function handleCancel() {
  emit('update:visible', false)
  emit('cancel')
}
</script>

<style scoped lang="scss">
.inspection-test-drawer {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
