import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken, setToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['Authorization'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data

    // if the custom code is not 20000, it is judged as an error.
    if (res.code !== 200) {
      // 401:未登录;
      if (res.code === 401) {
        MessageBox.confirm('您当前的账户已退出，请您重新登录', '当前账号已退出', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          confirmButtonClass: 'logout-confirm-btn',
          cancelButtonClass: 'logout-cancel-btn',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()// 为了重新实例化vue-router对象 避免bug
          })
        })
      }
      Message({
        message: res.message || '出现错误，请稍后再试',
        type: 'error',
        duration: 3 * 1000
      })
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject('error')
    } else {
      // 定时刷新access-token
      if (response.config.url !== '/shenyi-admin/admin/refreshToken' && response.config.url !== '/shenyi-admin/admin/login') {
        axios.post(process.env.VUE_APP_BASE_API + '/shenyi-admin/admin/refreshToken', null, {
          headers: {
            'Authorization': getToken() // 也是在本地中拿到token
          }
        }).then(res => {
          if (res.data.code === 200) {
            setToken(res.data.data.tokenHead + res.data.data.token)
          }
        })
      }
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message || '出现错误，请稍后再试',
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
