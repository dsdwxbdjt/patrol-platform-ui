import http from '@/utils/http'

const BASE_URL = '/api/order'

export type OrderInfo = {
  id: string
  title: string
  description?: string
  stationId: string
  inspectorId: string
  inspectionTime: string
  status?: number
  level: number
  problemPhoto?: string
  problemPhotos?: any[]
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  station?: any
  inspector?: any
}

export type OrderListQuery = {
  page?: number
  size?: number
  status?: string
  title?: string
}

export type OrderCreateData = {
  title: string
  description?: string
  stationId: string
  inspectorId: string
  inspectionTime: string
  status?: number
  level: number
  problemPhoto?: string
}

/** @desc 查询工单列表 */
export function orderList(query?: OrderListQuery) {
  return http.get<any>(`${BASE_URL}/list`, query)
}

/** @desc 删除工单 */
export function deleteOrder(id: string) {
  return http.del(`${BASE_URL}/delete/${id}`)
}

/** @desc 新增工单 */
export function addOrder(data: OrderCreateData) {
  return http.post(`${BASE_URL}/create`, data)
}

/** @desc 编辑工单 */
export function editOrder(data: OrderCreateData, id: string) {
  return http.put(`${BASE_URL}/update/${id}`, data)
}

/** @desc 获取工单详情 */
export function getOrderDetail(id: string) {
  return http.get<OrderInfo>(`${BASE_URL}/detail/${id}`)
}
