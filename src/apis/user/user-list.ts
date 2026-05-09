import http from '@/utils/http'

const BASE_URL = '/api/user'

/** @desc 查询用户列表 */
export function getUserList(query?: any) {
  return http.get(`${BASE_URL}/list`, query)
}