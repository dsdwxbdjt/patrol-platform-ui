import http from '@/utils/http'

const BASE_URL = '/api/battery'

export type BatteryStationInfo = {
  id: string
  name: string
  deviceSn: string
  lat?: number
  lng?: number
  status?: string
  remark?: string
  stationId: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type BatteryBoxInfo = {
  id: string
  batteryCabinetId: string
  boxNo: string
  powerLevel: number
  remark?: string
  status?: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type BatteryStationDetail = BatteryStationInfo & {
  boxList: {
    list: BatteryBoxInfo[]
    total: number
  }
}

export type BatteryStationListQuery = {
  page?: number
  size?: number
  name?: string
  deviceSn?: string
}

export type BatteryBoxListQuery = {
  page?: number
  size?: number
}

/** @desc 查询电池柜列表 */
export function batteryStationList(query?: BatteryStationListQuery) {
  return http.post(`${BASE_URL}/list`, query)
}

/** @desc 删除电池柜 */
export function deleteBatteryStation(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 新增电池柜 */
export function addBatteryStation(data: any) {
  return http.post(`${BASE_URL}/add`, data)
}

/** @desc 编辑电池柜 */
export function editBatteryStation(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 获取电池柜详情 */
export function getBatteryStationDetail(id: string) {
  return http.get<BatteryStationDetail>(`${BASE_URL}/${id}`)
}

/** @desc 新增电池仓 */
export function addBatteryBox(data: any) {
  return http.post(`${BASE_URL}/addBox`, data)
}

/** @desc 查询电池仓列表 */
export function batteryBoxList(cabinetId: string, query?: BatteryBoxListQuery) {
  return http.post(`${BASE_URL}/boxList/${cabinetId}`, query)
}

/** @desc 删除电池仓 */
export function deleteBatteryBox(id: string) {
  return http.del(`${BASE_URL}/box/${id}`)
}

/** @desc 获取电池仓详情 */
export function getBatteryBoxDetail(id: string) {
  return http.get<BatteryBoxInfo>(`${BASE_URL}/box/${id}`)
}

/** @desc 编辑电池仓 */
export function editBatteryBox(data: any, id: string) {
  return http.put(`${BASE_URL}/box/${id}`, data)
}
