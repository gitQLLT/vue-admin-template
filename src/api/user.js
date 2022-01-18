import request from '@/utils/request'

export function login(username, password) {
  return request({
    url: '/shenyi-admin/admin/login',
    method: 'post',
    data: {
      username,
      password,
      'clientId': 'admin-pc'
    }
  })
}

export function getInfo(token) {
  return request({
    url: '/shenyi-admin/admin/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/shenyi-admin/admin/logout',
    method: 'post'
  })
}
