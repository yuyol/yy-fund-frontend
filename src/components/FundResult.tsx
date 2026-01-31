import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface FundResultData {
  fundCode: string
  fundName: string
  estimatedChange: number // 估算涨跌幅，百分比
  disclosureDate: string // 持仓披露日期
  stockPositionRatio: number // 股票仓位占比，百分比
  updateTime: string // 数据更新时间
}

interface FundResultProps {
  data: FundResultData
}

export function FundResult({ data }: FundResultProps) {
  const isPositive = data.estimatedChange > 0
  const isNegative = data.estimatedChange < 0

  const changeColor = isPositive
    ? "text-[#dc2626]" // 红色表示涨
    : isNegative
    ? "text-[#16a34a]" // 绿色表示跌
    : "text-muted-foreground"

  const changeBgColor = isPositive
    ? "bg-red-50 dark:bg-red-950/30"
    : isNegative
    ? "bg-green-50 dark:bg-green-950/30"
    : "bg-muted/50"

  const sign = isPositive ? "+" : ""

  return (
    <Card className="w-full border-0 shadow-lg">
      <CardContent className="p-6 md:p-8">
        {/* 基金基本信息 */}
        <div className="mb-6 flex items-baseline gap-3">
          <span className="font-mono text-sm text-muted-foreground tracking-wider">
            {data.fundCode}
          </span>
          <h2 className="text-lg font-medium text-foreground truncate">
            {data.fundName}
          </h2>
        </div>

        {/* 核心指标 - 估算实时涨幅 */}
        <div
          className={cn(
            "rounded-xl p-6 md:p-8 text-center mb-6",
            changeBgColor
          )}
        >
          <div className="text-sm text-muted-foreground mb-2 tracking-wide">
            估算实时涨幅
          </div>
          <div
            className={cn(
              "font-mono text-5xl md:text-6xl font-bold tracking-tight",
              changeColor
            )}
          >
            {sign}
            {data.estimatedChange.toFixed(2)}%
          </div>
        </div>

        {/* 数据依据与可信度信息 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground">持仓披露日期</div>
            <div className="font-medium text-foreground">
              {data.disclosureDate}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">股票仓位占比</div>
            <div className="font-medium text-foreground">
              {data.stockPositionRatio.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* 更新时间 */}
        <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground text-center">
          数据更新时间：{data.updateTime}
        </div>
      </CardContent>
    </Card>
  )
}

// 加载态骨架屏
export function FundResultSkeleton() {
  return (
    <Card className="w-full border-0 shadow-lg">
      <CardContent className="p-6 md:p-8">
        <div className="mb-6 flex items-baseline gap-3">
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          <div className="h-5 w-40 bg-muted animate-pulse rounded" />
        </div>

        <div className="rounded-xl bg-muted/50 p-6 md:p-8 text-center mb-6">
          <div className="h-4 w-24 bg-muted animate-pulse rounded mx-auto mb-4" />
          <div className="h-14 w-48 bg-muted animate-pulse rounded mx-auto" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-3 w-20 bg-muted animate-pulse rounded" />
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-20 bg-muted animate-pulse rounded" />
            <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
