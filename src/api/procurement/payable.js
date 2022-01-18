import request from '@/utils/request1'

// 应付列表
export function payableOrder(params) {
  return request({
    url: '/payableOrder/query',
    method: 'get',
    params: params
  })
}

// 供应商详情确认
export function confirmByDetail(data) {
  return request({
    url: '/payableOrder/confirmByDetail',
    method: 'post',
    data
  })
}

// 供应商订单列表确认
export function confirmByOrder(data) {
  return request({
    url: '/payableOrder/confirmByOrder',
    method: 'post',
    data
  })
}

// 应付列表
export function queryDetail(data) {
  return request({
    url: '/payableOrder/queryDetail',
    method: 'post',
    data
  })
}

// 应付详情
export function payableDetail(data) {
  return request({
    url: '/payableOrder/detail/' + data.id,
    method: 'get'
  })
}

// 开票
export function invoiceSave(data) {
  return request({
    url: '/invoice/save',
    method: 'post',
    data
  })
}
