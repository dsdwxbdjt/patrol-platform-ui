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
        meta: { title: '站点信息', icon: 'desktop', hidden: false, affix: true },
      },
      {
        path: '/user-info',
        name: 'UserInfo',
        component: () => import('@/views/user-info/index.vue'),
        meta: { title: '用户管理', icon: 'desktop', hidden: false, affix: true },
      },
      {
        path: '/order',
        name: 'Order',
        component: () => import('@/views/order/index.vue'),
        meta: { title: '工单管理', icon: 'desktop', hidden: false, affix: true },
      },
      {
        path: '/battery',
        name: 'Battery',
        component: () => import('@/views/battery/index.vue'),
        meta: { title: '换电站信息', icon: 'desktop', hidden: false, affix: true },
      },
      {
        path: '/dict',
        name: 'Dict',
        component: () => import('@/views/dict/index.vue'),
        meta: { title: '字典管理', icon: 'desktop', hidden: false, affix: true },
      },
      {
        path: '/battery-detail/:id',
        name: 'BatteryDetail',
        component: () => import('@/views/battery/detail/index.vue'),
        meta: { title: '电池详情', icon: 'desktop', hidden: true, affix: true },
      },
      {
        path: '/station/:id',
        name: 'StationDetail',
        component: () => import('@/views/station/detail/index.vue'),
        meta: { title: '站点详情', hidden: true, affix: true },
      },
      {
        path: '/inspection-item',
        name: 'InspectionItem',
        component: () => import('@/views/inspection/inspection-item/index.vue'),
        meta: { title: '巡检项管理', icon: 'desktop', hidden: false, affix: true },
      },
      {
        path: '/inspection-plan',
        name: 'InspectionPlan',
        component: () => import('@/views/inspection/inspection-plan/index.vue'),
        meta: { title: '巡检计划管理', icon: 'desktop', hidden: false, affix: true },
      },
      {
        path: '/inspection-plan/detail/:id',
        name: 'InspectionPlanDetail',
        component: () => import('@/views/inspection/inspection-plan/detail/index.vue'),
        meta: { title: '巡检计划详情', icon: 'desktop', hidden: true, affix: true },
      },
    ],
  },
  {
    path: '/ai',
    name: 'Ai',
    component: Layout,
    meta: { title: 'Agent调试器', icon: 'dashboard', hidden: false },
    children: [
      {
        path: '/ai',
        name: 'Ai',
        component: () => import('@/views/ai/index.vue'),
        meta: { title: 'Agent调试器', icon: 'desktop', hidden: false, affix: true },
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
