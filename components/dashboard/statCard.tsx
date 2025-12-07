import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon?: React.ReactNode
}

export function StatCard({ title, value, change, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {change !== undefined && (
          <Badge 
            className={change > 0 ? "bg-brand-accent-gold" : "bg-brand-accent-coral"}
          >
            {change > 0 ? "+" : ""}{change}%
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}