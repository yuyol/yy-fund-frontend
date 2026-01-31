import axios, { type AxiosResponse, type AxiosError } from "axios"

// 创建 axios 实例
const request = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// 响应数据类型
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 可以在这里添加 token 等认证信息
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response
    // 业务错误处理
    if (data.code !== 200) {
      return Promise.reject(new Error(data.message || "请求失败"))
    }
    return response
  },
  (error: AxiosError<ApiResponse>) => {
    // HTTP 错误处理
    const message =
      error.response?.data?.message ||
      error.message ||
      "网络错误，请稍后重试"
    return Promise.reject(new Error(message))
  }
)

export default request
