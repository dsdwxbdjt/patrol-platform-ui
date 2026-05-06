<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '@/stores'

const appStore = useAppStore()

onMounted(() => {

})
</script>

<template>
  <div v-show="!appStore.menuCollapse" class="wwads-container">
    <div class="wwads-cn wwads-vertical" data-id="359" style="max-width: 180px"></div>
  </div>
</template>

<style>
.wwads-container {
  padding: 1px 15px 10px;
  margin-top: 20px;
  background-color: var(--color-fill-2);
}
.wwads-vertical {
  background-color: transparent !important;
}
.wwads-text {
  color: var(--color-text-2) !important;
}
</style>
