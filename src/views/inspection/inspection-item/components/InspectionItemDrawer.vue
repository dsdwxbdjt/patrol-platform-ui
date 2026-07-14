<template>
  <a-drawer
    :title="`巡检项详情 - ${currentItem?.name || ''}`"
    :visible.sync="visible"
    width="600px"
    @cancel="close"
  >
    <a-descriptions :column="1" border>
      <a-descriptions-item label="巡检项名称">{{ currentItem?.name }}</a-descriptions-item>
      <a-descriptions-item label="类型">
        <a-tag :color="getTypeColor(currentItem?.type)">{{ getTypeText(currentItem?.type) }}</a-tag>
      </a-descriptions-item>
      <a-descriptions-item label="描述">{{ currentItem?.description || '-' }}</a-descriptions-item>
      <a-descriptions-item label="备注">{{ currentItem?.remark || '-' }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ currentItem?.createdAt }}</a-descriptions-item>
      <a-descriptions-item label="更新时间">{{ currentItem?.updatedAt }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getInspectionItemDetail, type InspectionItemInfo } from '@/apis/inspection-item/inspection-item'

defineOptions({ name: 'InspectionItemDrawer' })

const visible = ref(false)
const currentItem = ref<InspectionItemInfo | null>(null)

const typeMap: Record<number, { text: string; color: string }> = {
  1: { text: '普通检查', color: 'blue' },
  2: { text: '故障检查', color: 'red' },
  3: { text: '安全检查', color: 'orange' },
  4: { text: '其他检查', color: 'gray' },
}

const onOpen = async (id: string) => {
  const res = await getInspectionItemDetail(id)
  if (res?.success) {
    currentItem.value = res.data
  }
  visible.value = true
}

function getTypeText(type?: number) {
  return typeMap[type as keyof typeof typeMap]?.text || '未知'
}

function getTypeColor(type?: number) {
  return typeMap[type as keyof typeof typeMap]?.color || 'gray'
}

function close() {
  visible.value = false
  currentItem.value = null
}

defineExpose({ onOpen })
</script>
