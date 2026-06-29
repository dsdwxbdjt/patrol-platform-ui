<template>
  <div style="display: flex;gap: 4px;">
    <a-input placeholder="搜索字典名称/编码" @input="filterTree" allow-clear>
      <template #prefix><icon-search /></template>
    </a-input>
    <a-button type="primary" style="flex-shrink: 0" @click="treeTypeAdd">
      <template #icon>
        <icon-plus />
      </template>
    </a-button>
  </div>
  <a-tree show-line block-node :field-names="{ key: 'id', title: 'name' }" :data="dictTree" :selected-keys="selectedKeys" @select="onMenuItemClick">
    <template #title="item">
      <a-typography-paragraph :ellipsis="{
        rows: 1,
        showTooltip: true,
        css: true,
      }">
        {{ item.name }} ({{ item.code }})
      </a-typography-paragraph>
    </template>
    <template #extra="node">
      <a-dropdown>
        <icon-more class="action" />
        <template #content>
          <a-doption @click="editDict(node)">编辑</a-doption>
          <a-doption @click="deleteDict(node)" style="color:red">删除</a-doption>
        </template>
      </a-dropdown>
    </template>
  </a-tree>
  <DictTypeModal ref="dictTypeModalRef" @hasSubmitted="getDictTree" />
</template>

<script setup lang="ts">
import { getDictTypeList, deleteDictType } from '@/apis'
import DictTypeModal from './dict-type-modal.vue'
import { Message, Modal } from '@arco-design/web-vue'


const dictTree = ref()
const dictTotalData = ref()
const selectedKeys = ref<string[]>([])
const dictTypeModalRef = ref()
const emit = defineEmits(['select'])

async function getDictTree() {
  const res = await getDictTypeList()
  if (res.success) {
    dictTotalData.value = res.data || []
    dictTree.value = dictTotalData.value
    if (dictTree.value?.length > 0) {
      const firstItem = dictTree.value[0]
      selectedKeys.value = [firstItem.id]
      emit('select', firstItem)
    }
  }
}

function onMenuItemClick(keys) {
  selectedKeys.value = keys
  const selectItem = dictTotalData.value.find((item: any) => item.id === keys[0])
  emit('select', selectItem)
}

function filterTree(item) {
  const keyword = item.toLowerCase()
  dictTree.value = dictTotalData.value.filter(row => row.name?.toLowerCase().includes(keyword) || row.code?.toLowerCase().includes(keyword))
  if (!item) {
    dictTree.value = dictTotalData.value
  }
  if (dictTree.value?.length > 0) {
    const isValidSelected = dictTree.value.some((item: any) => selectedKeys.value.includes(item.id))
    if (!isValidSelected) {
      const firstItem = dictTree.value[0]
      selectedKeys.value = [firstItem.id]
      emit('select', firstItem)
    }
  }
}

function treeTypeAdd() {
  dictTypeModalRef.value.open()
}

function editDict(node) {
  dictTypeModalRef.value.open(node)
}

async function deleteDict(node) {
  Modal.warning({
    title: '提示',
    content: `是否确定删除字典「${node.name}」？`,
    hideCancel: false,
    okButtonProps: { status: 'danger' },
    onBeforeOk: async () => {
      const res = await deleteDictType(node.id)
      console.log(res);
      if (res.success) {
        Message.success('删除成功')
        await getDictTree()
      }
    },
  })
}


onMounted(() => {
  getDictTree()
})
</script>

<style scoped lang="scss"></style>