<template>
  <div style="width: 100%">
    <a-input
      v-if="modelType === 'input'"
      v-model:value="inputDisplay"
      v-model="inputDisplay"
      placeholder="请选择站点"
      readonly
      style="width: 100%"
      @click="visible = true"
    >
      <template #suffix>
        <icon-search />
      </template>
    </a-input>

    <a-link
      v-else-if="modelType === 'link'"
      type="text"
      :disabled="isDisabled"
      @click="visible = true"
    >
      {{ buttonName }}
    </a-link>
    
    <a-modal
      v-model:visible="visible"
      v-if="visible"
      title="选择站点"
      width="80%"
      :footer="false"
      :mask-closable="true"
    >
      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :sm="16" :md="16" :lg="16" :xl="16">
          <a-card :bordered="false">
            <GiTable
              row-key="id"
              :data="dataList"
              :columns="selectColumns"
              :loading="loading"
              :scroll="{ x: '100%', y: '100%', minWidth: 700 }"
              :pagination="pagination"
              :disabled-tools="['size']"
              @refresh="search"
              :top-controls="false"
            >
              <template #top>
                <GiForm
                  v-model="queryForm"
                  search
                  :columns="queryFormColumns"
                  size="medium"
                  @search="search"
                  @reset="reset"
                />
              </template>
              <template #nameHeader>
                <a-checkbox
                  v-if="multiple"
                  v-model="isSelectAll"
                  @change="chagneSelectAll"
                  :value="true"
                ></a-checkbox>
                <span v-else>选择</span>
              </template>
              <template #select="{ record }">
                <a-radio
                  v-if="!multiple"
                  :model-value="isSelected(record)"
                  @change="toggleSelect(record, true)"
                />
                <a-checkbox
                  v-else
                  :model-value="isSelected(record)"
                  @change="toggleSelect(record, $event)"
                />
              </template>
              <template #name="{ record }">
                <span>{{ record.name }}</span>
              </template>
              <template #status="{ record }">
                <GiCellStatus :status="(record.status as 0 | 1)" />
              </template>
            </GiTable>
          </a-card>
        </a-col>

        <a-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
          <a-card :title="`已选择 ${selectedList.length} 条`" :bordered="false">
            <GiTable
              row-key="id"
              :data="selectedList"
              :columns="selectedColumns"
              :scroll="{ x: '100%', y: '100%', minWidth: 360 }"
              :disabled-tools="['size', 'columns', 'refresh']"
              :pagination="false"
              :top-controls="false"
            >
              <template #name="{ record }">
                <span>{{ record.name }}</span>
              </template>
              <template #status="{ record }">
                <GiCellStatus :status="(record.status as 0 | 1)" />
              </template>
              <template #action="{ record }">
                <a-link status="danger" @click="removeSelected(record)"
                  >移除</a-link
                >
              </template>
            </GiTable>

            <div style="text-align: right; margin-top: 12px">
              <a-space>
                <a-button @click="onClear">清空</a-button>
                <a-button type="primary" @click="onConfirm">确定</a-button>
              </a-space>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch } from "vue";
import type { ColumnItem } from "@/components/GiForm";
import type { TableInstance } from "@arco-design/web-vue";
import { useResetReactive, useTable } from "@/hooks";
import { stationList, type StationInfo } from "@/apis/station/station-info";
import { DisEnableStatusList } from "@/constant/common";

defineOptions({ name: "StationSelect" });

const emit = defineEmits<{
  (e: "update:value", value: any): void;
  (e: "select-station", value: any[]): void;
}>();
const props = defineProps<{
  multiple?: boolean;
  modelType?: string;
  buttonName?: string;
  isDisabled?: boolean;
  roleId?: string;
  inputStation?: any;
}>();

const multiple = computed<boolean>(() => props.multiple ?? true);
const modelType = computed<string>(() => props.modelType ?? "input");
const buttonName = computed<string>(() => props.buttonName ?? "选择站点");
const isDisabled = computed<boolean>(() => props.isDisabled ?? false);
const inputStation = computed<any>(() => props.inputStation);
const inputDisplay = ref<string>("");
const isSelectAll = ref<boolean>(false);
const visible = ref<boolean>(false);

watch(
  () => props.inputStation,
  (newVal) => {
    if (newVal) {
      inputDisplay.value = newVal.map((item: any) => item.name).join(',')
    }
  },
  { deep: true, immediate: true }
)

type QueryForm = { name?: string; status?: number };
const [queryForm, resetForm] = useResetReactive<QueryForm>({
  name: undefined,
  status: undefined,
});

const queryFormColumns: ColumnItem[] = reactive([
  {
    type: "input",
    label: "站点名称",
    field: "name",
    span: { xs: 24, sm: 12, xxl: 8 },
    props: { placeholder: "请输入站点名称" },
  },
  {
    type: "select",
    label: "状态",
    field: "status",
    span: { xs: 24, sm: 12, xxl: 8 },
    props: {
      options: DisEnableStatusList,
      placeholder: "请选择状态",
      allowClear: true,
    },
  },
]);

