import request from '@/utils/request1'

// 退货列表
export function returnOrder(params) {
  return request({
    url: '/returnOrder/query',
    method: 'get',
    params
  })
}
