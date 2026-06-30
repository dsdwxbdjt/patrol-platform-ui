<template>
  <a-input placeholder="请选择地址" @focus="openMapSelect" v-model="selectCenter" />
  <a-modal title="选择地址" :visible.sync="visible" width="80%" @ok="handleOk" @cancel="handleCancel">
    <div id="map"></div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import * as maptalks from 'maptalks';
import 'maptalks/dist/maptalks.css';

const visible = ref(false)
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

watch(
  () => props.modelValue,
  (val) => {
    selectCenter.value = val
  }
)

const selectCenter = ref(props.modelValue)
const emit = defineEmits(['update:modelValue'])
const map = ref<any>(null)
let layer: maptalks.VectorLayer | null = null
let marker: maptalks.Marker | null = null

function openMapSelect() {
  visible.value = true
  const center = props.modelValue
    ? props.modelValue.split(',').map(Number) as number[]
    : [120.111065, 30.27846]

  map.value = new maptalks.Map('map', {
    center,
    zoom: 14,
    baseLayer: new maptalks.TileLayer('base', {
      urlTemplate: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      subdomains: ['a', 'b', 'c', 'd'],
    })
  });

  layer = new maptalks.VectorLayer('markerLayer').addTo(map.value);

  // 初始化：如果有坐标，自动渲染标记
  if (props.modelValue) {
    marker = new maptalks.Marker(center, {
      symbol: {
        markerFile: '/static/images/icon/location.png',
        markerWidth: 36,
        markerHeight: 36,
        markerDy: -18
      }
    }).addTo(layer!);
  }

  // 点击覆盖旧标记
  map.value.on('click', (e) => {
    const coord = e.coordinate;
    if (marker) {
      marker.remove()
    }
    marker = new maptalks.Marker(coord, {
      symbol: {
        markerFile: '/static/images/icon/location.png',
        markerWidth: 36,
        markerHeight: 36,
        markerDy: -18
      }
    }).addTo(layer!);

    selectCenter.value = coord.x.toFixed(6) + ',' + coord.y.toFixed(6)
    emit('update:modelValue', selectCenter.value)
  })
}

function handleOk() {
  visible.value = false
  map.value?.remove()
}

function handleCancel() {
  visible.value = false
  map.value?.remove()
}
</script>

<style scoped lang="scss">
#map {
  height: 70vh;
  width: 100%;
}
</style>