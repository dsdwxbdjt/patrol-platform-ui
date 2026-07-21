<template>
  <div :style="modelType === 'link' ? 'display: inline-block' : 'width: 100%'">
    <a-input
      v-if="modelType === 'input'"
      v-model="inputDisplay"
      placeholder="请选择巡检项"
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
      :disabled="isDisabled"
      @click="visible = true"
    >
      {{ buttonName }}
    </a-link>
    
    <a-modal
      v-model:visible="visible"
      v-if="visible"
      title="选择巡检项"
      width="90%"
      :footer="false"
      :mask-closable="true"
    >
      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
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
                  @change="changeSelectAll"
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
              <template #type="{ record }">
                <GiCellTag :value="record.type" :dict="check_type" />
              </template>
            </GiTable>
          </a-card>
        </a-col>

        <a-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
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
              <template #type="{ record }">
                <GiCellTag :value="record.type" :dict="check_type" />
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
import { getInspectionItemList, type InspectionItemInfo } from "@/apis/inspection-item/inspection-item";
import { useDict } from "@/hooks/app";

defineOptions({ name: "InspectionItemSelect" });

const emit = defineEmits<{
  (e: "update:value", value: any): void;
  (e: "select-item", value: any[]): void;
}>();
const props = defineProps<{
  multiple?: boolean;
  modelType?: string;
  buttonName?: string;
  isDisabled?: boolean;
  roleId?: string;
  inputItems?: any;
}>();

const multiple = computed<boolean>(() => props.multiple ?? true);
const modelType = computed<string>(() => props.modelType ?? "input");
const buttonName = computed<string>(() => props.buttonName ?? "选择巡检项");
const isDisabled = computed<boolean>(() => props.isDisabled ?? false);
const inputItems = computed<any>(() => props.inputItems);
const inputDisplay = ref<string>("");
const isSelectAll = ref<boolean>(false);
const visible = ref<boolean>(false);
const { check_type } = useDict('check_type')

watch(
  () => props.inputItems,
  (newVal) => {
    if (newVal) {
      inputDisplay.value = newVal.map((item: any) => item.name).join(',')
    }
  },
  { deep: true, immediate: true }
)

type QueryForm = { name?: string; type?: number };
const [queryForm, resetForm] = useResetReactive<QueryForm>({
  name: undefined,
  type: undefined,
});

const queryFormColumns: ColumnItem[] = reactive([
  {
    type: 'input',
    label: '巡检项名称',
    field: 'name',
    span: { xs: 24, sm: 12, xxl: 9 },
    props: {
      placeholder: '请输入巡检项名称',
    },
  },
  {
    type: 'select',
    label: '类型',
    field: 'type',
    span: { xs: 24, sm: 12, xxl: 9 },
    props: {
      options: check_type,
      placeholder: '请选择类型',
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
  (page) => getInspectionItemList({ ...queryForm, ...page }),
  { immediate: false }
);

const selectedMap = ref<Record<string, InspectionItemInfo>>({});
const selectedList = computed<InspectionItemInfo[]>(() =>
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
  { title: "巡检项名称", dataIndex: "name", slotName: "name", width: 250, align: "left" },
  { title: "类型", dataIndex: "type", slotName: "type", width: 120, align: "center" },
  { title: "描述", dataIndex: "description", ellipsis: true, tooltip: true },
];

const selectedColumns: TableInstance["columns"] = [
  { title: "巡检项名称", dataIndex: "name", slotName: "name" },
  {
    title: "类型",
    dataIndex: "type",
    slotName: "type",
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

const isSelected = (record: InspectionItemInfo): boolean =>
  !!selectedMap.value[String(record.id)];

const computeIsSelectAll = () => {
  const list = Array.isArray(dataList.value)
    ? (dataList.value as InspectionItemInfo[])
    : [];
  isSelectAll.value =
    !!list.length && list.every((rec) => !!selectedMap.value[String(rec.id)]);
};

const toggleSelect = (record: InspectionItemInfo, checked: boolean) => {
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
  for (const rec of dataList.value as InspectionItemInfo[]) {
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
  for (const rec of dataList.value as InspectionItemInfo[]) {
    const id = String(rec.id);
    if (id && map[id]) delete map[id];
  }
  selectedMap.value = map;
  emitSelected();
  computeIsSelectAll();
};

const removeSelected = (record: InspectionItemInfo) => {
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
  emit("select-item", selectedList.value);
  visible.value = false;
};
const changeSelectAll = (selectAll: boolean) => {
  if (selectAll) selectAllPage();
  else clearAllPage();
};
const reset = () => {
  resetForm();
  search();
};

watch(visible, (val) => {
  if (val) {
    const preSelected = Array.isArray(inputItems.value) ? inputItems.value : []
    if (preSelected.length) {
      if (!multiple.value) {
        const first = preSelected[0]
        const id = String(first?.id ?? '')
        if (id) selectedMap.value = { [id]: first as InspectionItemInfo }
      } else {
        const map: Record<string, InspectionItemInfo> = {}
        for (const s of preSelected as InspectionItemInfo[]) {
          const id = String((s as any)?.id ?? '')
          if (id) map[id] = s
        }
        selectedMap.value = map
      }
    }
    search()
  } else {
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