import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon?: React.ReactNode
  tooltip?: string
  className?: string
}

export function StatCard({ title, value, change, icon, tooltip, className }: StatCardProps) {
  return (
    <Card className={cn("w-36 aspect-square shrink-0", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          {icon && <div className="text-muted-foreground">{icon}</div>}
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Info className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  <p>{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        <div className="text-2xl font-bold text-foreground leading-none">{value}</div>
        {change !== undefined && (
          <Badge className={change > 0 ? "bg-brand-accent-gold" : "bg-brand-accent-coral"}>
            {change > 0 ? "+" : ""}{change}%
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
