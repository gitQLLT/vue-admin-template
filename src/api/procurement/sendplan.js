import request from '@/utils/request1'

export function deliveryPlan(params) {
  return request({
    url: '/deliveryPlan/query',
    method: 'get',
    params: params
  })
}

export function planDetail(params) {
  return request({
    url: '/deliveryPlan/detail/' + params.id,
    method: 'get'
  })
}

// 根据详情id列表查询详情
export function listDetail(data) {
  return request({
    url: '/deliveryPlan/listDetail',
    method: 'post',
    data
  })
}

export function planSave(data) {
  return request({
    url: '/deliveryPlan/save',
    method: 'get',
    data
  })
}
