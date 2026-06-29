import { ref, onMounted, type Ref } from 'vue'
import { getDictTypeList, getDictItemList } from '@/apis'

interface DictOption {
  label: string
  value: string
  tag?: string
}

type DictRecord<T extends readonly string[]> = {
  [K in T[number]]: Ref<DictOption[]>
}

export function useDict<T extends string>(...codes: T[]) {
  const dictRefs = {} as DictRecord<typeof codes>
  const loading = ref(false)

  codes.forEach(code => {
    dictRefs[code as T] = ref<DictOption[]>([]) as Ref<DictOption[]>
  })

  const fetchDict = async () => {
    try {
      loading.value = true
      for (const code of codes) {
        const dict = await getDictTypeList({ code })
        const dictItem = await getDictItemList(dict.data[0].id || '')
        if (dictRefs[code as T]) {
          dictRefs[code as T].value = dictItem.data.map((item: any) => ({
            label: item.label,
            value: item.value,
            extra: item.extra,
          }))
        }
      }
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchDict()
  })

  return {
    ...dictRefs,
    loading,
    refresh: fetchDict,
  } as typeof dictRefs & {
    loading: typeof loading
    refresh: typeof fetchDict
  }
}
