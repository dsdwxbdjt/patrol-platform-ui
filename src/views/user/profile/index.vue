<template>
  <div class="gi_page">
    <a-row wrap :gutter="[16, 16]" align="stretch">
      <a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" :xxl="24">
        <BasicInfo />
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import BasicInfo from './BasicInfo.vue'

defineOptions({ name: 'UserProfile' })
</script>

<style scoped lang="scss">
.gi_page {
  background-color: var(--color-bg-1);
}
</style>
