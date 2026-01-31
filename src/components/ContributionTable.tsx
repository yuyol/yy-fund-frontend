import { cn } from "@/lib/utils"

export interface StockContribution {
  stockCode: string
  stockName: string
  weight: number // 持仓权重，百分比
  change: number // 股票涨跌幅，百分比
  contribution: number // 对基金涨跌的贡献，百分比
}

interface ContributionTableProps {
  data: StockContribution[]
  title?: string
}

export function ContributionTable({
  data,
  title = "持仓贡献拆解 Top 5",
}: ContributionTableProps) {
  return (
    <div className="w-full">
      <h3 className="text-sm font-medium text-muted-foreground mb-4 tracking-wide">
        {title}
      </h3>
      <div className="overflow-hidden rounded-lg border border-border/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30">
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                股票
              </th>
              <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                持仓占比
              </th>
              <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                实时涨跌
              </th>
              <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                贡献
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const isPositive = item.change > 0
              const isNegative = item.change < 0
              const changeColor = isPositive
                ? "text-[#dc2626]"
                : isNegative
                ? "text-[#16a34a]"
                : "text-muted-foreground"

              const contributionColor =
                item.contribution > 0
                  ? "text-[#dc2626]"
                  : item.contribution < 0
                  ? "text-[#16a34a]"
                  : "text-muted-foreground"

              const sign = (val: number) => (val > 0 ? "+" : "")

              return (
                <tr
                  key={item.stockCode}
                  className={cn(
                    "border-t border-border/30 transition-colors hover:bg-muted/20",
                    index % 2 === 0 ? "bg-transparent" : "bg-muted/10"
                  )}
                >
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {item.stockName}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {item.stockCode}
                      </span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 font-mono text-foreground">
                    {item.weight.toFixed(2)}%
                  </td>
                  <td
                    className={cn(
                      "text-right py-3 px-4 font-mono font-medium",
                      changeColor
                    )}
                  >
                    {sign(item.change)}
                    {item.change.toFixed(2)}%
                  </td>
                  <td
                    className={cn(
                      "text-right py-3 px-4 font-mono font-medium",
                      contributionColor
                    )}
                  >
                    {sign(item.contribution)}
                    {item.contribution.toFixed(3)}%
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// 加载态骨架屏
export function ContributionTableSkeleton() {
  return (
    <div className="w-full">
      <div className="h-4 w-32 bg-muted animate-pulse rounded mb-4" />
      <div className="overflow-hidden rounded-lg border border-border/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30">
              <th className="text-left py-3 px-4">
                <div className="h-3 w-8 bg-muted animate-pulse rounded" />
              </th>
              <th className="text-right py-3 px-4">
                <div className="h-3 w-12 bg-muted animate-pulse rounded ml-auto" />
              </th>
              <th className="text-right py-3 px-4">
                <div className="h-3 w-12 bg-muted animate-pulse rounded ml-auto" />
              </th>
              <th className="text-right py-3 px-4">
                <div className="h-3 w-8 bg-muted animate-pulse rounded ml-auto" />
              </th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, index) => (
              <tr key={index} className="border-t border-border/30">
                <td className="py-3 px-4">
                  <div className="space-y-1">
                    <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-14 bg-muted animate-pulse rounded" />
                  </div>
                </td>
                <td className="text-right py-3 px-4">
                  <div className="h-4 w-12 bg-muted animate-pulse rounded ml-auto" />
                </td>
                <td className="text-right py-3 px-4">
                  <div className="h-4 w-14 bg-muted animate-pulse rounded ml-auto" />
                </td>
                <td className="text-right py-3 px-4">
                  <div className="h-4 w-14 bg-muted animate-pulse rounded ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
