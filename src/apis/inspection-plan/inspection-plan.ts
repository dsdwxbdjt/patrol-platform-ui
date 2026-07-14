import http from '@/utils/http'

const BASE_URL = '/api/inspection'

export type InspectionPlanInfo = {
  id: string
  name: string
  planDate: string
  endDate: string
  status: number
  remark?: string
  creatorId?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  tasks?: InspectionTaskInfo[]
}

export type InspectionTaskInfo = {
  id: string
  planId: string
  stationsId: string
  stations?: any
  status: number
  startTime?: string
  endTime?: string
  remark?: string
  createdAt: string
  updatedAt: string
  inspectionTaskItems?: InspectionTaskItemInfo[]
}

export type InspectionTaskItemInfo = {
  id: string
  taskId: string
  inspectionItemId: string
  inspectionItem?: any
  result: number
  remark?: string
  photo?: string
  checkAt?: string
  checkerId?: string
  workOrderId?: string
}

export type InspectionPlanListQuery = {
  page?: number
  size?: number
}

/** @desc 创建巡检计划 */
export function createInspectionPlan(data: any) {
  return http.post(`${BASE_URL}/plan`, data)
}

/** @desc 获取巡检计划详情 */
export function getInspectionPlanDetail(id: string) {
  return http.get(`${BASE_URL}/plan/${id}`)
}

/** @desc 获取巡检计划列表 */
export function getInspectionPlanList(query?: InspectionPlanListQuery) {
  return http.get(`${BASE_URL}/plan`, query)
}
