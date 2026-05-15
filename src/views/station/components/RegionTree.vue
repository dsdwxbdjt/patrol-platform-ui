<template>
  <div class="left-wrap">
    <div class="search">
      <a-input placeholder="搜索区域名称" allow-clear>
        <template #prefix><icon-search /></template>
      </a-input>
    </div>
    <a-tree
      v-if="treeData.length > 0"
      ref="treeRef" 
      :data="treeData" 
      show-line 
      block-node 
      :field-names="{ key: 'id',title: 'name',children: 'children' }" 
      :selected-keys="selectedKeys"
      :default-expanded-keys="['3301']"
      @select="select"
    >
      <template #switcher-icon="node">
        <IconCaretDown v-if="(node.children.length !== 0)" />
        <IconHome v-else style="color: #15C105FF;" />
      </template>
      <template #extra="node">
        <span style="margin-right: 10px;">{{ node.totalSiteCount }}</span>
      </template>
    </a-tree>
  </div>
</template>

<script lang="ts" setup>
import { getRegionTree } from '@/apis'
import { ref, onMounted } from 'vue'

const treeData = ref<any[]>([])
const emit = defineEmits(['select'])
const selectedKeys = ref()
const select = (keys: Array<any>) => {
  selectedKeys.value = keys
  emit('select', keys)
}

onMounted(() => {
  getData()
})

const getData = () => {
  getRegionTree().then((res: any) => {
    treeData.value = res.data || []
  })
}

defineExpose({
  getData
})
</script>

<style scoped lang="scss">
.left-wrap{
  height: 100%;
  overflow: auto;
 .search{
    margin-bottom: 10px;
  }
}
</style>
