import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { useTenantStore } from './tenant'
import { resetRouter } from '@/router'
import {
  type AccountLoginReq,
  accountLogin as accountLoginApi,
  getUserInfo as getUserInfoApi,
} from '@/apis'
import { clearToken, getToken, setToken } from '@/utils/auth'
import { resetHasRouteFlag } from '@/router/guard'

const storeSetup = () => {
  const tenantStore = useTenantStore()
  const userInfo = ref<any>({})
  const nickname = computed(() => userInfo.value.nickname)
  const username = computed(() => userInfo.value.username)
  const avatar = computed(() => userInfo.value.avatar)

  const token = ref(getToken() || '')
  const pwdExpiredShow = ref<boolean>(true)
  const roles = ref<string[]>([]) // 当前用户角色
  const permissions = ref<string[]>([]) // 当前角色权限标识集合
  // 重置token
  const resetToken = () => {
    token.value = ''
    clearToken()
    resetHasRouteFlag()
  }

  // 登录
  const accountLogin = async (req: AccountLoginReq) => {
    const res = await accountLoginApi({ ...req })
    userInfo.value = res.data.userInfo
    setToken(res.data.token)
    token.value = res.data.token
  }

  // 退出登录回调
  const logoutCallBack = async () => {
    roles.value = []
    permissions.value = []
    pwdExpiredShow.value = true
    resetToken()
    resetRouter()
    tenantStore.resetTenantId()
  }

  // 退出登录
  const logout = async () => {
    try {
      await logoutCallBack()
      return true
    } catch (error) {
      return false
    }
  }

  // 获取用户信息
  const getInfo = async () => {
    const res = await getUserInfoApi()
    userInfo.value = res.data
  }

  return {
    userInfo,
    nickname,
    username,
    avatar,
    token,
    roles,
    permissions,
    pwdExpiredShow,
    accountLogin,
    logout,
    logoutCallBack,
    getInfo,
    resetToken,
  }
}

export const useUserStore = defineStore('user', storeSetup, {
  persist: { paths: ['token', 'roles', 'permissions', 'pwdExpiredShow', 'userInfo'], storage: localStorage },
})
