import request from '@/utils/request1'

export function purchaseOrder(params) {
  return request({
    url: '/purchaseOrder/query',
    method: 'get',
    params: params
  })
}
export function purchaseDetail(params) {
  return request({
    url: '/purchaseOrder/detail/' + params.id,
    method: 'get'
  })
}

// 供应商接单
export function purchaseAccept(data) {
  return request({
    url: '/purchaseOrder/accept',
    method: 'post',
    data
  })
}

// 供应商拒单
export function purchaseRefuse(data) {
  return request({
    url: '/purchaseOrder/refuse',
    method: 'post',
    data
  })
}

// 根据详情id列表查询详情
export function puchaseListDetail(data) {
  return request({
    url: '/purchaseOrder/listDetail',
    method: 'post',
    data
  })
}

