import http from '@/utils/http'

const BASE_URL = '/api/dict'

export type DictTypeCreateInput = {
  id?: string;
  name: string;
  code: string;
  remark?: string;
}

export type DictItemCreateInput = {
  dictTypeId: string;
  label: string;
  value: string;
  remark?: string;
  tag?: string;
}

export type DictItemUploadInput = {
  label: string;
  value: string;
  remark?: string;
  tag?: string;
}

export function createDictType(input: DictTypeCreateInput) {
  return http.post<DictTypeCreateInput>(`${BASE_URL}/type`, input)
}

export function deleteDictType(id: string) {
  return http.del(`${BASE_URL}/type/${id}`)
}

export function updateDictType(data: DictTypeCreateInput, id: string) {
  return http.put<DictTypeCreateInput>(`${BASE_URL}/type/${id}`, data)
}

export function getDictTypeList() {
  return http.get<DictTypeCreateInput[]>(`${BASE_URL}/type-list`)
}

export function getDictTypeDetail(id: string) {
  return http.get<DictTypeCreateInput>(`${BASE_URL}/type-detail/${id}`)
}


export function createDictItem(input: DictItemCreateInput) {
  return http.post<DictItemCreateInput>(`${BASE_URL}/item`, input)
}

export function deleteDictItem(itemId: string) {
  return http.del(`${BASE_URL}/item/${itemId}`)
}

export function updateDictItem(input: DictItemUploadInput, id: string) {
  return http.put<DictItemUploadInput>(`${BASE_URL}/item/${id}`, input)
}

export function getDictItemList(dictTypeId: string) {
  return http.get<DictItemCreateInput[]>(`${BASE_URL}/item-list/${dictTypeId}`)
}

export function getDictItemDetail(itemId: string) {
  return http.get<DictItemCreateInput>(`${BASE_URL}/item-detail/${itemId}`)
}
