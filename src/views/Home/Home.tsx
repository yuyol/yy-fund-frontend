import { useState, useCallback } from "react"
import { Search, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  FundResult,
  FundResultSkeleton,
  type FundResultData,
} from "@/components/FundResult"
import {
  ContributionTable,
  ContributionTableSkeleton,
  type StockContribution,
} from "@/components/ContributionTable"

// 模拟数据 - 实际使用时替换为 API 调用
const mockFundData: FundResultData = {
  fundCode: "110011",
  fundName: "易方达中小盘混合",
  estimatedChange: 1.23,
  disclosureDate: "2025-12-31",
  stockPositionRatio: 89.56,
  updateTime: "2026-01-31 14:35:22",
}

const mockContributions: StockContribution[] = [
  {
    stockCode: "600519",
    stockName: "贵州茅台",
    weight: 9.82,
    change: 2.15,
    contribution: 0.211,
  },
  {
    stockCode: "000858",
    stockName: "五粮液",
    weight: 7.45,
    change: 1.88,
    contribution: 0.14,
  },
  {
    stockCode: "000333",
    stockName: "美的集团",
    weight: 6.21,
    change: -0.56,
    contribution: -0.035,
  },
  {
    stockCode: "601318",
    stockName: "中国平安",
    weight: 5.89,
    change: 0.92,
    contribution: 0.054,
  },
  {
    stockCode: "600036",
    stockName: "招商银行",
    weight: 5.12,
    change: 1.35,
    contribution: 0.069,
  },
]

type QueryState = "idle" | "loading" | "success" | "error"

export default function Home() {
  const [fundInput, setFundInput] = useState("")
  const [queryState, setQueryState] = useState<QueryState>("idle")
  const [fundData, setFundData] = useState<FundResultData | null>(null)
  const [contributions, setContributions] = useState<StockContribution[]>([])
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!fundInput.trim()) {
        return
      }

      setQueryState("loading")
      setErrorMessage("")

      // 模拟 API 调用延迟
      try {
        await new Promise((resolve) => setTimeout(resolve, 1200))

        // 模拟成功响应
        setFundData({
          ...mockFundData,
          fundCode: fundInput.match(/^\d{6}$/) ? fundInput : mockFundData.fundCode,
        })
        setContributions(mockContributions)
        setQueryState("success")
      } catch {
        setErrorMessage("查询失败，请稍后重试")
        setQueryState("error")
      }
    },
    [fundInput]
  )

  const handleExampleClick = (code: string) => {
    setFundInput(code)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* 主内容区 */}
      <main className="container mx-auto px-4 py-12 md:py-20 max-w-2xl">
        {/* 标题区域 */}
        <header className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 mb-4">
            <TrendingUp className="size-7 text-primary" strokeWidth={2.5} />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              基金实时涨幅估算
            </h1>
          </div>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-lg mx-auto">
            基于基金最近一期公开持仓，按股票实时涨跌加权计算基金的估算实时涨幅
          </p>
        </header>

        {/* 搜索输入区 */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="输入基金代码或名称，如 110011"
                value={fundInput}
                onChange={(e) => setFundInput(e.target.value)}
                className="pr-4 h-12 text-base bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={queryState === "loading" || !fundInput.trim()}
              className="h-12 px-6 font-medium"
            >
              <Search className="size-4" />
              <span className="hidden sm:inline">查询</span>
            </Button>
          </div>

          {/* 示例提示 */}
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span>示例：</span>
            <button
              type="button"
              onClick={() => handleExampleClick("110011")}
              className="font-mono hover:text-foreground transition-colors underline underline-offset-2"
            >
              110011
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => handleExampleClick("161725")}
              className="font-mono hover:text-foreground transition-colors underline underline-offset-2"
            >
              161725
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => handleExampleClick("005827")}
              className="font-mono hover:text-foreground transition-colors underline underline-offset-2"
            >
              005827
            </button>
          </div>
        </form>

        {/* 错误提示 */}
        {queryState === "error" && errorMessage && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">
            {errorMessage}
          </div>
        )}

        {/* 加载态 */}
        {queryState === "loading" && (
          <div className="space-y-6">
            <FundResultSkeleton />
            <ContributionTableSkeleton />
          </div>
        )}

        {/* 结果展示 */}
        {queryState === "success" && fundData && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <FundResult data={fundData} />
            {contributions.length > 0 && (
              <ContributionTable data={contributions} />
            )}
          </div>
        )}

        {/* 空状态提示 */}
        {queryState === "idle" && (
          <div className="text-center py-16 text-muted-foreground">
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-muted/50 mb-4">
              <Search className="size-7 text-muted-foreground/60" />
            </div>
            <p className="text-sm">输入基金代码开始查询</p>
          </div>
        )}
      </main>

      {/* 底部免责声明 */}
      <footer className="container mx-auto px-4 pb-8 max-w-2xl">
        <div className="text-center text-xs text-muted-foreground/70 leading-relaxed border-t border-border/30 pt-6">
          <p className="mb-1">
            <strong className="text-muted-foreground">风险提示：</strong>
            本工具提供的涨跌幅为基于公开持仓数据的估算值，仅供参考，不构成任何投资建议。
          </p>
          <p>
            实际净值以基金公司公布为准。持仓数据来源于基金定期报告，可能存在时滞。
          </p>
        </div>
      </footer>
    </div>
  )
}
