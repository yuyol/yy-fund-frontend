import { useState } from "react"
import { ChevronDown, ChevronUp, AlertCircle, RefreshCw, Plus, X, History, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  ContributionTable,
  type StockContribution,
} from "@/components/ContributionTable"

export type FundCardStatus = "idle" | "loading" | "success" | "error"
export type FundCardZone = "snapshot" | "refresh"

export interface FundCardData {
  fundCode: string
  fundName: string
  estimatedChange: number
  totalPositionRatio: number
  positionDate: string
  contributions: StockContribution[]
  updateTime: string
}

interface FundCardProps {
  code: string
  data?: FundCardData
  status: FundCardStatus
  errorMessage?: string
  onRetry?: () => void
  // 新增：区分快照区和刷新区
  zone?: FundCardZone
  // 新增：加入刷新区操作
  onAddToRefresh?: () => void
  // 新增：从刷新区移除操作
  onRemoveFromRefresh?: () => void
  // 新增：刷新区是否已满
  isRefreshFull?: boolean
}

export function FundCard({
  code,
  data,
  status,
  errorMessage,
  onRetry,
  zone = "refresh",
  onAddToRefresh,
  onRemoveFromRefresh,
  isRefreshFull = false,
}: FundCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const isSnapshot = zone === "snapshot"
  const isRefresh = zone === "refresh"

  // 加载中状态
  if (status === "loading") {
    return <FundCardSkeleton code={code} />
  }

  // 错误状态
  if (status === "error") {
    return (
      <Card className={cn(
        "w-full border-0 shadow-md bg-card/80 backdrop-blur-sm overflow-hidden",
        isSnapshot && "opacity-80"
      )}>
        <CardContent className="p-4 md:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-lg bg-red-100 dark:bg-red-950/50">
                <AlertCircle className="size-5 text-red-500" />
              </div>
              <div>
                <div className="font-mono text-sm text-muted-foreground">
                  {code}
                </div>
                <div className="text-sm text-red-500 dark:text-red-400 mt-0.5">
                  {errorMessage || "查询失败"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* 快照区：加入刷新区按钮 */}
              {isSnapshot && onAddToRefresh && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAddToRefresh}
                  disabled={isRefreshFull}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50"
                  title={isRefreshFull ? "刷新区已满（最多5个）" : "加入刷新区"}
                >
                  <Plus className="size-4 mr-1" />
                  加入刷新区
                </Button>
              )}
              {/* 刷新区：重试和移除按钮 */}
              {isRefresh && (
                <>
                  {onRetry && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onRetry}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <RefreshCw className="size-4 mr-1" />
                      重试
                    </Button>
                  )}
                  {onRemoveFromRefresh && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={onRemoveFromRefresh}
                      className="text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50"
                      title="从刷新区移除"
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 空数据状态
  if (!data) {
    return null
  }

  const isPositive = data.estimatedChange > 0
  const isNegative = data.estimatedChange < 0

  const changeColor = isPositive
    ? "text-[#dc2626]"
    : isNegative
    ? "text-[#16a34a]"
    : "text-muted-foreground"

  const changeBgColor = isPositive
    ? "bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/40 dark:to-red-900/20"
    : isNegative
    ? "bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/40 dark:to-green-900/20"
    : "bg-muted/30"

  const sign = isPositive ? "+" : ""

  return (
    <Card
      className={cn(
        "w-full border-0 shadow-md bg-card/80 backdrop-blur-sm overflow-hidden transition-all duration-300 relative",
        isExpanded && "shadow-lg",
        isSnapshot && "opacity-85 hover:opacity-100"
      )}
    >
      {/* 区域标识 - 放在卡片顶部 */}
      {isSnapshot && (
        <div className="absolute top-2 left-2 z-10">
          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300">
            <History className="size-2.5" />
            快照
          </span>
        </div>
      )}
      {isRefresh && (
        <div className="absolute top-2 left-2 z-10">
          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100/80 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300">
            <Zap className="size-2.5" />
            可刷新
          </span>
        </div>
      )}

      <CardContent className="p-0">
        {/* 卡片头部 - 可点击展开/收起 */}
        <div className="w-full p-4 md:p-5 flex items-center gap-4 text-left pt-8">

          {/* 可点击区域 - 展开/收起 */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-4 flex-1 min-w-0 hover:bg-muted/30 -m-4 p-4 rounded-lg transition-colors"
          >
            {/* 涨跌幅指示器 */}
            <div
              className={cn(
                "flex-shrink-0 flex items-center justify-center w-20 h-14 md:w-24 md:h-16 rounded-xl",
                changeBgColor
              )}
            >
              <span
                className={cn(
                  "font-mono text-xl md:text-2xl font-bold tracking-tight",
                  changeColor
                )}
              >
                {sign}
                {data.estimatedChange.toFixed(2)}%
              </span>
            </div>

            {/* 基金信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-mono text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                  {data.fundCode}
                </span>
                <h3 className="text-sm md:text-base font-medium text-foreground truncate">
                  {data.fundName}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>仓位 {data.totalPositionRatio.toFixed(1)}%</span>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline">{data.positionDate}</span>
                <span className="hidden md:inline">·</span>
                <span className="hidden md:inline text-muted-foreground/70">
                  更新于 {data.updateTime}
                </span>
              </div>
            </div>

            {/* 展开/收起图标 */}
            <div className="flex-shrink-0 text-muted-foreground">
              {isExpanded ? (
                <ChevronUp className="size-5" />
              ) : (
                <ChevronDown className="size-5" />
              )}
            </div>
          </button>

          {/* 操作按钮区域 */}
          <div className="flex-shrink-0 flex items-center gap-1">
            {/* 快照区：加入刷新区按钮 */}
            {isSnapshot && onAddToRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onAddToRefresh}
                disabled={isRefreshFull}
                className={cn(
                  "text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50",
                  isRefreshFull && "opacity-50 cursor-not-allowed"
                )}
                title={isRefreshFull ? "刷新区已满（最多5个）" : "加入刷新区"}
              >
                <Plus className="size-4" />
                <span className="hidden sm:inline ml-1">加入刷新区</span>
              </Button>
            )}
            {/* 刷新区：移除按钮 */}
            {isRefresh && onRemoveFromRefresh && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onRemoveFromRefresh}
                className="text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50"
                title="从刷新区移除"
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
        </div>

        {/* 展开的详情内容 */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="px-4 pb-4 md:px-5 md:pb-5 pt-0">
            <div className="border-t border-border/50 pt-4">
              {/* 移动端显示更多信息 */}
              <div className="sm:hidden mb-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>持仓日期：{data.positionDate}</span>
                <span>更新：{data.updateTime}</span>
              </div>

              {/* 持仓贡献表格 */}
              {data.contributions.length > 0 && (
                <ContributionTable data={data.contributions} />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 加载态骨架屏
function FundCardSkeleton({ code }: { code: string }) {
  return (
    <Card className="w-full border-0 shadow-md bg-card/80 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-4 md:p-5">
        <div className="flex items-center gap-4">
          {/* 涨跌幅占位 */}
          <div className="flex-shrink-0 w-20 h-14 md:w-24 md:h-16 rounded-xl bg-muted/50 animate-pulse" />

          {/* 信息占位 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-mono text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                {code}
              </span>
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-3 w-16 bg-muted animate-pulse rounded" />
              <div className="h-3 w-20 bg-muted animate-pulse rounded hidden sm:block" />
            </div>
          </div>

          {/* 图标占位 */}
          <div className="flex-shrink-0 size-5 bg-muted animate-pulse rounded" />
        </div>
      </CardContent>
    </Card>
  )
}

// 批量加载骨架屏
export function FundCardListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <FundCardSkeleton key={index} code="------" />
      ))}
    </div>
  )
}
