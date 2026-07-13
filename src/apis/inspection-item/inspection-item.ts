import http from '@/utils/http'

const BASE_URL = '/api/inspection-item'

export type InspectionItemInfo = {
  id: string
  name: string
  type: number
  description: string
  remark: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  workOrderId: string | null
}

export type InspectionItemListQuery = {
  page?: number
  pageSize?: number
  name?: string
  type?: number
}

/** @desc 查询巡检项列表 */
export function getInspectionItemList(query?: InspectionItemListQuery) {
  return http.get<InspectionItemInfo[]>(`${BASE_URL}/list`, query)
}

/** @desc 删除巡检项 */
export function deleteInspectionItem(id: string) {
  return http.del(`${BASE_URL}/delete/${id}`)
}

/** @desc 新增巡检项 */
export function createInspectionItem(data: any) {
  return http.post(`${BASE_URL}/create`, data)
}

/** @desc 编辑巡检项 */
export function updateInspectionItem(data: any, id: string) {
  return http.put(`${BASE_URL}/update/${id}`, data)
}

/** @desc 获取巡检项详情 */
export function getInspectionItemDetail(id: string) {
  return http.get(`${BASE_URL}/detail/${id}`)
}
