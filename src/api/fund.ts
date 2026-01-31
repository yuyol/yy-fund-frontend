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

/**
 * 获取基金实时估算涨幅
 * @param code 基金代码
 */
export async function getFundRealtimeEstimate(
  code: string
): Promise<FundRealtimeEstimate> {
  const response = await request.get<ApiResponse<FundRealtimeEstimate>>(
    "/fund/realtime-estimate",
    {
      params: { code },
    }
  )
  return response.data.data
}
