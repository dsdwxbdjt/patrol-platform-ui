import http from '@/utils/http'

const BASE_URL = '/api/station'

export type StationInfo = {
  id: string
  name: string
  city: string
  district: string
  street: string
  address: string
  managerName: string
  managerPhone: string
  riderCount: number
  onlineRiderCount: number
  dailyOrderCount: number
  batteryStationNum: number
  batteryStatus: number
  status: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type StationListQuery = {
  page?: number
  pageSize?: number
  name?: string
  city?: string
  district?: string
}

/** @desc 查询站点信息列表 */
export function stationList(query?: StationListQuery) {
  return http.get<StationInfo[]>(`${BASE_URL}/list`, query)
}

/** @desc 删除站点信息 */
export function deleteStation(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 新增站点信息 */
export function addStation(data: any) {
  return http.post(`${BASE_URL}/add`, data)
}

/** @desc 编辑站点信息 */
export function editStation(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 获取站点详情 */
export function getStationDetail(id: string) {
  return http.get(`${BASE_URL}/${id}`)
}