const {
  tableData: dataList,
  loading,
  pagination,
  search,
} = useTable(
  (page) => stationList({ ...queryForm, ...page } as any),
  { immediate: false }
);

const selectedMap = ref<Record<string, StationInfo>>({});
const selectedList = computed<StationInfo[]>(() =>
  Object.values(selectedMap.value)
);

const selectColumns: TableInstance["columns"] = [
  {
    title: "选择",
    dataIndex: "select",
    slotName: "select",
    titleSlotName: "nameHeader",
    width: 70,
    align: "center",
    fixed: "left",
  },
  { title: "站点名称", dataIndex: "name", slotName: "name", align: "left" },
  { title: "区县", dataIndex: "district", align: "center", width: 140 },
  { title: "街道", dataIndex: "street", align: "center", width: 140 },
  {
    title: "状态",
    dataIndex: "status",
    slotName: "status",
    align: "center",
    width: 100,
    fixed: "right",
  },
];

const selectedColumns: TableInstance["columns"] = [
  { title: "站点名称", dataIndex: "name", slotName: "name" },
  {
    title: "状态",
    dataIndex: "status",
    slotName: "status",
    align: "center",
    width: 100,
  },
  {
    title: "操作",
    dataIndex: "action",
    slotName: "action",
    width: 100,
    align: "center",
  },
];

const isSelected = (record: StationInfo): boolean =>
  !!selectedMap.value[String(record.id)];

const computeIsSelectAll = () => {
  const list = Array.isArray(dataList.value)
    ? (dataList.value as StationInfo[])
    : [];
  isSelectAll.value =
    !!list.length && list.every((rec) => !!selectedMap.value[String(rec.id)]);
};

const toggleSelect = (record: StationInfo, checked: boolean) => {
  const id = String(record.id);
  if (!id) return;
  if (!multiple.value) {
    selectedMap.value = checked ? { [id]: record } : {};
    emitSelected();
    return;
  }
  if (checked) selectedMap.value[id] = record;
  else delete selectedMap.value[id];
  emitSelected();
  computeIsSelectAll();
};

const selectAllPage = () => {
  if (!Array.isArray(dataList.value)) return;
  const map = { ...selectedMap.value };
  for (const rec of dataList.value as StationInfo[]) {
    const id = String(rec.id);
    if (id) map[id] = rec;
  }
  selectedMap.value = map;
  emitSelected();
  computeIsSelectAll();
};
const clearAllPage = () => {
  if (!Array.isArray(dataList.value)) return;
  const map = { ...selectedMap.value };
  for (const rec of dataList.value as StationInfo[]) {
    const id = String(rec.id);
    if (id && map[id]) delete map[id];
  }
  selectedMap.value = map;
  emitSelected();
  computeIsSelectAll();
};

const removeSelected = (record: StationInfo) => {
  const id = String(record.id);
  delete selectedMap.value[id];
  emitSelected();
  computeIsSelectAll();
};
const onClear = () => {
  selectedMap.value = {};
  isSelectAll.value = false;
  emitSelected();
};

const getEmitValue = (): string[] =>
  selectedList.value.map((u) => String(u.id));
const emitSelected = () => {
  
};

const onConfirm = () => {
  inputDisplay.value = selectedList.value
    .map((u) => u.name)
    .join(", ");
  const value = getEmitValue().join(', ')
  emit("update:value", value);
  emit("select-station", selectedList.value);
  visible.value = false;
};
const chagneSelectAll = (selectAll: boolean) => {
  if (selectAll) selectAllPage();
  else clearAllPage();
};
const reset = () => {
  resetForm();
  search();
};
watch(visible, (val) => {
  if (val) {
    const preSelected = Array.isArray(inputStation.value) ? inputStation.value : []
    if (preSelected.length) {
      if (!multiple.value) {
        const first = preSelected[0]
        const id = String(first?.id ?? '')
        if (id) selectedMap.value = { [id]: first as StationInfo }
      } else {
        const map: Record<string, StationInfo> = {}
        for (const s of preSelected as StationInfo[]) {
          const id = String((s as any)?.id ?? '')
          if (id) map[id] = s
        }
        selectedMap.value = map
      }
    }
    search()
  } else {
    // 弹窗关闭，恢复初始状态
    resetForm()
    selectedMap.value = {}
    isSelectAll.value = false
    pagination.current = 1
  }
})

watch(dataList, () => computeIsSelectAll());
watch(selectedMap, () => computeIsSelectAll(), { deep: true });

defineExpose({ onClearSelected: () => onClear() });
</script>

<style scoped>
:deep(.arco-table-content) {
  height: 65vh;
}
</style>
