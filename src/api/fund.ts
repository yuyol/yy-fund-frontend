import request, { type ApiResponse } from "@/lib/request"

// 持仓贡献详情
export interface ContributionItem {
  stockCode: string
  stockName: string
  ratio: number // 持仓比例 (%)
  changePercent: number // 实时涨跌 (%)
  contribution: number // 贡献 (%)
}

// 基金实时估算数据
export interface FundRealtimeEstimate {
  fundCode: string
  fundName: string
  estimatedChange: number // 估算实时涨幅 (%)
  totalPositionRatio: number // 参与计算的仓位占比 (%)
  positionDate: string // 持仓披露日期
  contributions: ContributionItem[] // 持仓贡献详情
}

// 批量查询请求参数
export interface FundQueryItem {
  code: string
}

/**
 * 批量获取基金实时估算涨幅
 * @param funds 基金代码列表
 */
export async function getFundRealtimeEstimate(
  funds: FundQueryItem[]
): Promise<FundRealtimeEstimate[]> {
  const response = await request.post<ApiResponse<FundRealtimeEstimate[]>>(
    "/fund/realtime-estimate",
    { funds }
  )
  return response.data.data
}

/**
 * 解析用户输入的基金代码字符串
 * 支持空格、逗号、斜杠分隔
 * @param input 用户输入
 * @returns 基金代码数组（去重，最多5个）
 */
export function parseFundCodes(input: string): string[] {
  const codes = input
    .split(/[\s,，/、]+/)
    .map((code) => code.trim())
    .filter((code) => code.length > 0)
  
  // 去重并限制最多5个
  const uniqueCodes = [...new Set(codes)]
  return uniqueCodes.slice(0, 5)
}

/**
 * 校验基金代码格式
 * @param code 基金代码
 * @returns 是否有效
 */
export function isValidFundCode(code: string): boolean {
  // 基金代码通常为6位数字
  return /^\d{6}$/.test(code)
}
