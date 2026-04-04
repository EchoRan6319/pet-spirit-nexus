const BASE_URL = 'http://localhost:3000'

function request(options) {
  return new Promise((resolve, reject) => {
    const userId = uni.getStorageSync('userId') || ''
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...options.header,
        ...(userId ? { userId } : {})
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          uni.showToast({
            title: res.data?.message || '请求失败',
            icon: 'none'
          })
          reject(res)
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '网络异常,请稍后重试',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

export function get(url, data = {}) {
  return request({ url, data, method: 'GET' })
}

export function post(url, data = {}) {
  return request({ url, data, method: 'POST' })
}
