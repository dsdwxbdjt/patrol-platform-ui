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
