import request from '@/utils/request1'

// 发货列表
export function materialQuery(data) {
  return request({
    url: '/material/query',
    method: 'post',
    data
  })
}
