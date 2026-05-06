import type * as T from './type'
import http from '@/utils/http'

export type * from './type'

const BASE_URL = '/api/auth'

const login = (req: T.AccountLoginReq | T.PhoneLoginReq | T.EmailLoginReq, tenantCode?: string) => {
  const headers = {}
  if (tenantCode) {
    headers['X-Tenant-Code'] = tenantCode
  }
  return http.post<T.LoginResp>(`${BASE_URL}/login`, req, {
    headers,
  })
}

/** @desc 账号登录 */
export function accountLogin(req: T.AccountLoginReq) {
  return login(req)
}

/** @desc 邮箱登录 */
export function emailLogin(req: T.EmailLoginReq) {
  return login(req)
}

/** @desc 手机号登录 */
export function phoneLogin(req: T.PhoneLoginReq) {
  return login(req)
}

/** @desc 三方账号登录 */
export function socialLogin(req: any) {
  return http.post<T.LoginResp>(`${BASE_URL}/login`, req)
}

/** @desc 三方账号登录授权 */
export function socialAuth(source: string) {
  return http.get<T.SocialAuthAuthorizeResp>(`${BASE_URL}/${source}`)
}

/** @desc 退出登录 */
export function logout() {
  return http.post(`${BASE_URL}/logout`)
}

/** @desc 获取用户信息 */
export const getUserInfo = () => {
  return http.get<T.UserInfo>(`${BASE_URL}/info`)
}

