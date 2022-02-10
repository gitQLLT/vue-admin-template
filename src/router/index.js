import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'
import detailLayout from '@/layout/detailLayout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/createform',
    component: () => import('@/views/CreateForm/index'),
    hidden: true
  },

  {
    path: '/test',
    component: () => import('@/views/CreateForm/test'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/mineinfo',
    children: [{
      path: 'mineinfo',
      name: 'MineInfo',
      component: () => import('@/views/MineInfo/index'),
      meta: { title: '我的消息', icon: 'selfCenter', affix: true }
    }]
  },

  {
    path: '/overview',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Overview',
        component: () => import('@/views/OverviewList/index'),
        meta: { title: '物料概览', icon: 'payable-manage' }
      }
    ]
  },

  {
    path: '/upload',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'UploadExcel',
        component: () => import('@/views/OverviewList/uploadExcel'),
        meta: { title: '导入预览' },
        hidden: true
      }
    ]
  },

  {
    path: '/puchase',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Puchase',
        component: () => import('@/views/PuchaseList/index'),
        meta: { title: '采购列表', icon: 'order-manage' }
      }
    ]
  },

  {
    path: '/plansend',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'PlanSend',
        component: () => import('@/views/PlanSend/index'),
        meta: { title: '发货计划列表', icon: 'exception-handle' }
      }
    ]
  },

  {
    path: '/delivery',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Delivery',
        component: () => import('@/views/DeliveryList/index'),
        meta: { title: '交货列表', icon: 'product-manage' }
      }
    ]
  },

  {
    path: '/sendery',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Sendery',
        component: () => import('@/views/SenderyList/index'),
        meta: { title: '发货列表', icon: 'product-manage' }
      }
    ]
  },

  {
    path: '/return',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Return',
        component: () => import('@/views/ReturnList/index'),
        meta: { title: '退货列表', icon: 'return-manage' }
      }
    ]
  },

  {
    path: '/payable',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Payable',
        component: () => import('@/views/PayableList/index'),
        meta: { title: '应收列表', icon: 'payable-manage' }
      }
    ]
  },

  {
    path: '/pdetail',
    component: detailLayout,
    redirect: '/pdetail/puchaseDetail',
    hidden: true,
    children: [
      {
        path: 'puchaseDetail',
        name: 'PuchaseDetail',
        component: () => import('@/views/PuchaseList/puchase-detail'),
        meta: { title: '采购详情' }
      },
      {
        path: 'plansendDetail',
        name: 'PlansendDetail',
        component: () => import('@/views/PlanSend/plansend-detail'),
        meta: { title: '计划详情' }
      },
      {
        path: 'deliveryDetail',
        name: 'DeliveryDetail',
        component: () => import('@/views/DeliveryList/delivery-detail'),
        meta: { title: '交货详情' }
      },
      {
        path: 'returnDetail',
        name: 'ReturnDetail',
        component: () => import('@/views/ReturnList/return-detail'),
        meta: { title: '退货详情' }
      },
      {
        path: 'payableDetail',
        name: 'PayableDetail',
        component: () => import('@/views/PayableList/payable-detail'),
        meta: { title: '应收详情' }
      }
    ]
  },

  /* {
    path: '/price',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Price',
        component: () => import('@/views/PriceList/index'),
        meta: { title: '价格列表', icon: 'form' }
      }
    ]
  }, */

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
