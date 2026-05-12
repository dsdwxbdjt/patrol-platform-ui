import http from '@/utils/http'

const BASE_URL = '/api/user'

/** @desc 查询用户列表 */
export function getUserList(query?: any) {
  return http.get(`${BASE_URL}/list`, query)
}

/** @desc 用户绑定站点 */
export function addUserStation(id: string, query?: any) {
  return http.get(`${BASE_URL}/bind-site/${id}`, query)
}

/** @desc 用户解绑站点 */
export function unBindUserStation(id: string, query?: any) {
  return http.del(`${BASE_URL}/un-bind-site/${id}`, query)
}