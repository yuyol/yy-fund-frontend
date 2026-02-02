import { useState, useCallback, useMemo } from "react"
import { Search, TrendingUp, Sparkles, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import {
  getFundRealtimeEstimate,
  parseFundCodes,
  isValidFundCode,
  type FundRealtimeEstimate,
} from "@/api/fund"
import { FundCard, type FundCardData, type FundCardStatus } from "@/components/FundCard"
import type { StockContribution } from "@/components/ContributionTable"

// 单个基金的状态
interface FundState {
  code: string
  status: FundCardStatus
  data?: FundCardData
  errorMessage?: string
}

export default function Home() {
  const [fundInput, setFundInput] = useState("")
  const [fundStates, setFundStates] = useState<Map<string, FundState>>(new Map())
  const [isQuerying, setIsQuerying] = useState(false)

  // 解析并校验输入
  const parsedCodes = useMemo(() => parseFundCodes(fundInput), [fundInput])
  const invalidCodes = useMemo(
    () => parsedCodes.filter((code) => !isValidFundCode(code)),
    [parsedCodes]
  )
  const validCodes = useMemo(
    () => parsedCodes.filter((code) => isValidFundCode(code)),
    [parsedCodes]
  )

  // 转换 API 响应为组件数据
  const transformApiData = (item: FundRealtimeEstimate): FundCardData => {
    const contributions: StockContribution[] = item.contributions.map((c) => ({
      stockCode: c.stockCode,
      stockName: c.stockName,
      weight: c.ratio,
      change: c.changePercent,
      contribution: c.contribution,
    }))

    return {
      fundCode: item.fundCode,
      fundName: item.fundName,
      estimatedChange: item.estimatedChange,
      totalPositionRatio: item.totalPositionRatio,
      positionDate: item.positionDate,
      contributions,
      updateTime: new Date().toLocaleString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    }
  }

  // 批量查询
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (validCodes.length === 0) {
        return
      }

      setIsQuerying(true)

      // 初始化所有基金为 loading 状态
      const newStates = new Map<string, FundState>()
      validCodes.forEach((code) => {
        newStates.set(code, { code, status: "loading" })
      })
      setFundStates(newStates)

      try {
        const funds = validCodes.map((code) => ({ code }))
        const results = await getFundRealtimeEstimate(funds)

        // 更新成功的基金状态
        const updatedStates = new Map<string, FundState>()
        validCodes.forEach((code) => {
          const result = results.find((r) => r.fundCode === code)
          if (result) {
            updatedStates.set(code, {
              code,
              status: "success",
              data: transformApiData(result),
            })
          } else {
            updatedStates.set(code, {
              code,
              status: "error",
              errorMessage: "未找到该基金数据",
            })
          }
        })
        setFundStates(updatedStates)
      } catch (error) {
        // 整体请求失败，所有基金标记为错误
        const errorMessage =
          error instanceof Error ? error.message : "查询失败，请稍后重试"
        const errorStates = new Map<string, FundState>()
        validCodes.forEach((code) => {
          errorStates.set(code, {
            code,
            status: "error",
            errorMessage,
          })
        })
        setFundStates(errorStates)
      } finally {
        setIsQuerying(false)
      }
    },
    [validCodes]
  )

  // 单个基金重试
  const handleRetry = useCallback(
    async (code: string) => {
      setFundStates((prev) => {
        const newStates = new Map(prev)
        newStates.set(code, { code, status: "loading" })
        return newStates
      })

      try {
        const results = await getFundRealtimeEstimate([{ code }])
        const result = results.find((r) => r.fundCode === code)

        setFundStates((prev) => {
          const newStates = new Map(prev)
          if (result) {
            newStates.set(code, {
              code,
              status: "success",
              data: transformApiData(result),
            })
          } else {
            newStates.set(code, {
              code,
              status: "error",
              errorMessage: "未找到该基金数据",
            })
          }
          return newStates
        })
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "查询失败，请稍后重试"
        setFundStates((prev) => {
          const newStates = new Map(prev)
          newStates.set(code, {
            code,
            status: "error",
            errorMessage,
          })
          return newStates
        })
      }
    },
    []
  )

  // 示例点击
  const handleExampleClick = (codes: string) => {
    setFundInput(codes)
  }

  // 获取有序的基金状态列表
  const orderedFundStates = useMemo(() => {
    const states: FundState[] = []
    fundStates.forEach((state) => states.push(state))
    return states
  }, [fundStates])

  const hasResults = orderedFundStates.length > 0
  const isIdle = !hasResults && !isQuerying

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 dark:from-blue-500/5 dark:to-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-400/10 to-cyan-400/10 dark:from-emerald-500/5 dark:to-cyan-500/5 rounded-full blur-3xl" />
      </div>

      {/* 主题切换按钮 */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* 主内容区 */}
      <main className="relative container mx-auto px-4 py-10 md:py-16 max-w-3xl">
        {/* 标题区域 */}
        <header className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="relative">
              <TrendingUp
                className="size-8 text-blue-600 dark:text-blue-400"
                strokeWidth={2.5}
              />
              <Sparkles className="absolute -top-1 -right-1 size-3 text-amber-500" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent tracking-tight">
              YY Fund 基金实时涨幅估算
            </h1>
          </div>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            基于基金近几期公开持仓，按股票实时涨跌加权计算基金的估算实时涨幅
          </p>
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 max-w-lg mx-auto">
            <AlertTriangle className="inline size-3 mr-1 -mt-0.5" />
            本工具提供的涨跌幅为估算值，仅供参考，不构成投资建议。适用于 A 股股票型基金，暂不适用于其他例如 ETF，港股，美股等基金。
          </p>
        </header>

        {/* 搜索输入区 */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl p-4 md:p-5 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200/50 dark:border-slate-800/50">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <textarea
                  placeholder="输入基金代码，支持空格/逗号/斜杠分隔，最多 5 个&#10;例如：018125, 022364, 005827"
                  value={fundInput}
                  onChange={(e) => setFundInput(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 text-sm md:text-base bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-muted-foreground/60"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={isQuerying || validCodes.length === 0}
                className="h-auto px-5 md:px-6 font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20"
              >
                <Search className="size-4 text-white" />
                <span className="hidden sm:inline ml-1 text-white">查询</span>
              </Button>
            </div>

            {/* 输入状态提示 */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
              {/* 已识别的代码 */}
              {parsedCodes.length > 0 && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <span>已识别：</span>
                  <div className="flex flex-wrap gap-1">
                    {parsedCodes.map((code) => (
                      <span
                        key={code}
                        className={`font-mono px-1.5 py-0.5 rounded ${
                          isValidFundCode(code)
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                        }`}
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 无效代码提示 */}
              {invalidCodes.length > 0 && (
                <span className="text-red-500 dark:text-red-400">
                  {invalidCodes.length} 个代码格式无效（需为6位数字）
                </span>
              )}

              {/* 超出限制提示 */}
              {parsedCodes.length > 5 && (
                <span className="text-amber-600 dark:text-amber-400">
                  最多支持 5 个基金，已截取前 5 个
                </span>
              )}
            </div>

            {/* 示例提示 */}
            <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>快速示例：</span>
              <button
                type="button"
                onClick={() => handleExampleClick("018125")}
                className="font-mono px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                单基金
              </button>
              <button
                type="button"
                onClick={() => handleExampleClick("018125, 022364, 005827")}
                className="font-mono px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                多基金对比
              </button>
            </div>
          </div>
        </form>

        {/* 结果展示区 */}
        {hasResults && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 结果统计 */}
            <div className="flex items-center justify-between px-1 mb-4">
              <h2 className="text-sm font-medium text-muted-foreground">
                查询结果（{orderedFundStates.length} 只基金）
              </h2>
              <span className="text-xs text-muted-foreground/70">
                点击卡片展开持仓详情
              </span>
            </div>

            {/* 基金卡片列表 */}
            {orderedFundStates.map((state, index) => (
              <div
                key={state.code}
                className="animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <FundCard
                  code={state.code}
                  data={state.data}
                  status={state.status}
                  errorMessage={state.errorMessage}
                  onRetry={() => handleRetry(state.code)}
                />
              </div>
            ))}
          </div>
        )}

        {/* 空状态提示 */}
        {isIdle && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center size-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200/50 dark:from-slate-800 dark:to-slate-700/50 mb-5 shadow-inner">
              <Search className="size-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground text-sm mb-2">
              输入基金代码开始查询
            </p>
            <p className="text-muted-foreground/60 text-xs">
              支持同时查询多只基金，快速对比估算涨幅
            </p>
          </div>
        )}
      </main>

      {/* 底部免责声明 */}
      <footer className="relative container mx-auto px-4 pb-8 max-w-3xl">
        <div className="text-center text-xs text-muted-foreground/60 leading-relaxed border-t border-border/30 pt-6">
          <p className="mb-1">
            <strong className="text-muted-foreground/80">风险提示：</strong>
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
