import type { RouteRecordRaw } from 'vue-router'

/** 默认布局 */
const Layout = () => import('@/layout/index.vue')

/** 系统路由 */
export const systemRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { hidden: true },
  },
  {
    path: '/',
    name: 'StationRoot',
    component: Layout,
    redirect: '/station',
    meta: { title: '站点信息管理', icon: 'dashboard', hidden: false },
    children: [
      {
        path: '/station',
        name: 'Station',
        component: () => import('@/views/station/index.vue'),
        meta: { title: '站点列表', icon: 'desktop', hidden: false, affix: true },
      },
      {
        path: '/station/:id',
        name: 'StationDetail',
        component: () => import('@/views/station/detail/index.vue'),
        meta: { title: '站点详情', hidden: true, affix: true },
      },
    ],
  },
  {
    path: '/user-info',
    name: 'UserInfo',
    component: Layout,
    meta: { title: '用户管理', icon: 'dashboard', hidden: false },
    children: [
      {
        path: '/user-info',
        name: 'UserInfo',
        component: () => import('@/views/user-info/index.vue'),
        meta: { title: '用户管理', icon: 'desktop', hidden: false, affix: true },
      },
    ],
  },
  {
    path: '/ai',
    name: 'Ai',
    component: Layout,
    meta: { title: 'AI探访工作台', icon: 'dashboard', hidden: false },
    children: [
      {
        path: '/ai',
        name: 'Ai',
        component: () => import('@/views/ai/index.vue'),
        meta: { title: 'AI探访工作台', icon: 'desktop', hidden: false, affix: true },
      },
    ],
  },
  {
    path: '/order',
    name: 'Order',
    component: Layout,
    meta: { title: '工单管理', icon: 'dashboard', hidden: false },
    children: [
      {
        path: '/order',
        name: 'Order',
        component: () => import('@/views/order/index.vue'),
        meta: { title: '工单管理', icon: 'desktop', hidden: false, affix: true },
      },
    ],
  },
  {
    path: '/battery',
    name: 'Battery',
    component: Layout,
    meta: { title: '电池管理', icon: 'dashboard', hidden: false },
    children: [
      {
        path: '/battery',
        name: 'Battery',
        component: () => import('@/views/battery/index.vue'),
        meta: { title: '电池管理', icon: 'desktop', hidden: false, affix: true },
      },
    ],
  },
  {
    path: '/battery-detail/:id',
    name: 'BatteryDetail',
    component: Layout,
    meta: { title: '电池详情', icon: 'dashboard', hidden: true },
    children: [
      {
        path: '/battery-detail/:id',
        name: 'BatteryDetail',
        component: () => import('@/views/battery/detail/index.vue'),
        meta: { title: '电池详情', icon: 'desktop', hidden: false, affix: true },
      },
    ],
  },
  {
    path: '/social/callback',
    component: () => import('@/views/login/social/index.vue'),
    meta: { hidden: true },
  },
  {
    path: '/pwdExpired',
    component: () => import('@/views/login/pwdExpired/index.vue'),
    meta: { hidden: true },
  },
  {
    path: '/user',
    name: 'User',
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: '/user/profile',
        name: 'UserProfile',
        component: () => import('@/views/user/profile/index.vue'),
        meta: { title: '个人中心', showInTabs: false },
      },
      {
        path: '/user/message',
        name: 'UserMessage',
        component: () => import('@/views/user/message/index.vue'),
        meta: { title: '消息中心', showInTabs: false },
      },
      {
        path: '/user/notice',
        name: 'UserNotice',
        component: () => import('@/views/user/message/components/view/index.vue'),
        meta: { title: '查看公告' },
      },
    ],
  }
]

// 固定路由（默认路由）
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/redirect',
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/default/redirect/index.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/default/error/404.vue'),
    meta: { hidden: true },
  },
  {
    path: '/403',
    component: () => import('@/views/default/error/403.vue'),
    meta: { hidden: true },
  },
]
