<template>
  <div class="module-name">
    {{ moduleName }}
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  moduleName: {
    type: String,
    default: '名称'
  }
})

const moduleName = ref(props.moduleName)
</script>

<style scoped lang="scss">
.module-name {
  font-size: 16px;
  font-weight: 500;
  color: #121314;
  display: flex;
  align-items: center;
  background-color: var(--color-primary-light-1);
  padding: 4px 0px;

  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 16px;
    background-color: var(--color-primary-light-4);
    margin-right: 8px;
  }
}
</style>
