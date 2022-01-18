import request from '@/utils/request1'

export function deliveryOrder(params) {
  return request({
    url: '/deliveryOrder/query',
    method: 'get',
    params: params
  })
}

export function deliveryDetail(params) {
  return request({
    url: '/deliveryOrder/detail/' + params.id,
    method: 'get'
  })
}

// 保存发货
export function deliverySave(data) {
  return request({
    url: '/deliveryOrder/save',
    method: 'post',
    data
  })
}

// 查看交货详情
export function simpleDetail(data) {
  return request({
    url: '/deliveryOrder/simpleDetail',
    method: 'post',
    data
  })
}
